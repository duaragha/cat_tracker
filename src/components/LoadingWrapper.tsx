import { Spinner, Center, Text, VStack } from '@chakra-ui/react';
import { useCatData } from '../contexts/CatDataContext';
import type { ReactNode } from 'react';

interface LoadingWrapperProps {
  children: ReactNode;
}

const LoadingWrapper = ({ children }: LoadingWrapperProps) => {
  const { isLoading, error } = useCatData();

  if (isLoading) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading your cat data...</Text>
        </VStack>
      </Center>
    );
  }

  if (error) {
    return (
      <Center h="100vh">
        <VStack spacing={4}>
          <Text fontSize="lg" color="red.500">Error: {error}</Text>
          <Text fontSize="md" color="gray.600">Please refresh the page to try again</Text>
        </VStack>
      </Center>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper;