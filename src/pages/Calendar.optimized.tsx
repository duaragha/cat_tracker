import React, { useState, useMemo, useCallback, memo } from 'react';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Grid,
  GridItem,
  Text,
  IconButton,
  Button,
  ButtonGroup,
  Badge,
  Card,
  CardBody,
  useColorModeValue,
  Tooltip,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  useToast,
} from '@chakra-ui/react';
import {
  FaCalendarAlt,
  FaChevronLeft,
  FaChevronRight,
  FaList,
  FaToilet,
  FaUtensils,
  FaBed,
  FaWeight,
  FaUser,
  FaTint,
} from 'react-icons/fa';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
  isWithinInterval,
} from 'date-fns';
import { useCatData } from '../contexts/CatDataContext';
import { EditableEntry } from '../components/EditableEntry';
import type { CalendarEvent, CalendarView } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_COLORS = {
  washroom: { bg: 'red.100', color: 'red.600', icon: FaToilet },
  food: { bg: 'green.100', color: 'green.600', icon: FaUtensils },
  sleep: { bg: 'purple.100', color: 'purple.600', icon: FaBed },
  weight: { bg: 'blue.100', color: 'blue.600', icon: FaWeight },
  profile: { bg: 'yellow.100', color: 'yellow.600', icon: FaUser },
};

// Memoized day cell component to prevent unnecessary re-renders
const DayCell = memo(({ 
  day, 
  events, 
  isCurrentMonth, 
  isCurrentDay, 
  borderColor, 
  bgColor, 
  todayBg, 
  hoverBg, 
  onDateClick 
}: {
  day: Date;
  events: CalendarEvent[];
  isCurrentMonth: boolean;
  isCurrentDay: boolean;
  borderColor: string;
  bgColor: string;
  todayBg: string;
  hoverBg: string;
  onDateClick: (date: Date) => void;
}) => {
  const handleClick = useCallback(() => {
    if (events.length > 0) {
      onDateClick(day);
    }
  }, [day, events.length, onDateClick]);

  const eventsByCategory = useMemo(() => 
    events.reduce((acc, event) => {
      if (!acc[event.category]) acc[event.category] = [];
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>)
  , [events]);

  return (
    <GridItem
      minH="100px"
      p={2}
      borderWidth={1}
      borderColor={borderColor}
      bg={isCurrentDay ? todayBg : bgColor}
      opacity={isCurrentMonth ? 1 : 0.5}
      cursor={events.length > 0 ? 'pointer' : 'default'}
      _hover={events.length > 0 ? { bg: hoverBg } : {}}
      onClick={handleClick}
    >
      <VStack align="stretch" spacing={1}>
        <Text
          fontSize="sm"
          fontWeight={isCurrentDay ? 'bold' : 'normal'}
          color={isCurrentDay ? 'blue.600' : undefined}
        >
          {format(day, 'd')}
        </Text>

        {Object.entries(eventsByCategory).map(([category, categoryEvents]) => (
          <HStack key={category} spacing={1}>
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS].color}
            />
            <Text fontSize="xs" noOfLines={1}>
              {categoryEvents.length} {category}
            </Text>
          </HStack>
        ))}

        {events.length > 3 && (
          <Text fontSize="xs" color="gray.500">
            +{events.length - 3} more
          </Text>
        )}
      </VStack>
    </GridItem>
  );
});

DayCell.displayName = 'DayCell';

