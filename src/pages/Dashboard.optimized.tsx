import { 
  Box, 
  Container, 
  Grid, 
  Heading, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText,
  Card,
  CardBody,
  Text,
  VStack,
  HStack,
  Icon,
  useColorModeValue,
  Button,
  Flex,
  Avatar
} from '@chakra-ui/react';
import { FaUtensils, FaBed, FaWeight, FaCamera, FaToilet } from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useMemo, memo, useCallback } from 'react';

// Memoized stat card to prevent unnecessary re-renders
const StatCard = memo(({ 
  stat, 
  bgColor, 
  borderColor, 
  onNavigate 
}: { 
  stat: any; 
  bgColor: string; 
  borderColor: string; 
  onNavigate: (route: string) => void;
}) => {
  const handleClick = useCallback(() => {
    onNavigate(stat.route);
  }, [stat.route, onNavigate]);

  return (
    <Card 
      bg={bgColor}
      borderColor={borderColor}
      borderWidth={1}
      cursor="pointer"
      onClick={handleClick}
      _hover={{ 
        transform: 'translateY(-2px)', 
        boxShadow: 'lg',
        transition: 'all 0.2s'
      }}
    >
      <CardBody>
        <Stat>
          <HStack mb={2}>
            <Icon as={stat.icon} color={stat.color} boxSize={5} />
            <StatLabel>{stat.label}</StatLabel>
          </HStack>
          <StatNumber fontSize="2xl">{stat.value}</StatNumber>
          <StatHelpText>{stat.helpText}</StatHelpText>
        </Stat>
      </CardBody>
    </Card>
  );
});

StatCard.displayName = 'StatCard';

// Memoized recent activity item
const ActivityItem = memo(({ 
  entry, 
  icon, 
  color, 
  children 
}: { 
  entry: any; 
  icon: any; 
  color: string; 
  children: React.ReactNode;
}) => (
  <HStack justify="space-between">
    <HStack>
      <Icon as={icon} color={color} />
      <Text>{children}</Text>
    </HStack>
    <Text fontSize="sm" color="gray.600">
      {format(entry.timestamp || entry.startTime, 'h:mm a')}
    </Text>
  </HStack>
));

ActivityItem.displayName = 'ActivityItem';

