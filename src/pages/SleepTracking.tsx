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
  Select,
  Textarea,
  useToast,
  Text,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  useColorModeValue
} from '@chakra-ui/react';
import { FaBed, FaPlus, FaMoon } from 'react-icons/fa';
import { useState } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { SleepFormData } from '../types';
import { EditableEntry } from '../components/EditableEntry';

const SleepTracking = () => {
  const { sleepEntries, addSleepEntry, deleteEntry, updateEntry } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState<SleepFormData>({
    startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    quality: 'normal',
    location: 'Bed',
    notes: '',
    photoUrl: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const startTime = new Date(formData.startTime);
    const endTime = new Date(formData.endTime);
    
    if (endTime <= startTime) {
      toast({
        title: 'End time must be after start time',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    addSleepEntry({
      startTime,
      endTime,
      quality: formData.quality,
      location: formData.location,
      notes: formData.notes,
      photoUrl: formData.photoUrl
    });

    toast({
      title: 'Sleep session logged',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      quality: 'normal',
      location: 'Bed',
      notes: '',
      photoUrl: ''
    });
  };

  const handleDelete = (id: string) => {
    deleteEntry('sleep', id);
    toast({
      title: 'Entry deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Calculate statistics
  const todayEntries = sleepEntries.filter(entry => isToday(entry.startTime));
  const todayHours = todayEntries.reduce((total, entry) => 
    total + entry.duration, 0
  ) / 60;
  
  const weekStart = startOfWeek(new Date());
  const weekEnd = endOfWeek(new Date());
  const weekEntries = sleepEntries.filter(entry => 
    isWithinInterval(entry.startTime, { start: weekStart, end: weekEnd })
  );
  
  const weekHours = weekEntries.reduce((total, entry) => 
    total + entry.duration, 0
  ) / 60;
  
  const avgPerDay = weekHours / 7;

  const getQualityColor = (quality?: string) => {
    switch (quality) {
      case 'restful': return 'green';
      case 'normal': return 'blue';
      case 'restless': return 'orange';
      default: return 'gray';
    }
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaBed style={{ display: 'inline', marginRight: '8px' }} />
          Sleep Tracking
        </Heading>
      </HStack>

      {/* Statistics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Today</StatLabel>
              <StatNumber>{todayHours.toFixed(1)}h</StatNumber>
              <Text fontSize="sm" color="gray.600">{todayEntries.length} naps</Text>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>This Week</StatLabel>
              <StatNumber>{weekHours.toFixed(1)}h</StatNumber>
              <Text fontSize="sm" color="gray.600">{weekEntries.length} naps</Text>
            </Stat>
          </CardBody>
        </Card>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Daily Average</StatLabel>
              <StatNumber>{avgPerDay.toFixed(1)}h</StatNumber>
              <Text fontSize="sm" color="gray.600">per day</Text>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Add New Entry Form */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Log Sleep Session</Heading>
              
              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel>Start Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel>End Time</FormLabel>
                  <Input
                    type="datetime-local"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel>Sleep Quality</FormLabel>
                  <Select
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value as any })}
                  >
                    <option value="restful">Restful</option>
                    <option value="normal">Normal</option>
                    <option value="restless">Restless</option>
                  </Select>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Location</FormLabel>
                  <Select
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value as 'Cat Bed' | 'Bed' | 'Cat Tree' | 'Couch' | 'Floor' | 'Window' | 'Other' })}
                  >
                    <option value="Cat Bed">Cat Bed</option>
                    <option value="Bed">Bed</option>
                    <option value="Cat Tree">Cat Tree</option>
                    <option value="Couch">Couch</option>
                    <option value="Floor">Floor</option>
                    <option value="Window">Window</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any observations about sleep behavior..."
                  rows={3}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Photo URL (optional)</FormLabel>
                <Input
                  type="url"
                  value={formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  placeholder="Enter image URL"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                leftIcon={<FaPlus />}
                size="lg"
              >
                Log Sleep Session
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Recent Entries */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <Heading size="md" mb={4}>Recent Sleep Sessions</Heading>
          <VStack spacing={3} align="stretch">
            {sleepEntries.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No sleep sessions logged yet
              </Text>
            ) : (
              sleepEntries.slice(0, 10).map((entry) => (
                <EditableEntry
                  key={entry.id}
                  entry={entry}
                  onSave={(updatedEntry) => {
                    updateEntry('sleep', entry.id, updatedEntry);
                    toast({
                      title: 'Sleep session updated',
                      status: 'success',
                      duration: 2000,
                      isClosable: true,
                    });
                  }}
                  onDelete={handleDelete}
                  fields={[
                    {
                      key: 'startTime',
                      label: 'Start Time',
                      type: 'datetime'
                    },
                    {
                      key: 'endTime',
                      label: 'End Time',
                      type: 'datetime'
                    },
                    {
                      key: 'quality',
                      label: 'Quality',
                      type: 'select',
                      options: [
                        { value: 'deep', label: 'Deep' },
                        { value: 'normal', label: 'Normal' },
                        { value: 'restless', label: 'Restless' },
                        { value: 'interrupted', label: 'Interrupted' }
                      ]
                    },
                    {
                      key: 'location',
                      label: 'Location',
                      type: 'text'
                    },
                    {
                      key: 'photoUrl',
                      label: 'Photo URL',
                      type: 'image'
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
                        <FaMoon color="purple" />
                        <Text fontWeight="bold">
                          {format(entry.startTime, 'MMM d, h:mm a')} - {format(entry.endTime, 'h:mm a')}
                        </Text>
                        <Badge colorScheme="purple">
                          {formatDuration(entry.duration)}
                        </Badge>
                        {entry.quality && (
                          <Badge colorScheme={getQualityColor(entry.quality)}>
                            {entry.quality}
                          </Badge>
                        )}
                      </HStack>
                      {entry.location && (
                        <Text fontSize="sm">
                          📍 {entry.location}
                        </Text>
                      )}
                      {entry.notes && (
                        <Text fontSize="sm" color="gray.600">
                          {entry.notes}
                        </Text>
                      )}
                      {entry.photoUrl && (
                        <Text fontSize="xs" color="gray.500">
                          🖼️ Has photo
                        </Text>
                      )}
                    </VStack>
                  )}
                />
              ))
            )}
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default SleepTracking;