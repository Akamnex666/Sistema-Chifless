import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Helper para obtener el token actual de localStorage
const getAccessToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  try {
    return localStorage.getItem('access_token');
  } catch {
    return null;
  }
};

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
  link: ApolloLink.from([logLink, authLink, httpLink]),
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
