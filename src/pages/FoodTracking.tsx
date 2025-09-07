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
import { FaUtensils, FaPlus, FaTint, FaBone } from 'react-icons/fa';
import { useState, useMemo, useEffect } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import type { FoodFormData } from '../types';
import { EditableEntry } from '../components/EditableEntry';

const FoodTracking = () => {
  const { foodEntries, addFoodEntry, deleteEntry, updateEntry } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const [formData, setFormData] = useState<FoodFormData>({
    timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    foodCategory: 'Dry',
    foodType: '',
    brand: '',
    amount: 5,
    unit: 'portions',
    portionToGrams: 10, // 1 portion = 10g default
    notes: ''
  });

  // Auto-change unit to grams when Wet food is selected
  useEffect(() => {
    if (formData.foodCategory === 'Wet') {
      setFormData(prev => ({ ...prev, unit: 'grams', amount: 85 })); // Default 85g for wet food
    }
  }, [formData.foodCategory]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.foodType) {
      toast({
        title: 'Please enter the food type',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    // Keep amount as entered, store unit and conversion factor
    addFoodEntry({
      timestamp: new Date(formData.timestamp),
      foodCategory: formData.foodCategory,
      foodType: formData.foodType,
      brand: formData.brand,
      amount: formData.amount,
      unit: formData.unit,
      portionToGrams: formData.unit === 'portions' ? formData.portionToGrams : undefined,
      notes: formData.notes
    });

    toast({
      title: 'Food intake logged',
      description: formData.unit === 'portions' ? 
        `${formData.amount} portions (${formData.amount * (formData.portionToGrams || 10)}g) of ${formData.foodCategory} food` : 
        `${formData.amount} ${formData.unit} of ${formData.foodCategory} food`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      timestamp: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      foodCategory: 'Dry',
      foodType: '',
      brand: '',
      amount: 5,
      unit: 'portions',
      portionToGrams: 10,
      notes: ''
    });
  };

  const handleDelete = (id: string) => {
    deleteEntry('food', id);
    toast({
      title: 'Entry deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  // Calculate statistics with dry/wet separation
  const statistics = useMemo(() => {
    const todayEntries = foodEntries.filter(entry => isToday(entry.timestamp));
    const weekStart = startOfWeek(new Date());
    const weekEnd = endOfWeek(new Date());
    
    // Ensure timestamps are Date objects before filtering
    const weekEntries = foodEntries.filter(entry => {
      const entryDate = entry.timestamp instanceof Date ? entry.timestamp : new Date(entry.timestamp);
      return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
    });

    const calculateTotals = (entries: typeof foodEntries) => {
      let dryTotal = 0;
      let wetTotal = 0;
      let total = 0;

      entries.forEach(entry => {
        const entryAmount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
        const portionGrams = typeof entry.portionToGrams === 'string' ? parseFloat(entry.portionToGrams) : (entry.portionToGrams || 10);
        
        const amount = entry.unit === 'grams' ? entryAmount : 
                      entry.unit === 'cups' ? entryAmount * 120 : // 1 cup ≈ 120g for dry food
                      entry.unit === 'portions' ? entryAmount * portionGrams : // portions with conversion
                      entryAmount * 10; // pieces default to 10g each

        const validAmount = isNaN(amount) ? 0 : amount;

        if (entry.foodCategory === 'Dry') {
          dryTotal += validAmount;
        } else if (entry.foodCategory === 'Wet') {
          wetTotal += validAmount;
        }
        total += validAmount;
      });

      return { dryTotal, wetTotal, total };
    };

    const todayTotals = calculateTotals(todayEntries);
    const weekTotals = calculateTotals(weekEntries);

    return {
      today: {
        ...todayTotals,
        count: todayEntries.length,
        dryCount: todayEntries.filter(e => e.foodCategory === 'Dry').length,
        wetCount: todayEntries.filter(e => e.foodCategory === 'Wet').length
      },
      week: {
        ...weekTotals,
        count: weekEntries.length,
        avgPerDay: weekTotals.total / 7
      }
    };
  }, [foodEntries]);

  const getConvertedAmount = () => {
    if (formData.unit === 'portions') {
      return formData.amount * (formData.portionToGrams || 10);
    }
    return formData.amount;
  };

  const getCategoryColor = (category: string) => {
    return category === 'Dry' ? 'orange' : 'blue';
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaUtensils style={{ display: 'inline', marginRight: '8px' }} />
          Food Tracking
        </Heading>
      </HStack>

      {/* Enhanced Statistics */}
      <Grid templateColumns={{ base: '1fr', md: 'repeat(3, 1fr)' }} gap={4}>
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Today's Total</StatLabel>
              <StatNumber>{Math.round(statistics.today.total)}g</StatNumber>
              <StatHelpText>
                <HStack spacing={3}>
                  <Badge colorScheme="orange">
                    <FaBone style={{ marginRight: '4px' }} />
                    Dry: {Math.round(statistics.today.dryTotal)}g
                  </Badge>
                  <Badge colorScheme="blue">
                    <FaTint style={{ marginRight: '4px' }} />
                    Wet: {Math.round(statistics.today.wetTotal)}g
                  </Badge>
                </HStack>
              </StatHelpText>
              <Text fontSize="xs" color="gray.600" mt={1}>
                {statistics.today.count} meals ({statistics.today.dryCount} dry, {statistics.today.wetCount} wet)
              </Text>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>This Week</StatLabel>
              <StatNumber>{(statistics.week.total / 1000).toFixed(1)}kg</StatNumber>
              <StatHelpText>
                <HStack spacing={3}>
                  <Text fontSize="xs">
                    Dry: {(statistics.week.dryTotal / 1000).toFixed(1)}kg
                  </Text>
                  <Text fontSize="xs">
                    Wet: {(statistics.week.wetTotal / 1000).toFixed(1)}kg
                  </Text>
                </HStack>
              </StatHelpText>
              <Text fontSize="xs" color="gray.600">
                {statistics.week.count} meals total
              </Text>
            </Stat>
          </CardBody>
        </Card>
        
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Stat>
              <StatLabel>Daily Average</StatLabel>
              <StatNumber>{Math.round(statistics.week.avgPerDay)}g</StatNumber>
              <StatHelpText>
                <HStack spacing={3}>
                  <Text fontSize="xs">
                    Dry: {Math.round(statistics.week.dryTotal / 7)}g/day
                  </Text>
                  <Text fontSize="xs">
                    Wet: {Math.round(statistics.week.wetTotal / 7)}g/day
                  </Text>
                </HStack>
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </Grid>

      {/* Add New Entry Form */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">Log Food Intake</Heading>
              
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
                  <FormLabel>Food Category</FormLabel>
                  <Select
                    value={formData.foodCategory}
                    onChange={(e) => setFormData({ ...formData, foodCategory: e.target.value as 'Dry' | 'Wet' })}
                  >
                    <option value="Dry">Dry Food</option>
                    <option value="Wet">Wet Food</option>
                  </Select>
                </FormControl>

                <FormControl isRequired flex={1}>
                  <FormLabel>Food Type/Name</FormLabel>
                  <Input
                    value={formData.foodType}
                    onChange={(e) => setFormData({ ...formData, foodType: e.target.value })}
                    placeholder="e.g., Chicken, Salmon, Indoor Formula"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Brand</FormLabel>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g., Royal Canin"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl isRequired flex={1}>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput
                    value={formData.amount}
                    onChange={(_, value) => setFormData({ ...formData, amount: value })}
                    min={1}
                    max={1000}
                    step={1}
                    precision={0}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Unit</FormLabel>
                  <Select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                  >
                    <option value="portions">Portions</option>
                    <option value="grams">Grams</option>
                    <option value="cups">Cups</option>
                    <option value="pieces">Pieces</option>
                  </Select>
                </FormControl>

                {formData.unit === 'portions' && (
                  <FormControl flex={1}>
                    <FormLabel>1 Portion = </FormLabel>
                    <NumberInput
                      value={formData.portionToGrams}
                      onChange={(_, value) => setFormData({ ...formData, portionToGrams: value })}
                      min={1}
                      max={100}
                    >
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <Text fontSize="xs" color="gray.500">grams</Text>
                  </FormControl>
                )}
              </HStack>

              {formData.unit === 'portions' && (
                <Box p={3} bg={useColorModeValue('blue.50', 'blue.900')} borderRadius="md">
                  <Text fontSize="sm" fontWeight="medium">
                    Conversion: {formData.amount} portions × {formData.portionToGrams}g = {Math.round(getConvertedAmount())}g total
                  </Text>
                </Box>
              )}

              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any observations about eating behavior..."
                  rows={3}
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="green"
                leftIcon={<FaPlus />}
                size="lg"
              >
                Log Food Intake
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {/* Recent Entries */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <Heading size="md" mb={4}>Recent Meals</Heading>
          <VStack spacing={3} align="stretch">
            {foodEntries.length === 0 ? (
              <Text color="gray.500" textAlign="center" py={4}>
                No meals logged yet
              </Text>
            ) : (
              foodEntries.slice(0, 10).map((entry) => (
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
                    updateEntry('food', entry.id, entryToSave);
                    toast({
                      title: 'Meal updated',
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
                      key: 'foodCategory',
                      label: 'Category',
                      type: 'select',
                      options: [
                        { value: 'Dry', label: 'Dry Food' },
                        { value: 'Wet', label: 'Wet Food' }
                      ]
                    },
                    {
                      key: 'foodType',
                      label: 'Food Type',
                      type: 'text'
                    },
                    {
                      key: 'brand',
                      label: 'Brand',
                      type: 'text'
                    },
                    {
                      key: 'amount',
                      label: 'Amount',
                      type: 'number',
                      min: 1,
                      max: 1000,
                      step: 1
                    },
                    {
                      key: 'unit',
                      label: 'Unit',
                      type: 'select',
                      options: [
                        { value: 'portions', label: 'Portions' },
                        { value: 'grams', label: 'Grams' },
                        { value: 'cups', label: 'Cups' },
                        { value: 'pieces', label: 'Pieces' }
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
                        <Badge colorScheme={getCategoryColor(entry.foodCategory)}>
                          {entry.foodCategory}
                        </Badge>
                        <Badge colorScheme="green">
                          {entry.unit === 'portions' 
                            ? `${Math.round(entry.amount * (entry.portionToGrams || 10))}g (${entry.amount} portions)`
                            : entry.unit === 'cups'
                            ? `${Math.round(entry.amount * 120)}g (${entry.amount} cups)`
                            : entry.unit === 'pieces'
                            ? `${Math.round(entry.amount * 10)}g (${entry.amount} pieces)`
                            : `${Math.round(entry.amount)}g`}
                        </Badge>
                      </HStack>
                      <Text>
                        {entry.foodType}
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

export default FoodTracking;