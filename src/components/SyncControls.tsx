import {
  HStack,
  Button,
  useToast,
  Badge,
  Text,
  VStack,
  Box,
  Icon,
  useColorModeValue
} from '@chakra-ui/react';
import { FaCloudUploadAlt, FaCloudDownloadAlt, FaCheck, FaTimes } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { syncService } from '../services/syncService';
import { useCatData } from '../contexts/CatDataContext';

const SyncControls = () => {
  const toast = useToast();
  const { 
    catProfile,
    washroomEntries,
    foodEntries,
    sleepEntries,
    weightEntries,
    photos,
    setCatProfile,
    clearAllData
  } = useCatData();
  
  const [isOnline, setIsOnline] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    // Check connection on mount
    checkConnection();
    
    // Get last sync time
    const savedSyncTime = localStorage.getItem('lastSyncTime');
    if (savedSyncTime) {
      setLastSync(new Date(savedSyncTime));
    }

    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkConnection = async () => {
    const connected = await syncService.checkConnection();
    setIsOnline(connected);
  };

  const handlePush = async () => {
    if (!catProfile) {
      toast({
        title: 'No data to sync',
        description: 'Create a cat profile first',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSyncing(true);
    
    const dataToSync = {
      catProfile,
      washroomEntries,
      foodEntries,
      sleepEntries,
      weightEntries,
      photos
    };

    const success = await syncService.pushToBackend(dataToSync);

    if (success) {
      setLastSync(new Date());
      toast({
        title: 'Data uploaded successfully!',
        description: 'Your data is now available on all devices',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Upload failed',
        description: 'Check your connection and try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    setIsSyncing(false);
  };

  const handlePull = async () => {
    setIsSyncing(true);

    const data = await syncService.pullFromBackend();

    if (data) {
      // Clear local data first
      clearAllData();
      
      // Set the new data
      if (data.catProfile) {
        setCatProfile(data.catProfile);
        
        // Save to localStorage so it persists
        localStorage.setItem('catTrackerData', JSON.stringify(data));
      }

      setLastSync(new Date());
      toast({
        title: 'Data downloaded successfully!',
        description: 'Your data has been updated from the cloud',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } else {
      toast({
        title: 'Download failed',
        description: 'No data found or connection error',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }

    setIsSyncing(false);
  };

  return (
    <Box
      p={4}
      borderWidth={1}
      borderRadius="lg"
      borderColor={borderColor}
      bg={bgColor}
      mb={4}
    >
      <VStack spacing={3} align="stretch">
        <HStack justify="space-between">
          <Text fontWeight="bold" fontSize="lg">
            Cloud Sync
          </Text>
          <Badge colorScheme={isOnline ? 'green' : 'red'}>
            <HStack spacing={1}>
              <Icon as={isOnline ? FaCheck : FaTimes} />
              <Text>{isOnline ? 'Online' : 'Offline'}</Text>
            </HStack>
          </Badge>
        </HStack>

        <HStack spacing={3}>
          <Button
            leftIcon={<FaCloudUploadAlt />}
            colorScheme="blue"
            onClick={handlePush}
            isLoading={isSyncing}
            isDisabled={!isOnline || isSyncing}
            flex={1}
          >
            Upload
          </Button>
          
          <Button
            leftIcon={<FaCloudDownloadAlt />}
            colorScheme="green"
            onClick={handlePull}
            isLoading={isSyncing}
            isDisabled={!isOnline || isSyncing}
            flex={1}
          >
            Download
          </Button>
        </HStack>

        {lastSync && (
          <Text fontSize="sm" color="gray.500" textAlign="center">
            Last synced: {lastSync.toLocaleString()}
          </Text>
        )}

        <Text fontSize="xs" color="gray.500" textAlign="center">
          Upload saves your data to the cloud. Download gets the latest from cloud.
        </Text>
      </VStack>
    </Box>
  );
};

export default SyncControls;