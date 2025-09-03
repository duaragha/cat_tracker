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
  Flex
} from '@chakra-ui/react';
import { FaPaw, FaUtensils, FaBed, FaWeight, FaCamera, FaToilet } from 'react-icons/fa';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import SyncIndicator from '../components/SyncIndicator';

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

  // Calculate today's stats
  const todayWashroom = washroomEntries.filter(entry => 
    isToday(entry.timestamp)
  ).length;
  
  const todayFood = foodEntries.filter(entry => 
    isToday(entry.timestamp)
  );
  
  const todayFoodAmount = todayFood.reduce((total, entry) => {
    const amount = entry.unit === 'grams' ? entry.amount : entry.amount * 100;
    return total + amount;
  }, 0);
  
  const todaySleep = sleepEntries.filter(entry => 
    isToday(entry.startTime)
  );
  
  const todaySleepHours = todaySleep.reduce((total, entry) => 
    total + entry.duration, 0
  ) / 60;

  const latestWeight = weightEntries[0]?.weight ? (weightEntries[0].weight * 2.20462) : undefined;
  const previousWeight = weightEntries[1]?.weight ? (weightEntries[1].weight * 2.20462) : undefined;
  const weightChange = latestWeight && previousWeight ? 
    (latestWeight - previousWeight).toFixed(1) : null;

  const statCards = [
    {
      label: 'Washroom Visits',
      value: todayWashroom.toString(),
      helpText: 'Today',
      icon: FaToilet,
      color: 'blue.500',
      route: '/washroom'
    },
    {
      label: 'Food Consumed',
      value: `${todayFoodAmount}g`,
      helpText: `${todayFood.length} meals today`,
      icon: FaUtensils,
      color: 'green.500',
      route: '/food'
    },
    {
      label: 'Sleep',
      value: `${todaySleepHours.toFixed(1)}h`,
      helpText: 'Today',
      icon: FaBed,
      color: 'purple.500',
      route: '/sleep'
    },
    {
      label: 'Weight',
      value: latestWeight ? `${latestWeight.toFixed(1)} lb` : 'No data',
      helpText: weightChange ? `${Number(weightChange) > 0 ? '+' : ''}${weightChange} lb` : 'Track weight',
      icon: FaWeight,
      color: 'orange.500',
      route: '/weight'
    }
  ];

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
            <VStack align="start" spacing={1}>
              <HStack>
                <Heading size="xl">
                  <Icon as={FaPaw} mr={2} />
                  {catProfile.name}'s Dashboard
                </Heading>
                <SyncIndicator />
              </HStack>
              <Text color="gray.600">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Text>
            </VStack>
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
            <Card 
              key={index}
              bg={bgColor}
              borderColor={borderColor}
              borderWidth={1}
              cursor="pointer"
              onClick={() => navigate(stat.route)}
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
              {washroomEntries.slice(0, 3).map((entry) => (
                <HStack key={entry.id} justify="space-between">
                  <HStack>
                    <Icon as={FaToilet} color="blue.500" />
                    <Text>Washroom visit ({entry.type})</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {format(entry.timestamp, 'h:mm a')}
                  </Text>
                </HStack>
              ))}
              {foodEntries.slice(0, 3).map((entry) => (
                <HStack key={entry.id} justify="space-between">
                  <HStack>
                    <Icon as={FaUtensils} color="green.500" />
                    <Text>{entry.foodType} - {entry.amount}{entry.unit}</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {format(entry.timestamp, 'h:mm a')}
                  </Text>
                </HStack>
              ))}
              {sleepEntries.slice(0, 2).map((entry) => (
                <HStack key={entry.id} justify="space-between">
                  <HStack>
                    <Icon as={FaBed} color="purple.500" />
                    <Text>Sleep - {(entry.duration / 60).toFixed(1)} hours</Text>
                  </HStack>
                  <Text fontSize="sm" color="gray.600">
                    {format(entry.startTime, 'h:mm a')}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
    </Container>
  );
};

export default Dashboard;