const Dashboard = () => {
  const { 
    catProfile, 
    washroomEntries, 
    foodEntries, 
    sleepEntries, 
    weightEntries
  } = useCatData();
  
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  // Memoized navigation handler
  const handleNavigate = useCallback((route: string) => {
    navigate(route);
  }, [navigate]);

  // Memoize today's calculations to prevent recalculation on every render
  const todayStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Optimized filtering with early returns
    const todayWashroomCount = washroomEntries.reduce((count, entry) => 
      isToday(entry.timestamp) ? count + 1 : count, 0
    );
    
    const todayFoodData = foodEntries.filter(entry => isToday(entry.timestamp));
    
    const todayFoodAmount = todayFoodData.reduce((total, entry) => {
      const entryAmount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
      const portionGrams = typeof entry.portionToGrams === 'string' ? parseFloat(entry.portionToGrams) : (entry.portionToGrams || 10);
      
      let amount = 0;
      switch (entry.unit) {
        case 'grams': amount = entryAmount; break;
        case 'cups': amount = entryAmount * 120; break; // 1 cup ≈ 120g for dry food
        case 'portions': amount = entryAmount * portionGrams; break; // portions with conversion
        default: amount = entryAmount * 10; break; // pieces default to 10g each
      }
      
      return total + (isNaN(amount) ? 0 : amount);
    }, 0);
    
    const todaySleeData = sleepEntries.filter(entry => isToday(entry.startTime));
    const todaySleepHours = todaySleeData.reduce((total, entry) => total + entry.duration, 0) / 60;

    return {
      washroomCount: todayWashroomCount,
      foodAmount: todayFoodAmount,
      foodMeals: todayFoodData.length,
      sleepHours: todaySleepHours
    };
  }, [washroomEntries, foodEntries, sleepEntries]);

  // Memoize weight calculations
  const weightStats = useMemo(() => {
    if (weightEntries.length === 0) return { latest: undefined, change: null };
    
    const latestWeight = weightEntries[0]?.weight ? (weightEntries[0].weight * 2.20462) : undefined;
    const previousWeight = weightEntries[1]?.weight ? (weightEntries[1].weight * 2.20462) : undefined;
    const weightChange = latestWeight && previousWeight ? 
      (latestWeight - previousWeight).toFixed(1) : null;

    return { latest: latestWeight, change: weightChange };
  }, [weightEntries]);

  // Memoize stat cards configuration
  const statCards = useMemo(() => [
    {
      label: 'Washroom Visits',
      value: todayStats.washroomCount.toString(),
      helpText: 'Today',
      icon: FaToilet,
      color: 'blue.500',
      route: '/washroom'
    },
    {
      label: 'Food Consumed',
      value: `${todayStats.foodAmount}g`,
      helpText: `${todayStats.foodMeals} meals today`,
      icon: FaUtensils,
      color: 'green.500',
      route: '/food'
    },
    {
      label: 'Sleep',
      value: `${todayStats.sleepHours.toFixed(1)}h`,
      helpText: 'Today',
      icon: FaBed,
      color: 'purple.500',
      route: '/sleep'
    },
    {
      label: 'Weight',
      value: weightStats.latest ? `${weightStats.latest.toFixed(1)} lb` : 'No data',
      helpText: weightStats.change ? `${Number(weightStats.change) > 0 ? '+' : ''}${weightStats.change} lb` : 'Track weight',
      icon: FaWeight,
      color: 'orange.500',
      route: '/weight'
    }
  ], [todayStats, weightStats]);

  // Memoize recent activities to prevent recalculation
  const recentActivities = useMemo(() => {
    const activities = [];

    // Get recent washroom entries (limit to 3)
    activities.push(
      ...washroomEntries.slice(0, 3).map((entry) => ({
        id: `washroom-${entry.id}`,
        type: 'washroom',
        entry,
        icon: FaToilet,
        color: 'blue.500',
        content: `Washroom visit (${entry.type})`
      }))
    );

    // Get recent food entries (limit to 3)
    activities.push(
      ...foodEntries.slice(0, 3).map((entry) => ({
        id: `food-${entry.id}`,
        type: 'food',
        entry,
        icon: FaUtensils,
        color: 'green.500',
        content: `${entry.foodType} - ${entry.amount}${entry.unit}`
      }))
    );

    // Get recent sleep entries (limit to 2)
    activities.push(
      ...sleepEntries.slice(0, 2).map((entry) => ({
        id: `sleep-${entry.id}`,
        type: 'sleep',
        entry,
        icon: FaBed,
        color: 'purple.500',
        content: `Sleep - ${(entry.duration / 60).toFixed(1)} hours`
      }))
    );

    // Sort by timestamp and limit total
    return activities
      .sort((a, b) => {
        const aTime = 'timestamp' in a.entry 
          ? a.entry.timestamp.getTime() 
          : a.entry.startTime.getTime();
        const bTime = 'timestamp' in b.entry 
          ? b.entry.timestamp.getTime() 
          : b.entry.startTime.getTime();
        return bTime - aTime;
      })
      .slice(0, 8); // Show max 8 recent activities
  }, [washroomEntries, foodEntries, sleepEntries]);

  if (!catProfile) {
    return (
      <Container maxW="container.xl" py={8}>
        <VStack spacing={8}>
          <Heading>Welcome to Cat Tracker!</Heading>
          <Text fontSize="lg">Start by setting up your cat's profile</Text>
          <Button 
            colorScheme="blue" 
            size="lg"
            onClick={() => navigate('/profile')}
          >
            Set Up Cat Profile
          </Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <Avatar
                size="lg"
                name={catProfile.name}
                src={catProfile.photoUrl}
                bg="blue.500"
              />
              <VStack align="start" spacing={1}>
                <Heading size="xl">
                  {catProfile.name}'s Dashboard
                </Heading>
                <Text color="gray.600">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </Text>
              </VStack>
            </HStack>
            <Button
              leftIcon={<FaCamera />}
              colorScheme="teal"
              onClick={() => navigate('/photos')}
            >
              View Photos
            </Button>
          </HStack>
        </Box>

        {/* Stats Grid */}
        <Grid 
          templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }}
          gap={6}
        >
          {statCards.map((stat, index) => (
            <StatCard 
              key={index}
              stat={stat}
              bgColor={bgColor}
              borderColor={borderColor}
              onNavigate={handleNavigate}
            />
          ))}
        </Grid>

        {/* Quick Actions */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Heading size="md" mb={4}>Quick Actions</Heading>
            <Flex gap={3} wrap="wrap">
              <Button 
                leftIcon={<FaToilet />} 
                colorScheme="blue"
                onClick={() => navigate('/washroom')}
              >
                Log Washroom
              </Button>
              <Button 
                leftIcon={<FaUtensils />} 
                colorScheme="green"
                onClick={() => navigate('/food')}
              >
                Log Food
              </Button>
              <Button 
                leftIcon={<FaBed />} 
                colorScheme="purple"
                onClick={() => navigate('/sleep')}
              >
                Log Sleep
              </Button>
              <Button 
                leftIcon={<FaWeight />} 
                colorScheme="orange"
                onClick={() => navigate('/weight')}
              >
                Log Weight
              </Button>
              <Button 
                leftIcon={<FaCamera />} 
                colorScheme="teal"
                onClick={() => navigate('/photos')}
              >
                Add Photo
              </Button>
            </Flex>
          </CardBody>
        </Card>

        {/* Recent Activity */}
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <Heading size="md" mb={4}>Recent Activity</Heading>
            <VStack align="stretch" spacing={3}>
              {recentActivities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  entry={activity.entry}
                  icon={activity.icon}
                  color={activity.color}
                >
                  {activity.content}
                </ActivityItem>
              ))}
              {recentActivities.length === 0 && (
                <Text color="gray.500" textAlign="center">
                  No recent activity. Start tracking your cat's data!
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Dashboard;