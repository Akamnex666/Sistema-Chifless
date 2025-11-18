import { ApolloClient, InMemoryCache, HttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

// Add Authorization header from localStorage if present
const authLink = setContext((_, { headers }) => {
  let token = null;
  try {
    if (typeof window !== 'undefined') {
      token = localStorage.getItem('access_token');
    }
  } catch (e) {
    token = null;
  }
  return {
    headers: {
      ...headers,
      Authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const httpLink = new HttpLink({ uri: process.env.NEXT_PUBLIC_GRAPHQL_URL });

const graphqlClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
    },
  },
});

export default graphqlClient;
