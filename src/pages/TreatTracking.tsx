import {
  Box,
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
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useColorModeValue,
  StatHelpText
} from '@chakra-ui/react';
import { FaCookie, FaPlus, FaGift, FaBrain, FaTooth, FaPills } from 'react-icons/fa';
import { useState, useMemo } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { TreatFormData } from '../types';
import { EditableEntry } from '../components/EditableEntry';

const TreatTracking = () => {
  const { treatEntries, addTreatEntry, deleteEntry, updateEntry } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState<TreatFormData>({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    treatType: '',
    brand: '',
    quantity: 1,
    calories: undefined,
    purpose: 'just because',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.treatType) {
      toast({
        title: 'Please enter the treat type',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    addTreatEntry({
      timestamp: new Date(formData.timestamp),
      treatType: formData.treatType,
      brand: formData.brand,
      quantity: formData.quantity,
      calories: formData.calories,
      purpose: formData.purpose,
      notes: formData.notes
    });

    toast({
      title: 'Treat logged',
      description: `${formData.quantity} ${formData.treatType} treat${formData.quantity > 1 ? 's' : ''} given`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Keep the submitted timestamp, only reset other fields
    setFormData(prev => ({
      timestamp: prev.timestamp,
      treatType: '',
      brand: '',
      quantity: 1,
      calories: undefined,
      purpose: 'just because',
      notes: ''
    }));
  };

  const handleDelete = (id: string) => {
    deleteEntry('treats', id);
    toast({
      title: 'Entry deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const todayEntries = treatEntries.filter(entry => isToday(entry.timestamp));
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    // Ensure timestamps are Date objects before filtering
    const weekEntries = treatEntries.filter(entry => {
      const entryDate = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });

    const calculateTotals = (entries: typeof treatEntries) => {
      let totalQuantity = 0;
      let totalCalories = 0;
      const purposeCount: Record<string, number> = {
        reward: 0,
        training: 0,
        medication: 0,
        dental: 0,
        'just because': 0
      };

      entries.forEach(entry => {
        const quantity = typeof entry.quantity === 'string' ? parseFloat(entry.quantity) : entry.quantity;
        const calories = entry.calories ? (typeof entry.calories === 'string' ? parseFloat(entry.calories) : entry.calories) : 0;
        
        totalQuantity += isNaN(quantity) ? 0 : quantity;
        totalCalories += isNaN(calories) ? 0 : (calories * quantity);
        
        if (entry.purpose && purposeCount[entry.purpose] !== undefined) {
          purposeCount[entry.purpose]++;
        }
      });

      return { totalQuantity, totalCalories, purposeCount };
    };

    const todayTotals = calculateTotals(todayEntries);
    const weekTotals = calculateTotals(weekEntries);

    return {
      today: {
        ...todayTotals,
        count: todayEntries.length
      },
      week: {
        ...weekTotals,
        count: weekEntries.length,
        avgPerDay: weekTotals.totalQuantity / 7
      }
    };
  }, [treatEntries]);

  const getPurposeColor = (purpose?: string) => {
    switch (purpose) {
      case 'reward': return 'yellow';
      case 'training': return 'blue';
      case 'medication': return 'red';
      case 'dental': return 'cyan';
      case 'just because': return 'pink';
      default: return 'gray';
    }
  };

  const getPurposeIcon = (purpose?: string) => {
    switch (purpose) {
      case 'reward': return <FaGift style={{ display: 'inline', marginRight: '4px' }} />;
      case 'training': return <FaBrain style={{ display: 'inline', marginRight: '4px' }} />;
      case 'medication': return <FaPills style={{ display: 'inline', marginRight: '4px' }} />;
      case 'dental': return <FaTooth style={{ display: 'inline', marginRight: '4px' }} />;
      default: return <FaCookie style={{ display: 'inline', marginRight: '4px' }} />;
    }
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaCookie style={{ display: 'inline', marginRight: '8px' }} />
          Treat Tracking
        </Heading>
      </HStack>

      {/* Statistics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Today's Treats</StatLabel>
              <StatNumber>{statistics.today.totalQuantity}</StatNumber>
              <StatHelpText>
                {statistics.today.totalCalories > 0 && (
                  <Text fontSize="sm">{statistics.today.totalCalories} calories</Text>
                )}
                <Text fontSize="xs" color="gray.600">{statistics.today.count} sessions</Text>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>This Week</StatLabel>
              <StatNumber>{statistics.week.totalQuantity}</StatNumber>
              <StatHelpText>
                {statistics.week.totalCalories > 0 && (
                  <Text fontSize="sm">{statistics.week.totalCalories} calories total</Text>
                )}
                <Text fontSize="xs" color="gray.600">{statistics.week.count} sessions</Text>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Daily Average</StatLabel>
              <StatNumber>{statistics.week.avgPerDay.toFixed(1)}</StatNumber>
              <StatHelpText>
                <Text fontSize="sm">treats per day</Text>
                {statistics.week.totalCalories > 0 && (
                  <Text fontSize="xs" color="gray.600">
                    {Math.round(statistics.week.totalCalories / 7)} cal/day
                  </Text>
                )}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Purpose breakdown for today */}
      {statistics.today.count > 0 && (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Text fontWeight="bold" mb={2}>Today's Treat Purposes</Text>
            <HStack spacing={3} flexWrap="wrap">
              {Object.entries(statistics.today.purposeCount).map(([purpose, count]) => 
                count > 0 && (
                  <Badge key={purpose} colorScheme={getPurposeColor(purpose)}>
                    {getPurposeIcon(purpose)}
                    {purpose}: {count}
                  </Badge>
                )
              )}
            </HStack>
          </CardBody>
        </Card>
      )}

      {/* Add New Entry Form */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Log Treat</Heading>
              
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
                  <FormLabel>Treat Type/Name</FormLabel>
                  <Input
                    value={formData.treatType}
                    onChange={(e) => setFormData({ ...formData, treatType: e.target.value })}
                    placeholder="e.g., Temptations, Greenies, Catnip treats"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Brand</FormLabel>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., Temptations, Greenies"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel>Quantity</FormLabel>
                  <NumberInput
                    value={formData.quantity}
                    onChange={(_, value) => setFormData({ ...formData, quantity: value })}
                    min={1}
                    max={50}
                    step={1}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Calories (per treat)</FormLabel>
                  <NumberInput
                    value={formData.calories}
                    onChange={(_, value) => setFormData({ ...formData, calories: value })}
                    min={0}
                    max={100}
                    step={0.5}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel>Purpose</FormLabel>
                  <Select
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value as any })}
                  >
                    <option value="just because">Just Because</option>
                    <option value="reward">Reward</option>
                    <option value="training">Training</option>
                    <option value="medication">Medication</option>
                    <option value="dental">Dental Health</option>
                  </Select>
                </FormControl>
              </HStack>

              {formData.calories && (
                <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    Total calories: {formData.quantity} treats × {formData.calories} cal = {formData.quantity * formData.calories} calories
                  </Text>
                </Box>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any observations about behavior, reactions, or context..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="purple"
                leftIcon={<FaPlus />}
                size="lg"
              >
                Log Treat
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Recent Entries */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <Heading size="md" mb={4}>Recent Treats</Heading>
          <VStack spacing={3} align="stretch">
            {treatEntries.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No treats logged yet
              </Text>
            ) : (
              treatEntries.slice(0, 10).map((entry) => (
                <EditableEntry
                  key={entry.id}
                  entry={entry}
                  onSave={(updatedEntry) => {
                    // Convert timestamp string to Date if needed
                    const entryToSave = {
                      ...updatedEntry,
                      timestamp: updatedEntry.timestamp instanceof Date 
                        ? updatedEntry.timestamp 
                        : new Date(updatedEntry.timestamp)
                    };
                    updateEntry('treats', entry.id, entryToSave);
                    toast({
                      title: 'Treat entry updated',
                      status: 'success',
                      duration: 2000,
                      isClosable: true,
                    });
                  }}
                  onDelete={handleDelete}
                  fields={[
                    {
                      key: 'timestamp',
                      label: 'Date & Time',
                      type: 'datetime'
                    },
                    {
                      key: 'treatType',
                      label: 'Treat Type',
                      type: 'text'
                    },
                    {
                      key: 'brand',
                      label: 'Brand',
                      type: 'text'
                    },
                    {
                      key: 'quantity',
                      label: 'Quantity',
                      type: 'number',
                      min: 1,
                      max: 50,
                      step: 1
                    },
                    {
                      key: 'calories',
                      label: 'Calories (per treat)',
                      type: 'number',
                      min: 0,
                      max: 100,
                      step: 0.5
                    },
                    {
                      key: 'purpose',
                      label: 'Purpose',
                      type: 'select',
                      options: [
                        { value: 'just because', label: 'Just Because' },
                        { value: 'reward', label: 'Reward' },
                        { value: 'training', label: 'Training' },
                        { value: 'medication', label: 'Medication' },
                        { value: 'dental', label: 'Dental Health' }
                      ]
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
                          {format(entry.timestamp, 'MMM d, h:mm a')}
                        </Text>
                        <Badge colorScheme={getPurposeColor(entry.purpose)}>
                          {getPurposeIcon(entry.purpose)}
                          {entry.purpose || 'just because'}
                        </Badge>
                        <Badge colorScheme="purple">
                          {entry.quantity} treat{entry.quantity > 1 ? 's' : ''}
                        </Badge>
                        {entry.calories && (
                          <Badge colorScheme="orange">
                            {entry.quantity * entry.calories} cal
                          </Badge>
                        )}
                      </HStack>
                      <Text>
                        {entry.treatType}
                        {entry.brand && ` - ${entry.brand}`}
                      </Text>
                      {entry.notes && (
                        <Text fontSize="sm" color="gray.600">
                          {entry.notes}
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

export default TreatTracking;