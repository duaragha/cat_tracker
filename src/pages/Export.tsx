import { VStack, Heading, Button, Card, CardBody, Text, useColorModeValue, useToast, Input } from '@chakra-ui/react';
import { FaFileExport, FaDownload, FaUpload } from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';
import { format } from 'date-fns';
import { useRef } from 'react';

const Export = () => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    catProfile, 
    washroomEntries, 
    foodEntries, 
    sleepEntries, 
    weightEntries, 
    photos,
    clearAllData 
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
      description: 'Share this file to sync with other devices',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const importFromJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target?.result as string);
        
        // Clear existing data and replace with imported
        clearAllData();
        
        // Save imported data to localStorage
        localStorage.setItem('catTrackerData', JSON.stringify(importedData));
        
        // Reload page to load the new data
        window.location.reload();
        
        toast({
          title: 'Data imported successfully',
          description: 'Page will reload to show imported data',
          status: 'success',
          duration: 2000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Import failed',
          description: 'Invalid file format',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    };
    reader.readAsText(file);
  };

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">
        <FaFileExport style={{ display: 'inline', marginRight: '8px' }} />
        Data Management
      </Heading>
      
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Export Data</Heading>
            <Text>Export all your cat tracking data to a JSON file for backup or sharing with other devices.</Text>
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
              Export to JSON
            </Button>
          </VStack>
        </CardBody>
      </Card>

      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Heading size="md">Import Data</Heading>
            <Text>Import data from another device by selecting a previously exported JSON file.</Text>
            <Text fontSize="sm" color="red.500">
              Warning: This will replace all existing data!
            </Text>
            <Input
              ref={fileInputRef}
              type="file"
              accept=".json"
              display="none"
              onChange={importFromJSON}
            />
            <Button 
              colorScheme="green" 
              leftIcon={<FaUpload />}
              onClick={() => fileInputRef.current?.click()}
              size="lg"
            >
              Import from JSON
            </Button>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default Export;