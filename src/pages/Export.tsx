import { VStack, Heading, Button, Card, CardBody, Text, useColorModeValue, useToast } from '@chakra-ui/react';
import { FaFileExport, FaDownload } from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';
import { format } from 'date-fns';

const Export = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  
  const { 
    catProfile, 
    washroomEntries, 
    foodEntries, 
    sleepEntries, 
    weightEntries, 
    photos
  } = useCatData();

  const exportToJSON = () => {
    const data = {
      catProfile,
      washroomEntries,
      foodEntries,
      sleepEntries,
      weightEntries,
      photos
    };

    const dataStr = JSON.stringify(data, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `cat-tracker-${format(new Date(), 'yyyy-MM-dd')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();

    toast({
      title: 'Data exported successfully',
      description: 'Your data has been downloaded as a JSON file',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">
        <FaFileExport style={{ display: 'inline', marginRight: '8px' }} />
        Export Data
      </Heading>
      
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Text>Export all your cat tracking data to a JSON file for backup.</Text>
            <Text fontSize="sm" color="gray.600">
              Your data is automatically synced across all devices through the cloud.
            </Text>
            <Text fontSize="sm" color="gray.600">
              Current data includes:
            </Text>
            <VStack align="start" pl={4} spacing={1}>
              <Text fontSize="sm">• Profile information</Text>
              <Text fontSize="sm">• {washroomEntries.length} washroom entries</Text>
              <Text fontSize="sm">• {foodEntries.length} food entries</Text>
              <Text fontSize="sm">• {sleepEntries.length} sleep entries</Text>
              <Text fontSize="sm">• {weightEntries.length} weight measurements</Text>
              <Text fontSize="sm">• {photos.length} photos (metadata only)</Text>
            </VStack>
            <Button 
              colorScheme="blue" 
              leftIcon={<FaDownload />}
              onClick={exportToJSON}
              size="lg"
            >
              Download Backup
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Export;