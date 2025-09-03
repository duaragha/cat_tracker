import { Center, VStack, Spinner, Text, Icon } from '@chakra-ui/react';
import { FaPaw } from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';
import type { ReactNode } from 'react';

interface InitializingScreenProps {
  children: ReactNode;
}

const InitializingScreen = ({ children }: InitializingScreenProps) => {
  const { isInitializing } = useCatData();

  if (isInitializing) {
    return (
      <Center h="100vh" bg="gray.50">
        <VStack spacing={4}>
          <Icon as={FaPaw} fontSize="3xl" color="blue.500" />
          <Spinner size="xl" color="blue.500" thickness="4px" />
          <Text fontSize="lg" color="gray.600">Loading your cat data...</Text>
          <Text fontSize="sm" color="gray.500">Checking cloud sync...</Text>
        </VStack>
      </Center>
    );
  }

  return <>{children}</>;
};

export default InitializingScreen;