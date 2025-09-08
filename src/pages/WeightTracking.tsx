import {
  VStack,
  HStack,
  Heading,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Grid,
  useColorModeValue,
  Image,
  SimpleGrid
} from '@chakra-ui/react';
import { FaWeight, FaPlus } from 'react-icons/fa';
import { useState } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format } from 'date-fns';
import type { WeightFormData } from '../types';
import { PhotoUpload } from '../components/PhotoUpload';
import { EditableEntry } from '../components/EditableEntry';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const WeightTracking = () => {
  const { weightEntries, addWeightEntry, deleteEntry, updateEntry, catProfile } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const chartColor = useColorModeValue('#3182CE', '#63B3ED');

  const [formData, setFormData] = useState<WeightFormData>({
    weight: catProfile?.weight ? (catProfile.weight * 2.20462) : 9.9,
    measurementDate: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
    photos: []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create date at noon to avoid timezone issues
    const [year, month, day] = formData.measurementDate.split('-').map(Number);
    const measurementDate = new Date(year, month - 1, day, 12, 0, 0);
    
    addWeightEntry({
      weight: formData.weight / 2.20462, // Convert lb to kg for storage
      measurementDate: measurementDate,
      notes: formData.notes,
      photos: formData.photos
    });

    toast({
      title: 'Weight recorded',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });

    // Keep the submitted date, only reset other fields
    setFormData(prev => ({
      weight: prev.weight,
      measurementDate: prev.measurementDate,
      notes: '',
      photos: []
    }));
  };

  const handleDelete = (id: string) => {
    deleteEntry('weight', id);
    toast({
      title: 'Entry deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Prepare chart data
  const chartData = [...weightEntries]
    .sort((a, b) => a.measurementDate.getTime() - b.measurementDate.getTime())
    .slice(-30)
    .map(entry => ({
      date: format(entry.measurementDate, 'MMM d'),
      weight: (entry.weight * 2.20462) // Convert kg to lb for display
    }));

  // Calculate statistics (convert kg to lb for display)
  const latestWeight = weightEntries[0]?.weight ? (weightEntries[0].weight * 2.20462) : undefined;
  const previousWeight = weightEntries[1]?.weight ? (weightEntries[1].weight * 2.20462) : undefined;
  const weightChange = latestWeight && previousWeight ? 
    latestWeight - previousWeight : 0;
  
  const allWeights = weightEntries.map(e => e.weight * 2.20462);
  const avgWeight = allWeights.length > 0 ? 
    allWeights.reduce((a, b) => a + b, 0) / allWeights.length : 0;
  
  const maxWeight = allWeights.length > 0 ? Math.max(...allWeights) : 0;
  const minWeight = allWeights.length > 0 ? Math.min(...allWeights) : 0;

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaWeight style={{ display: 'inline', marginRight: '8px' }} />
          Weight Tracking
        </Heading>
      </HStack>

      {/* Statistics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(4, 1fr)' }} gap={4}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Current Weight</StatLabel>
              <StatNumber>{latestWeight?.toFixed(1) || '—'} lb</StatNumber>
              {weightChange !== 0 && (
                <StatHelpText>
                  <StatArrow type={weightChange > 0 ? 'increase' : 'decrease'} />
                  {Math.abs(weightChange).toFixed(1)} lb
                </StatHelpText>
              )}
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Average</StatLabel>
              <StatNumber>{avgWeight.toFixed(1)} lb</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Highest</StatLabel>
              <StatNumber>{maxWeight.toFixed(1)} lb</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Lowest</StatLabel>
              <StatNumber>{minWeight.toFixed(1)} lb</StatNumber>
              <StatHelpText>All time</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Weight Chart */}
      {chartData.length > 1 && (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Heading size="md" mb={4}>Weight Trend</Heading>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis 
                  domain={['dataMin - 0.5', 'dataMax + 0.5']}
                  tickFormatter={(value) => `${value.toFixed(1)} lb`}
                />
                <Tooltip 
                  formatter={(value: number) => `${value.toFixed(1)} lb`}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke={chartColor}
                  strokeWidth={2}
                  dot={{ fill: chartColor }}
                  name="Weight (lb)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardBody>
        </Card>
      )}

      {/* Add New Entry Form */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Record Weight</Heading>
              
              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel>Weight (lb)</FormLabel>
                  <Input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                    min={0.2}
                    max={110}
                    step={0.1}
                    placeholder="Enter weight in pounds"
                  />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.measurementDate}
                    onChange={(e) => setFormData({ ...formData, measurementDate: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any observations or context..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Photos (Max 2)</FormLabel>
                <PhotoUpload
                  maxFiles={2}
                  existingPhotos={formData.photos}
                  onPhotosChange={(photos) => setFormData({ ...formData, photos })}
                  category="weight"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="orange"
                leftIcon={<FaPlus />}
                size="lg"
              >
                Record Weight
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Recent Entries */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <Heading size="md" mb={4}>Weight History</Heading>
          <VStack spacing={3} align="stretch">
            {weightEntries.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No weight measurements recorded yet
              </Text>
            ) : (
              weightEntries.slice(0, 10).map((entry, index) => {
                const prevWeight = weightEntries[index + 1]?.weight;
                const change = prevWeight ? entry.weight - prevWeight : 0;
                
                return (
                  <EditableEntry
                    key={entry.id}
                    entry={entry}
                    onSave={(updatedEntry) => {
                      // Convert weight back to kg for storage and ensure date is a Date object
                      const updatedWithKg = {
                        ...updatedEntry,
                        weight: updatedEntry.weight / 2.20462,
                        measurementDate: updatedEntry.measurementDate instanceof Date
                          ? updatedEntry.measurementDate
                          : new Date(updatedEntry.measurementDate)
                      };
                      updateEntry('weight', entry.id, updatedWithKg);
                      toast({
                        title: 'Weight updated',
                        status: 'success',
                        duration: 2000,
                        isClosable: true,
                      });
                    }}
                    onDelete={handleDelete}
                    fields={[
                      {
                        key: 'measurementDate',
                        label: 'Date',
                        type: 'date'
                      },
                      {
                        key: 'weight',
                        label: 'Weight (lb)',
                        type: 'number',
                        min: 0.2,
                        max: 110,
                        step: 0.1
                      },
                      {
                        key: 'photos',
                        label: 'Photos',
                        type: 'photos',
                        maxFiles: 2
                      },
                      {
                        key: 'notes',
                        label: 'Notes',
                        type: 'textarea'
                      }
                    ]}
                    renderDisplay={(entry) => (
                      <VStack align="start" spacing={1}>
                        <HStack>
                          <Text fontWeight="bold">
                            {format(entry.measurementDate, 'MMM d, yyyy')}
                          </Text>
                          <Text fontSize="lg" fontWeight="bold" color="orange.500">
                            {(entry.weight * 2.20462).toFixed(1)} lb
                          </Text>
                          {change !== 0 && index < weightEntries.length - 1 && (
                            <Text fontSize="sm" color={change > 0 ? 'red.500' : 'green.500'}>
                              ({change > 0 ? '+' : ''}{(change * 2.20462).toFixed(1)} lb)
                            </Text>
                          )}
                        </HStack>
                        {entry.notes && (
                          <Text fontSize="sm" color="gray.600">
                            {entry.notes}
                          </Text>
                        )}
                        {entry.photos && entry.photos.length > 0 && (
                          <SimpleGrid columns={2} spacing={2} mt={2} maxW="200px">
                            {entry.photos.map((photo: string, photoIndex: number) => (
                              <Image
                                key={photoIndex}
                                src={photo}
                                alt={`Weight photo ${photoIndex + 1}`}
                                borderRadius="md"
                                height="60px"
                                width="100%"
                                objectFit="cover"
                                cursor="pointer"
                                onClick={() => window.open(photo, '_blank')}
                                _hover={{ opacity: 0.8 }}
                              />
                            ))}
                          </SimpleGrid>
                        )}
                      </VStack>
                    )}
                  />
                );
              })
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default WeightTracking;