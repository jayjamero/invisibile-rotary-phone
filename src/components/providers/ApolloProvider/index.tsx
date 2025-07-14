'use client';

import React, { ReactNode } from 'react';
import { ApolloProvider as ApolloClientProvider } from '@apollo/client';
import apolloClient from '@/lib/apollo-client';

interface ApolloProviderProps {
  children: ReactNode;
}

const ApolloProvider: React.FC<ApolloProviderProps> = ({ children }) => {
  return (
    <ApolloClientProvider client={apolloClient}>
      {children}
    </ApolloClientProvider>
  );
};

export default ApolloProvider;
