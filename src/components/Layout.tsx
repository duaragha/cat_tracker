import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useColorMode,
  useColorModeValue,
  Container,
  Icon,
  Text,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
} from '@chakra-ui/react';
import { 
  FaMoon, 
  FaSun, 
  FaBars, 
  FaPaw,
  FaHome,
  FaCalendarAlt,
  FaToilet,
  FaUtensils,
  FaBed,
  FaWeight,
  FaCamera,
  FaChartLine,
  FaUser,
  FaFileExport
} from 'react-icons/fa';
import { Link as RouterLink, useLocation, Outlet } from 'react-router-dom';
import { useCatData } from '../contexts/CatDataContext';

const NavItem = ({ icon, children, to, onClick }: { icon: any; children: string; to: string; onClick?: () => void }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  const bgColor = useColorModeValue('blue.50', 'blue.900');
  const color = useColorModeValue('blue.600', 'blue.200');

  return (
    <Button
      as={RouterLink}
      to={to}
      leftIcon={<Icon as={icon} />}
      variant={isActive ? 'solid' : 'ghost'}
      bg={isActive ? bgColor : 'transparent'}
      color={isActive ? color : 'inherit'}
      justifyContent="flex-start"
      width="full"
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

const Layout = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { catProfile } = useCatData();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const navItems = [
    { icon: FaHome, label: 'Dashboard', path: '/' },
    { icon: FaCalendarAlt, label: 'Calendar', path: '/calendar' },
    { icon: FaToilet, label: 'Washroom', path: '/washroom' },
    { icon: FaUtensils, label: 'Food', path: '/food' },
    { icon: FaBed, label: 'Sleep', path: '/sleep' },
    { icon: FaWeight, label: 'Weight', path: '/weight' },
    { icon: FaCamera, label: 'Photos', path: '/photos' },
    { icon: FaChartLine, label: 'Analytics', path: '/analytics' },
    { icon: FaUser, label: 'Profile', path: '/profile' },
    { icon: FaFileExport, label: 'Export', path: '/export' },
  ];

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      {/* Mobile Header */}
      <Flex
        bg={bgColor}
        px={4}
        h={16}
        alignItems="center"
        borderBottomWidth={1}
        borderColor={borderColor}
        display={{ base: 'flex', md: 'none' }}
      >
        <IconButton
          icon={<FaBars />}
          variant="ghost"
          onClick={onOpen}
          aria-label="Open menu"
        />
        <HStack flex={1} justify="center">
          <Icon as={FaPaw} boxSize={6} color="blue.500" />
          <Text fontSize="xl" fontWeight="bold">
            {catProfile?.name || 'Cat'} Tracker
          </Text>
        </HStack>
        <IconButton
          icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
          onClick={toggleColorMode}
          variant="ghost"
          aria-label="Toggle color mode"
        />
      </Flex>

      <Flex>
        {/* Desktop Sidebar */}
        <Box
          display={{ base: 'none', md: 'block' }}
          w={64}
          bg={bgColor}
          borderRightWidth={1}
          borderColor={borderColor}
          h="100vh"
          position="sticky"
          top={0}
        >
          <VStack h="full" spacing={0}>
            <HStack p={6} w="full" justify="space-between">
              <HStack>
                <Icon as={FaPaw} boxSize={8} color="blue.500" />
                <Text fontSize="xl" fontWeight="bold">
                  {catProfile?.name || 'Cat'} Tracker
                </Text>
              </HStack>
              <IconButton
                icon={colorMode === 'light' ? <FaMoon /> : <FaSun />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                aria-label="Toggle color mode"
              />
            </HStack>
            
            <VStack flex={1} w="full" px={4} spacing={2}>
              {navItems.map((item) => (
                <NavItem key={item.path} icon={item.icon} to={item.path}>
                  {item.label}
                </NavItem>
              ))}
            </VStack>
          </VStack>
        </Box>

        {/* Mobile Drawer */}
        <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              <HStack>
                <Icon as={FaPaw} boxSize={6} color="blue.500" />
                <Text>{catProfile?.name || 'Cat'} Tracker</Text>
              </HStack>
            </DrawerHeader>
            <DrawerBody>
              <VStack spacing={2}>
                {navItems.map((item) => (
                  <NavItem key={item.path} icon={item.icon} to={item.path} onClick={onClose}>
                    {item.label}
                  </NavItem>
                ))}
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        <Box flex={1}>
          <Container maxW="container.xl" py={{ base: 4, md: 8 }}>
            <Outlet />
          </Container>
        </Box>
      </Flex>
    </Box>
  );
};

export default Layout;