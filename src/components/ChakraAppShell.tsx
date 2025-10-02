import { ChakraProvider } from '@chakra-ui/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CatDataProvider } from '../contexts/CatDataContext';
import theme from '../theme';
import type { ReactNode } from 'react';

// Create QueryClient once (singleton)
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

interface ChakraAppShellProps {
  children: ReactNode;
}

// This component is lazy loaded to defer Chakra UI and other providers
export default function ChakraAppShell({ children }: ChakraAppShellProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <CatDataProvider>
          {children}
        </CatDataProvider>
      </ChakraProvider>
    </QueryClientProvider>
  );
}
