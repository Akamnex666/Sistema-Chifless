import { ApolloClient, InMemoryCache, HttpLink, ApolloLink, Observable, FetchResult } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import authService from './authService';

// Helper para obtener el token actual de localStorage
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
};

// Variable para evitar múltiples refresh simultáneos
let isRefreshing = false;
let pendingRequests: Array<() => void> = [];

const resolvePendingRequests = () => {
  pendingRequests.forEach((callback) => callback());
  pendingRequests = [];
};

// Error link para manejar errores de autenticación
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      // Detectar errores de autenticación
      if (err.extensions?.code === 'UNAUTHENTICATED' || 
          err.message.includes('401') || 
          err.message.includes('Unauthorized') ||
          err.message.includes('Token')) {
        
        const { refreshToken } = authService.getTokens();
        
        if (!refreshToken) {
          // No hay refresh token, redirigir al login
          authService.clearTokens();
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
          return;
        }

        // Si ya estamos refrescando, encolar esta petición
        if (isRefreshing) {
          return new Observable<FetchResult>((observer) => {
            pendingRequests.push(() => {
              const subscriber = forward(operation).subscribe(observer);
              return () => subscriber.unsubscribe();
            });
          });
        }

        isRefreshing = true;

        return new Observable<FetchResult>((observer) => {
          authService.refresh(refreshToken)
            .then((refreshResponse) => {
              const newAccessToken = refreshResponse.accessToken;
              
              // Guardar nuevo token
              authService.saveTokens({
                accessToken: newAccessToken,
                refreshToken: refreshToken,
                accessExpiresIn: refreshResponse.expiresIn,
                refreshExpiresIn: 604800000,
              });

              console.log('[GraphQL] Token renovado exitosamente');

              // Actualizar headers de la operación actual
              const oldHeaders = operation.getContext().headers;
              operation.setContext({
                headers: {
                  ...oldHeaders,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });

              isRefreshing = false;
              resolvePendingRequests();

              // Reintentar la operación
              const subscriber = forward(operation).subscribe(observer);
              return () => subscriber.unsubscribe();
            })
            .catch((error) => {
              console.error('[GraphQL] Error renovando token:', error);
              isRefreshing = false;
              pendingRequests = [];
              
              authService.clearTokens();
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              
              observer.error(error);
            });
        });
      }
    }
  }

  if (networkError) {
    console.error('[GraphQL] Network error:', networkError);
  }
});

// Auth link que obtiene el token en cada request (no cacheado)
const authLink = setContext((_, { headers }) => {
  const token = getAccessToken();
  console.log('[GraphQL] Token encontrado:', token ? 'Sí ('+token.substring(0,20)+'...)' : 'No');
  return {
    headers: {
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
});

// URL del servidor GraphQL
const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8001/graphql';

const httpLink = new HttpLink({ 
  uri: GRAPHQL_URL,
  credentials: 'include',
});

// Logging link para debug
const logLink = new ApolloLink((operation, forward) => {
  console.log('[GraphQL] Operación:', operation.operationName);
  console.log('[GraphQL] URL:', GRAPHQL_URL);
  return forward(operation);
});

const graphqlClient = new ApolloClient({
  link: ApolloLink.from([errorLink, logLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'network-only', // Siempre ir al servidor
    },
    query: {
      fetchPolicy: 'network-only',
    },
  },
});

export default graphqlClient;
