import React, { useState, useMemo } from 'react';
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
  Image,
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
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  isSameMonth,
} from 'date-fns';
import { useCatData } from '../contexts/CatDataContext';
import type { CalendarEvent, CalendarView } from '../types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CATEGORY_COLORS = {
  washroom: { bg: 'red.100', color: 'red.600', icon: FaToilet },
  food: { bg: 'green.100', color: 'green.600', icon: FaUtensils },
  sleep: { bg: 'purple.100', color: 'purple.600', icon: FaBed },
  weight: { bg: 'blue.100', color: 'blue.600', icon: FaWeight },
  profile: { bg: 'yellow.100', color: 'yellow.600', icon: FaUser },
};

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const todayBg = useColorModeValue('blue.50', 'blue.900');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const { washroomEntries, foodEntries, sleepEntries, weightEntries } = useCatData();

  // Aggregate all events for the calendar
  const allEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add washroom events
    washroomEntries.forEach((entry) => {
      events.push({
        id: entry.id,
        date: entry.timestamp,
        category: 'washroom',
        title: `${entry.type} - ${entry.consistency || 'Normal'}`,
        description: entry.notes,
        data: entry,
        color: CATEGORY_COLORS.washroom.color,
      });
    });

    // Add food events
    foodEntries.forEach((entry) => {
      const displayAmount = entry.unit === 'portions' 
        ? entry.amount * (entry.portionToGrams || 10)
        : entry.unit === 'cups'
        ? entry.amount * 120
        : entry.unit === 'pieces'
        ? entry.amount * 10
        : entry.amount;
      
      events.push({
        id: entry.id,
        date: entry.timestamp,
        category: 'food',
        title: `${entry.foodCategory} - ${displayAmount}g`,
        description: `${entry.foodType}${entry.brand ? ` (${entry.brand})` : ''}`,
        data: entry,
        color: CATEGORY_COLORS.food.color,
      });
    });

    // Add sleep events
    sleepEntries.forEach((entry) => {
      events.push({
        id: entry.id,
        date: entry.startTime,
        category: 'sleep',
        title: `Sleep - ${entry.duration} min`,
        description: `${entry.location || 'Unknown location'} - ${entry.quality || 'Normal'}`,
        data: entry,
        color: CATEGORY_COLORS.sleep.color,
      });
    });

    // Add weight events
    weightEntries.forEach((entry) => {
      events.push({
        id: entry.id,
        date: entry.measurementDate,
        category: 'weight',
        title: `Weight - ${(entry.weight * 2.20462).toFixed(1)} lb`,
        description: entry.notes,
        data: entry,
        color: CATEGORY_COLORS.weight.color,
      });
    });

    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [washroomEntries, foodEntries, sleepEntries, weightEntries]);

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    return allEvents.filter((event) => isSameDay(event.date, date));
  };

  // Get calendar days for month view
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: startDate, end: endDate });
  }, [currentDate]);

  const handleDateClick = (date: Date) => {
    const events = getEventsForDate(date);
    if (events.length > 0) {
      setSelectedDate(date);
      setSelectedEvents(events);
      onOpen();
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const renderDayCell = (day: Date) => {
    const events = getEventsForDate(day);
    const isCurrentMonth = isSameMonth(day, currentDate);
    const isCurrentDay = isToday(day);

    const eventsByCategory = events.reduce((acc, event) => {
      if (!acc[event.category]) acc[event.category] = [];
      acc[event.category].push(event);
      return acc;
    }, {} as Record<string, CalendarEvent[]>);

    return (
      <GridItem
        key={day.toISOString()}
        minH="100px"
        p={2}
        borderWidth={1}
        borderColor={borderColor}
        bg={isCurrentDay ? todayBg : bgColor}
        opacity={isCurrentMonth ? 1 : 0.5}
        cursor={events.length > 0 ? 'pointer' : 'default'}
        _hover={events.length > 0 ? { bg: hoverBg } : {}}
        onClick={() => handleDateClick(day)}
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
  };

  const renderListView = () => {
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
  };

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
                {calendarDays.map((day) => renderDayCell(day))}
              </Grid>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        renderListView()
      )}

      {/* Event Details Modal */}
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
                const Icon = CATEGORY_COLORS[event.category].icon;
                const eventData = event.data as any;

                return (
                  <Box
                    key={event.id}
                    p={4}
                    borderWidth={1}
                    borderColor={borderColor}
                    borderRadius="md"
                  >
                    <HStack spacing={3} mb={3}>
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
                      <Text fontSize="sm" mb={2}>
                        {event.description}
                      </Text>
                    )}

                    {/* Category-specific details */}
                    {event.category === 'washroom' && eventData.hasBlood && (
                      <Badge colorScheme="red" mb={2}>
                        <FaTint style={{ marginRight: '4px' }} />
                        Blood Present
                      </Badge>
                    )}

                    {event.category === 'washroom' && eventData.photos?.length > 0 && (
                      <SimpleGrid columns={3} spacing={2} mt={2}>
                        {eventData.photos.map((photo: string, idx: number) => (
                          <Image
                            key={idx}
                            src={photo}
                            alt={`Photo ${idx + 1}`}
                            borderRadius="md"
                            h="80px"
                            objectFit="cover"
                          />
                        ))}
                      </SimpleGrid>
                    )}

                    {event.category === 'weight' && eventData.photos?.length > 0 && (
                      <SimpleGrid columns={2} spacing={2} mt={2}>
                        {eventData.photos.map((photo: string, idx: number) => (
                          <Image
                            key={idx}
                            src={photo}
                            alt={`Weight photo ${idx + 1}`}
                            borderRadius="md"
                            h="100px"
                            objectFit="cover"
                          />
                        ))}
                      </SimpleGrid>
                    )}

                    {eventData.notes && (
                      <Text fontSize="sm" color="gray.600" mt={2}>
                        Notes: {eventData.notes}
                      </Text>
                    )}
                  </Box>
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