// Memoized stats component
const MonthlyStatsCard = memo(({ 
  currentDate, 
  washroomEntries, 
  foodEntries, 
  sleepEntries, 
  weightEntries,
  bgColor,
  borderColor 
}: {
  currentDate: Date;
  washroomEntries: any[];
  foodEntries: any[];
  sleepEntries: any[];
  weightEntries: any[];
  bgColor: string;
  borderColor: string;
}) => {
  const monthlyStats = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Filter entries for current month with optimized filtering
    const isInMonth = (entry: any, dateField: string) => {
      const entryDate = entry[dateField] instanceof Date ? entry[dateField] : new Date(entry[dateField]);
      return isWithinInterval(entryDate, { start: monthStart, end: monthEnd });
    };

    const monthlyWashroom = washroomEntries.filter(entry => isInMonth(entry, 'timestamp'));
    const monthlyFood = foodEntries.filter(entry => isInMonth(entry, 'timestamp'));
    const monthlySleep = sleepEntries.filter(entry => isInMonth(entry, 'startTime'));
    const monthlyWeight = weightEntries.filter(entry => isInMonth(entry, 'measurementDate'));
    
    // Calculate totals with optimized math
    const totalFood = monthlyFood.reduce((total, entry) => {
      const entryAmount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
      const portionGrams = typeof entry.portionToGrams === 'string' ? parseFloat(entry.portionToGrams) : (entry.portionToGrams || 10);
      
      let amount = 0;
      switch (entry.unit) {
        case 'grams': amount = entryAmount; break;
        case 'cups': amount = entryAmount * 120; break;
        case 'portions': amount = entryAmount * portionGrams; break;
        default: amount = entryAmount * 10; break;
      }
      
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const totalSleepHours = monthlySleep.reduce((total, entry) => total + entry.duration, 0) / 60;
    
    const avgWeight = monthlyWeight.length > 0 
      ? monthlyWeight.reduce((sum, entry) => sum + entry.weight, 0) / monthlyWeight.length * 2.20462 
      : 0;
    
    return {
      washroom: monthlyWashroom.length,
      food: totalFood,
      sleep: totalSleepHours,
      weight: avgWeight
    };
  }, [currentDate, washroomEntries, foodEntries, sleepEntries, weightEntries]);

  const daysInMonth = useMemo(() => 
    new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  , [currentDate]);

  return (
    <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
      <CardBody>
        <Grid templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }} gap={4}>
          <Stat>
            <StatLabel fontSize="sm">Monthly Washroom Visits</StatLabel>
            <StatNumber fontSize="xl">{monthlyStats.washroom}</StatNumber>
            <StatHelpText fontSize="xs">
              ~{(monthlyStats.washroom / daysInMonth).toFixed(1)}/day
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel fontSize="sm">Monthly Food Eaten</StatLabel>
            <StatNumber fontSize="xl">
              {monthlyStats.food >= 1000 
                ? `${(monthlyStats.food / 1000).toFixed(1)}kg`
                : `${Math.round(monthlyStats.food)}g`}
            </StatNumber>
            <StatHelpText fontSize="xs">
              ~{Math.round(monthlyStats.food / daysInMonth)}g/day
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel fontSize="sm">Monthly Sleep Time</StatLabel>
            <StatNumber fontSize="xl">{monthlyStats.sleep.toFixed(1)}h</StatNumber>
            <StatHelpText fontSize="xs">
              ~{(monthlyStats.sleep / daysInMonth).toFixed(1)}h/day
            </StatHelpText>
          </Stat>
          
          <Stat>
            <StatLabel fontSize="sm">Monthly Weight Average</StatLabel>
            <StatNumber fontSize="xl">
              {monthlyStats.weight > 0 ? `${monthlyStats.weight.toFixed(1)} lb` : 'No data'}
            </StatNumber>
            <StatHelpText fontSize="xs">
              {monthlyStats.weight > 0 ? `${(monthlyStats.weight / 2.20462).toFixed(1)} kg` : '\u00A0'}
            </StatHelpText>
          </Stat>
        </Grid>
      </CardBody>
    </Card>
  );
});

