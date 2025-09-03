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
  useToast,
  Text,
  Avatar,
  useColorModeValue,
  Divider
} from '@chakra-ui/react';
import { FaUser, FaSave, FaCamera, FaTrash } from 'react-icons/fa';
import { useState, useRef } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format } from 'date-fns';

const Profile = () => {
  const { catProfile, setCatProfile, clearAllData } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: catProfile?.name || '',
    breed: catProfile?.breed || '',
    birthDate: catProfile?.birthDate ? format(catProfile.birthDate, 'yyyy-MM-dd') : '',
    gotchaDate: catProfile?.gotchaDate ? format(catProfile.gotchaDate, 'yyyy-MM-dd') : '',
    weight: catProfile?.weight ? (catProfile.weight * 2.20462) : 0
  });

  const [photoUrl, setPhotoUrl] = useState(catProfile?.photoUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name) {
      toast({
        title: 'Please enter your cat\'s name',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const profileData = {
      id: catProfile?.id || `cat-${Date.now()}`,
      name: formData.name,
      breed: formData.breed,
      birthDate: formData.birthDate ? new Date(formData.birthDate) : undefined,
      gotchaDate: formData.gotchaDate ? new Date(formData.gotchaDate) : undefined,
      weight: formData.weight ? (formData.weight / 2.20462) : undefined,
      photoUrl: photoUrl || undefined,
      createdAt: catProfile?.createdAt || new Date(),
      updatedAt: new Date()
    };

    setCatProfile(profileData);

    toast({
      title: 'Profile updated successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) {
      clearAllData();
      setFormData({
        name: '',
        breed: '',
        birthDate: '',
        gotchaDate: '',
        weight: 0
      });
      setPhotoUrl('');
      toast({
        title: 'All data cleared',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const calculateAge = () => {
    if (!catProfile?.birthDate) return null;
    const today = new Date();
    const birthDate = new Date(catProfile.birthDate);
    
    // Calculate total days difference
    const totalDays = Math.floor((today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate years, months, and weeks
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const remainingDaysAfterMonths = remainingDaysAfterYears % 30;
    const weeks = Math.floor(remainingDaysAfterMonths / 7);
    
    // Build the age string
    const parts = [];
    if (years > 0) {
      parts.push(`${years} year${years > 1 ? 's' : ''}`);
    }
    if (months > 0) {
      parts.push(`${months} month${months > 1 ? 's' : ''}`);
    }
    if (weeks > 0) {
      parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Less than 1 week';
  };

  const calculateTimeSinceGotcha = () => {
    if (!catProfile?.gotchaDate) return null;
    const today = new Date();
    const gotchaDate = new Date(catProfile.gotchaDate);
    
    // Calculate total days difference
    const totalDays = Math.floor((today.getTime() - gotchaDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate years, months, and weeks
    const years = Math.floor(totalDays / 365);
    const remainingDaysAfterYears = totalDays % 365;
    const months = Math.floor(remainingDaysAfterYears / 30);
    const remainingDaysAfterMonths = remainingDaysAfterYears % 30;
    const weeks = Math.floor(remainingDaysAfterMonths / 7);
    
    // Build the time string
    const parts = [];
    if (years > 0) {
      parts.push(`${years} year${years > 1 ? 's' : ''}`);
    }
    if (months > 0) {
      parts.push(`${months} month${months > 1 ? 's' : ''}`);
    }
    if (weeks > 0) {
      parts.push(`${weeks} week${weeks > 1 ? 's' : ''}`);
    }
    
    return parts.length > 0 ? parts.join(', ') : 'Less than 1 week';
  };

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaUser style={{ display: 'inline', marginRight: '8px' }} />
          Cat Profile
        </Heading>
        <Button
          colorScheme="red"
          variant="outline"
          leftIcon={<FaTrash />}
          onClick={handleClearData}
          size="sm"
        >
          Clear All Data
        </Button>
      </HStack>

      {/* Profile Display */}
      {catProfile && (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <VStack spacing={4}>
              <Avatar
                size="2xl"
                name={catProfile.name}
                src={catProfile.photoUrl}
                bg="blue.500"
              />
              <VStack spacing={1}>
                <Heading size="md">{catProfile.name}</Heading>
                {catProfile.breed && (
                  <Text color="gray.600">{catProfile.breed}</Text>
                )}
                {calculateAge() && (
                  <Text fontSize="sm" color="gray.500">
                    Age: {calculateAge()}
                  </Text>
                )}
                {calculateTimeSinceGotcha() && (
                  <Text fontSize="sm" color="gray.500">
                    Time with you: {calculateTimeSinceGotcha()}
                  </Text>
                )}
                {catProfile.weight && (
                  <Text fontSize="sm" color="gray.500">
                    Weight: {(catProfile.weight * 2.20462).toFixed(1)} lb
                  </Text>
                )}
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Edit Form */}
      <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
        <CardBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4} align="stretch">
              <Heading size="md">
                {catProfile ? 'Edit Profile' : 'Create Profile'}
              </Heading>

              {/* Photo Upload */}
              <FormControl>
                <FormLabel>Photo</FormLabel>
                <VStack spacing={3}>
                  <Avatar
                    size="xl"
                    name={formData.name}
                    src={photoUrl}
                    bg="blue.500"
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    style={{ display: 'none' }}
                  />
                  <Button
                    size="sm"
                    leftIcon={<FaCamera />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Photo
                  </Button>
                </VStack>
              </FormControl>

              <Divider />

              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your cat's name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Breed</FormLabel>
                <Input
                  value={formData.breed}
                  onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                  placeholder="e.g., Persian, Siamese, Mixed"
                />
              </FormControl>

              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel>Birth Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Gotcha Date</FormLabel>
                  <Input
                    type="date"
                    value={formData.gotchaDate}
                    onChange={(e) => setFormData({ ...formData, gotchaDate: e.target.value })}
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Current Weight (lb)</FormLabel>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
                  placeholder="9.9"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="blue"
                leftIcon={<FaSave />}
                size="lg"
              >
                Save Profile
              </Button>
            </VStack>
          </form>
        </CardBody>
      </Card>

      {catProfile && (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <VStack align="start" spacing={2}>
              <Heading size="sm">Profile Information</Heading>
              <Text fontSize="sm" color="gray.600">
                Profile created: {format(catProfile.createdAt, 'MMMM d, yyyy')}
              </Text>
              <Text fontSize="sm" color="gray.600">
                Last updated: {format(catProfile.updatedAt, 'MMMM d, yyyy h:mm a')}
              </Text>
            </VStack>
          </CardBody>
        </Card>
      )}
    </VStack>
  );
};

export default Profile;