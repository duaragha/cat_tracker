import { HStack, Text, Icon, Badge, Spinner } from '@chakra-ui/react';
import { FaCloud, FaExclamationTriangle } from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';

const SyncIndicator = () => {
  const { isOnline, isSyncing } = useCatData();

  if (!isOnline) {
    return (
      <Badge colorScheme="gray" px={2} py={1}>
        <HStack spacing={1}>
          <Icon as={FaExclamationTriangle} />
          <Text fontSize="xs">Offline Mode</Text>
        </HStack>
      </Badge>
    );
  }

  if (isSyncing) {
    return (
      <Badge colorScheme="blue" px={2} py={1}>
        <HStack spacing={1}>
          <Spinner size="xs" />
          <Text fontSize="xs">Syncing...</Text>
        </HStack>
      </Badge>
    );
  }

  return (
    <Badge colorScheme="green" px={2} py={1}>
      <HStack spacing={1}>
        <Icon as={FaCloud} />
        <Text fontSize="xs">Synced</Text>
      </HStack>
    </Badge>
  );
};

export default SyncIndicator;