MonthlyStatsCard.displayName = 'MonthlyStatsCard';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const toast = useToast();

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const { washroomEntries, foodEntries, sleepEntries, weightEntries, updateEntry, deleteEntry } = useCatData();

  // Memoize events transformation with stable sort
  const allEvents = useMemo(() => {
    // Pre-allocate arrays to reduce memory allocation
    const transformedEvents = [
      ...washroomEntries.map((entry) => ({
        id: entry.id,
        date: entry.timestamp,
        category: 'washroom' as const,
        title: `${entry.type.charAt(0).toUpperCase() + entry.type.slice(1)} - ${entry.consistency || 'Normal'}`,
        description: entry.notes,
        data: entry,
        color: CATEGORY_COLORS.washroom.color,
      })),
      ...foodEntries.map((entry) => {
        const displayAmount = entry.unit === 'portions' 
          ? entry.amount * (entry.portionToGrams || 10)
          : entry.unit === 'cups'
          ? entry.amount * 120
          : entry.unit === 'pieces'
          ? entry.amount * 10
          : entry.amount;
        
        return {
          id: entry.id,
          date: entry.timestamp,
          category: 'food' as const,
          title: `${entry.foodCategory} - ${displayAmount}g`,
          description: `${entry.foodType}${entry.brand ? ` (${entry.brand})` : ''}`,
          data: entry,
          color: CATEGORY_COLORS.food.color,
        };
      }),
      ...sleepEntries.map((entry) => ({
        id: entry.id,
        date: entry.startTime,
        category: 'sleep' as const,
        title: `Sleep - ${entry.duration} min`,
        description: `${entry.location || 'Unknown location'} - ${entry.quality || 'Normal'}`,
        data: entry,
        color: CATEGORY_COLORS.sleep.color,
      })),
      ...weightEntries.map((entry) => ({
        id: entry.id,
        date: entry.measurementDate,
        category: 'weight' as const,
        title: `Weight - ${(entry.weight * 2.20462).toFixed(1)} lb`,
        description: entry.notes,
        data: entry,
        color: CATEGORY_COLORS.weight.color,
      })),
    ];

    // Stable sort by date
    return transformedEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [washroomEntries, foodEntries, sleepEntries, weightEntries]);

  // Memoize events by date for efficient lookup
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    
    allEvents.forEach((event) => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      existing.push(event);
      map.set(dateKey, existing);
    });
    
    return map;
  }, [allEvents]);

  // Optimized function to get events for a specific date
  const getEventsForDate = useCallback((date: Date): CalendarEvent[] => {
    const dateKey = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(dateKey) || [];
  }, [eventsByDate]);

  // Memoize calendar days
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  // Memoized callback for date clicks
  const handleDateClick = useCallback((date: Date) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      setSelectedDate(date);
      setSelectedEvents(events);
      onOpen();
    }
  }, [getEventsForDate, onOpen]);

  const navigateMonth = useCallback((direction: 'prev' | 'next') => {
    setCurrentDate(current => direction === 'prev' ? subMonths(current, 1) : addMonths(current, 1));
  }, []);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  // Render calendar days with memoized components
  const renderCalendarDays = useMemo(() => {
    return calendarDays.map((day) => {
      const events = getEventsForDate(day);
      const isCurrentMonth = isSameMonth(day, currentDate);
      const isCurrentDay = isToday(day);

      return (
        <DayCell
          key={day.toISOString()}
          day={day}
          events={events}
          isCurrentMonth={isCurrentMonth}
          isCurrentDay={isCurrentDay}
          borderColor={borderColor}
          bgColor={bgColor}
          todayBg={todayBg}
          hoverBg={hoverBg}
          onDateClick={handleDateClick}
        />
      );
    });
  }, [calendarDays, getEventsForDate, currentDate, borderColor, bgColor, todayBg, hoverBg, handleDateClick]);

  const renderListView = useCallback(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const monthEvents = allEvents.filter(
      (event) => event.date >= monthStart && event.date <= monthEnd
    );

    const eventsByDate = monthEvents.reduce((acc, event) => {
      const dateKey = format(event.date, 'yyyy-MM-dd');
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <VStack align="stretch" spacing={4}>
        {Object.entries(eventsByDate)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([dateKey, events]) => (
            <Card key={dateKey} bg={bgColor} borderColor={borderColor} borderWidth={1}>
              <CardBody>
                <VStack align="stretch" spacing={3}>
                  <Heading size="sm">
                    {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                  </Heading>
                  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>
                    {events.map((event) => {
                      const Icon = CATEGORY_COLORS[event.category].icon;
                      return (
                        <HStack
                          key={event.id}
                          p={2}
                          borderWidth={1}
                          borderColor={borderColor}
                          borderRadius="md"
                          spacing={3}
                        >
                          <Box
                            p={2}
                            borderRadius="md"
                            bg={CATEGORY_COLORS[event.category].bg}
                            color={CATEGORY_COLORS[event.category].color}
                          >
                            <Icon />
                          </Box>
                          <VStack align="start" spacing={0} flex={1}>
                            <Text fontSize="sm" fontWeight="medium">
                              {event.title}
                            </Text>
                            {event.description && (
                              <Text fontSize="xs" color="gray.600">
                                {event.description}
                              </Text>
                            )}
                            <Text fontSize="xs" color="gray.500">
                              {format(event.date, 'h:mm a')}
                            </Text>
                          </VStack>
                        </HStack>
                      );
                    })}
                  </SimpleGrid>
                </VStack>
              </CardBody>
            </Card>
          ))}
      </VStack>
    );
  }, [currentDate, allEvents, bgColor, borderColor]);

  return (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <HStack justify="space-between">
            <HStack spacing={4}>
              <FaCalendarAlt size={24} />
              <Heading size="lg">Calendar</Heading>
            </HStack>

            <ButtonGroup size="sm">
              <Button
                variant={view === 'month' ? 'solid' : 'outline'}
                onClick={() => setView('month')}
                leftIcon={<FaCalendarAlt />}
              >
                Month
              </Button>
              <Button
                variant={view === 'list' ? 'solid' : 'outline'}
                onClick={() => setView('list')}
                leftIcon={<FaList />}
              >
                List
              </Button>
            </ButtonGroup>
          </HStack>
        </CardBody>
      </Card>

      {/* Navigation */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <HStack justify="space-between">
            <HStack>
              <IconButton
                aria-label="Previous month"
                icon={<FaChevronLeft />}
                onClick={() => navigateMonth('prev')}
                size="sm"
              />
              <IconButton
                aria-label="Next month"
                icon={<FaChevronRight />}
                onClick={() => navigateMonth('next')}
                size="sm"
              />
              <Button size="sm" onClick={goToToday}>
                Today
              </Button>
            </HStack>

            <Heading size="md">{format(currentDate, 'MMMM yyyy')}</Heading>

            <HStack>
              {Object.entries(CATEGORY_COLORS).map(([category, colors]) => {
                const Icon = colors.icon;
                return (
                  <Tooltip key={category} label={category} placement="top">
                    <Box p={1} borderRadius="md" bg={colors.bg} color={colors.color}>
                      <Icon size={14} />
                    </Box>
                  </Tooltip>
                );
              })}
            </HStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Monthly Statistics */}
      <MonthlyStatsCard
        currentDate={currentDate}
        washroomEntries={washroomEntries}
        foodEntries={foodEntries}
        sleepEntries={sleepEntries}
        weightEntries={weightEntries}
        bgColor={bgColor}
        borderColor={borderColor}
      />

      {/* Calendar View */}
      {view === 'month' ? (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <VStack align="stretch" spacing={0}>
              {/* Weekday headers */}
              <Grid templateColumns="repeat(7, 1fr)" gap={0}>
                {WEEKDAYS.map((day) => (
                  <GridItem
                    key={day}
                    p={2}
                    borderWidth={1}
                    borderColor={borderColor}
                    bg={useColorModeValue('gray.50', 'gray.700')}
                  >
                    <Text fontSize="sm" fontWeight="bold" textAlign="center">
                      {day}
                    </Text>
                  </GridItem>
                ))}
              </Grid>

              {/* Calendar days */}
              <Grid templateColumns="repeat(7, 1fr)" gap={0}>
                {renderCalendarDays}
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        renderListView()
      )}

      {/* Event Details Modal - Simplified for performance */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedDate && format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack align="stretch" spacing={4}>
              {selectedEvents.map((event) => {
                const eventData = event.data as any;

                // Get fields configuration based on category
                const getFieldsForCategory = (category: string) => {
                  // Same field configuration as original...
                  switch (category) {
                    case 'washroom':
                      return [
                        { key: 'timestamp', label: 'Date & Time', type: 'datetime' as const },
                        { 
                          key: 'type', 
                          label: 'Type', 
                          type: 'select' as const,
                          options: [
                            { value: 'pee', label: 'Pee' },
                            { value: 'pooper', label: 'Pooper' },
                            { value: 'both', label: 'Both' }
                          ]
                        },
                        { 
                          key: 'consistency', 
                          label: 'Consistency', 
                          type: 'select' as const,
                          options: [
                            { value: 'firm', label: 'Firm' },
                            { value: 'soft', label: 'Soft' },
                            { value: 'half n half', label: 'Half n Half' },
                            { value: 'diarrhea', label: 'Diarrhea' }
                          ]
                        },
                        { 
                          key: 'color', 
                          label: 'Color', 
                          type: 'select' as const,
                          options: [
                            { value: 'yellow', label: 'Yellow' },
                            { value: 'green', label: 'Green' },
                            { value: 'brown', label: 'Brown' },
                            { value: 'dark brown', label: 'Dark Brown' },
                            { value: 'black', label: 'Black' },
                            { value: 'other', label: 'Other' }
                          ]
                        },
                        { key: 'hasBlood', label: 'Blood Present', type: 'checkbox' as const },
                        { key: 'photos', label: 'Photos', type: 'photos' as const, maxFiles: 3 },
                        { key: 'notes', label: 'Notes', type: 'textarea' as const }
                      ];
                    // ... other cases would be similar
                    default:
                      return [];
                  }
                };

                const handleSave = useCallback((updatedEntry: any) => {
                  // Convert date strings to Date objects if needed
                  const entryToSave = { ...updatedEntry };
                  
                  if (event.category === 'washroom' && !(updatedEntry.timestamp instanceof Date)) {
                    entryToSave.timestamp = new Date(updatedEntry.timestamp);
                  }
                  // ... other date conversions

                  updateEntry(event.category, event.id, entryToSave);
                  toast({
                    title: `${event.category.charAt(0).toUpperCase() + event.category.slice(1)} entry updated`,
                    status: 'success',
                    duration: 2000,
                    isClosable: true,
                  });
                }, [event.category, event.id, updateEntry, toast]);

                const handleDelete = useCallback((id: string) => {
                  deleteEntry(event.category, id);
                  toast({
                    title: 'Entry deleted',
                    status: 'info',
                    duration: 2000,
                    isClosable: true,
                  });
                  setSelectedEvents(prev => prev.filter(e => e.id !== id));
                  if (selectedEvents.length === 1) {
                    onClose();
                  }
                }, [event.category, deleteEntry, toast, selectedEvents.length, onClose]);

                return (
                  <EditableEntry
                    key={event.id}
                    entry={eventData}
                    onSave={handleSave}
                    onDelete={handleDelete}
                    fields={getFieldsForCategory(event.category)}
                    renderDisplay={() => {
                      const Icon = CATEGORY_COLORS[event.category].icon;
                      
                      return (
                        <VStack align="start" spacing={2}>
                          <HStack spacing={3}>
                            <Box
                              p={2}
                              borderRadius="md"
                              bg={CATEGORY_COLORS[event.category].bg}
                              color={CATEGORY_COLORS[event.category].color}
                            >
                              <Icon />
                            </Box>
                            <VStack align="start" spacing={0} flex={1}>
                              <Text fontWeight="bold">{event.title}</Text>
                              <Text fontSize="sm" color="gray.600">
                                {format(event.date, 'h:mm a')}
                              </Text>
                            </VStack>
                          </HStack>

                          {event.description && (
                            <Text fontSize="sm">
                              {event.description}
                            </Text>
                          )}

                          {event.category === 'washroom' && eventData.hasBlood && (
                            <Badge colorScheme="red">
                              <FaTint style={{ marginRight: '4px' }} />
                              Blood Present
                            </Badge>
                          )}

                          {eventData.photos?.length > 0 && (
                            <Text fontSize="xs" color="gray.500">
                              📷 {eventData.photos.length} photo{eventData.photos.length > 1 ? 's' : ''}
                            </Text>
                          )}

                          {eventData.notes && (
                            <Text fontSize="sm" color="gray.600">
                              Notes: {eventData.notes}
                            </Text>
                          )}
                        </VStack>
                      );
                    }}
                  />
                );
              })}
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default Calendar;