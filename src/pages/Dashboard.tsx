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
import { useState } from 'react';
import { FaUtensils, FaBed, FaWeight, FaCamera, FaToilet } from 'react-icons/fa';
import { PhotoThumbnailGrid } from '../components/PhotoThumbnailGrid';
import { PhotoViewer } from '../components/PhotoViewer';
import { useCatData } from '../contexts/CatDataContext';
import { format, isToday } from 'date-fns';
import { useNavigate } from 'react-router-dom';

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
  const [photoViewerOpen, setPhotoViewerOpen] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Calculate today's stats
  const todayWashroom = washroomEntries.filter(entry => 
    isToday(entry.timestamp)
  ).length;
  
  const todayFood = foodEntries.filter(entry => 
    isToday(entry.timestamp)
  );
  
  const todayFoodAmount = todayFood.reduce((total, entry) => {
    const entryAmount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
    const portionGrams = typeof entry.portionToGrams === 'string' ? parseFloat(entry.portionToGrams) : (entry.portionToGrams || 10);
    
    const amount = entry.unit === 'grams' ? entryAmount : 
                  entry.unit === 'cups' ? entryAmount * 120 : // 1 cup ≈ 120g for dry food
                  entry.unit === 'portions' ? entryAmount * portionGrams : // portions with conversion
                  entryAmount * 10; // pieces default to 10g each
    
    const validAmount = isNaN(amount) ? 0 : amount;
    return total + validAmount;
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
                <HStack key={entry.id} justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Icon as={FaToilet} color="blue.500" />
                      <Text>Washroom visit ({entry.type})</Text>
                    </HStack>
                    {entry.photos && entry.photos.length > 0 && (
                      <PhotoThumbnailGrid
                        photos={entry.photos}
                        maxVisible={2}
                        size="xs"
                        onPhotoClick={(index) => {
                          setSelectedPhotos(entry.photos!);
                          setSelectedPhotoIndex(index);
                          setPhotoViewerOpen(true);
                        }}
                      />
                    )}
                  </VStack>
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
                <HStack key={entry.id} justify="space-between" align="start">
                  <VStack align="start" spacing={1} flex={1}>
                    <HStack>
                      <Icon as={FaBed} color="purple.500" />
                      <Text>Sleep - {(entry.duration / 60).toFixed(1)} hours</Text>
                    </HStack>
                    {entry.photos && entry.photos.length > 0 && (
                      <PhotoThumbnailGrid
                        photos={entry.photos}
                        maxVisible={2}
                        size="xs"
                        onPhotoClick={(index) => {
                          setSelectedPhotos(entry.photos!);
                          setSelectedPhotoIndex(index);
                          setPhotoViewerOpen(true);
                        }}
                      />
                    )}
                  </VStack>
                  <Text fontSize="sm" color="gray.600">
                    {format(entry.startTime, 'h:mm a')}
                  </Text>
                </HStack>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </VStack>
      
      {/* Photo Viewer Modal */}
      <PhotoViewer
        photos={selectedPhotos}
        initialIndex={selectedPhotoIndex}
        isOpen={photoViewerOpen}
        onClose={() => setPhotoViewerOpen(false)}
        title="Recent Activity Photos"
      />
    </Container>
  );
};

export default Dashboard;