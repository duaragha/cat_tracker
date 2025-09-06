import {
  Box,
  Heading,
  VStack,
  HStack,
  Button,
  Card,
  CardBody,
  FormControl,
  FormLabel,
  Select,
  Textarea,
  useToast,
  IconButton,
  Text,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  Input,
  useColorModeValue,
  Checkbox,
  Icon
} from '@chakra-ui/react';
import { FaToilet, FaPlus, FaTrash, FaTint } from 'react-icons/fa';
import { useState } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { WashroomFormData } from '../types';
import { PhotoUpload } from '../components/PhotoUpload';

const WashroomTracking = () => {
  const { washroomEntries, addWashroomEntry, deleteEntry } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState<WashroomFormData>({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    type: 'both',
    consistency: 'firm',
    hasBlood: false,
    color: 'brown',
    photos: [],
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only include consistency, color, and blood fields for poop-related entries
    addWashroomEntry({
      timestamp: new Date(formData.timestamp),
      type: formData.type,
      consistency: formData.type === 'pee' ? undefined : formData.consistency,
      hasBlood: formData.type === 'pee' ? false : formData.hasBlood,
      color: formData.type === 'pee' ? undefined : formData.color,
      photos: formData.photos,
      notes: formData.notes
    });

    toast({
      title: 'Washroom visit logged',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      type: 'both',
      consistency: 'firm',
      hasBlood: false,
      color: 'brown',
      photos: [],
      notes: ''
    });
  };

  const handleDelete = (id: string) => {
    deleteEntry('washroom', id);
    toast({
      title: 'Entry deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePhotosChange = (photos: string[]) => {
    setFormData({ ...formData, photos });
  };

  // Calculate statistics
  const todayCount = washroomEntries.filter(entry => isToday(entry.timestamp)).length;
  
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekCount = washroomEntries.filter(entry => 
    isWithinInterval(entry.timestamp, { start: weekStart, end: weekEnd })
  ).length;
  
  const avgPerDay = weekCount / 7;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'pee': return 'yellow';
      case 'pooper': return 'orange';
      case 'both': return 'purple';
      default: return 'gray';
    }
  };

  const getConsistencyColor = (consistency?: string) => {
    switch (consistency) {
      case 'firm': return 'green';
      case 'soft': return 'yellow';
      case 'half n half': return 'orange';
      case 'diarrhea': return 'red';
      default: return 'gray';
    }
  };

  const getColorDisplay = (color?: string) => {
    const colorMap: Record<string, string> = {
      'yellow': '#F6E05E',
      'green': '#48BB78',
      'brown': '#8B5A3C',
      'dark brown': '#5C4033',
      'black': '#2D3748',
      'other': '#A0AEC0'
    };
    return colorMap[color || 'brown'] || '#8B5A3C';
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaToilet style={{ display: 'inline', marginRight: '8px' }} />
          Washroom Tracking
        </Heading>
      </HStack>

      {/* Statistics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Today</StatLabel>
              <StatNumber>{todayCount}</StatNumber>
              <Text fontSize="sm" color="gray.600">visits</Text>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>This Week</StatLabel>
              <StatNumber>{weekCount}</StatNumber>
              <Text fontSize="sm" color="gray.600">visits</Text>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Daily Average</StatLabel>
              <StatNumber>{avgPerDay.toFixed(1)}</StatNumber>
              <Text fontSize="sm" color="gray.600">visits/day</Text>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Add New Entry Form */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Log Washroom Visit</Heading>
              
              <FormControl isRequired>
                <FormLabel>Date & Time</FormLabel>
                <Input
                  type="datetime-local"
                  value={formData.timestamp}
                  onChange={(e) => setFormData({ ...formData, timestamp: e.target.value })}
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel>Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  >
                    <option value="pee">Pee</option>
                    <option value="pooper">Pooper</option>
                    <option value="both">Both</option>
                  </Select>
                </FormControl>

                {formData.type !== 'pee' && (
                  <FormControl flex={1}>
                    <FormLabel>Consistency</FormLabel>
                    <Select
                      value={formData.consistency}
                      onChange={(e) => setFormData({ ...formData, consistency: e.target.value as any })}
                    >
                      <option value="firm">Firm</option>
                      <option value="soft">Soft</option>
                      <option value="half n half">Half n Half</option>
                      <option value="diarrhea">Diarrhea</option>
                    </Select>
                  </FormControl>
                )}
              </HStack>

              {formData.type !== 'pee' && (
                <HStack spacing={4}>
                  <FormControl flex={1}>
                    <FormLabel>Color</FormLabel>
                    <Select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value as any })}
                    >
                      <option value="yellow">Yellow</option>
                      <option value="green">Green</option>
                      <option value="brown">Brown</option>
                      <option value="dark brown">Dark Brown</option>
                      <option value="black">Black</option>
                      <option value="other">Other</option>
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>&nbsp;</FormLabel>
                    <Checkbox
                      isChecked={formData.hasBlood}
                      onChange={(e) => setFormData({ ...formData, hasBlood: e.target.checked })}
                      colorScheme={formData.hasBlood ? 'red' : 'gray'}
                    >
                      <HStack spacing={1}>
                        <Icon as={FaTint} color={formData.hasBlood ? 'red.500' : 'gray.400'} />
                        <Text>Blood Present</Text>
                      </HStack>
                    </Checkbox>
                  </FormControl>
                </HStack>
              )}

              <FormControl>
                <FormLabel>Photos (2-3 photos)</FormLabel>
                <PhotoUpload
                  maxFiles={3}
                  existingPhotos={formData.photos}
                  onPhotosChange={handlePhotosChange}
                  category="washroom"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any observations or concerns..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<FaPlus />}
                size="lg"
              >
                Log Washroom Visit
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Recent Entries */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <Heading size="md" mb={4}>Recent Entries</Heading>
          <VStack spacing={3} align="stretch">
            {washroomEntries.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No washroom visits logged yet
              </Text>
            ) : (
              washroomEntries.slice(0, 10).map((entry) => (
                <Box
                  key={entry.id}
                  p={3}
                  borderWidth={1}
                  borderColor={borderColor}
                  borderRadius="md"
                >
                  <HStack justify="space-between">
                    <VStack align="start" spacing={1}>
                      <HStack>
                        <Text fontWeight="bold">
                          {format(entry.timestamp, 'MMM d, h:mm a')}
                        </Text>
                        <Badge colorScheme={getTypeColor(entry.type)}>
                          {entry.type}
                        </Badge>
                        {entry.consistency && (
                          <Badge colorScheme={getConsistencyColor(entry.consistency)}>
                            {entry.consistency}
                          </Badge>
                        )}
                        {entry.color && (
                          <Box
                            display="inline-block"
                            w={4}
                            h={4}
                            borderRadius="full"
                            bg={getColorDisplay(entry.color)}
                            borderWidth={1}
                            borderColor="gray.300"
                            title={entry.color}
                          />
                        )}
                        {entry.hasBlood && (
                          <Badge colorScheme="red">
                            <Icon as={FaTint} mr={1} />
                            Blood
                          </Badge>
                        )}
                      </HStack>
                      {entry.notes && (
                        <Text fontSize="sm" color="gray.600">
                          {entry.notes}
                        </Text>
                      )}
                      {entry.photos && entry.photos.length > 0 && (
                        <HStack spacing={1}>
                          <Text fontSize="xs" color="gray.500">
                            📷 {entry.photos.length} photo{entry.photos.length > 1 ? 's' : ''}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                    <IconButton
                      icon={<FaTrash />}
                      aria-label="Delete entry"
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(entry.id)}
                    />
                  </HStack>
                </Box>
              ))
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default WashroomTracking;