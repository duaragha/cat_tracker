import {
  VStack,
  HStack,
  Heading,
  Button,
  Card,
  CardBody,
  Grid,
  Image,
  Text,
  Box,
  useToast,
  useColorModeValue,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  IconButton
} from '@chakra-ui/react';
import { FaCamera, FaPlus, FaTrash, FaExpand } from 'react-icons/fa';
import { useState, useRef } from 'react';
import { useCatData } from '../contexts/CatDataContext';
import { format, getWeek, getYear } from 'date-fns';

const PhotoGallery = () => {
  const { photos, addPhoto, deleteEntry } = useCatData();
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isViewOpen, onOpen: onViewOpen, onClose: onViewClose } = useDisclosure();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [formData, setFormData] = useState({
    imageUrl: '',
    caption: '',
    notes: ''
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, imageUrl: reader.result as string });
        onOpen();
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (!formData.imageUrl) {
      toast({
        title: 'Please select a photo',
        status: 'error',
        duration: 2000,
        isClosable: true,
      });
      return;
    }

    const now = new Date();
    addPhoto({
      imageUrl: formData.imageUrl,
      uploadDate: now,
      week: getWeek(now),
      year: getYear(now),
      caption: formData.caption,
      notes: formData.notes
    });

    toast({
      title: 'Photo added successfully',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });

    // Reset form
    setFormData({
      imageUrl: '',
      caption: '',
      notes: ''
    });
    onClose();
  };

  const handleDelete = (id: string) => {
    deleteEntry('photos', id);
    toast({
      title: 'Photo deleted',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
  };

  const viewPhoto = (photo: any) => {
    setSelectedPhoto(photo);
    onViewOpen();
  };

  // Group photos by week
  const photosByWeek = photos.reduce((acc, photo) => {
    const key = `${photo.year}-W${photo.week}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(photo);
    return acc;
  }, {} as Record<string, typeof photos>);

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">
          <FaCamera style={{ display: 'inline', marginRight: '8px' }} />
          Photo Gallery
        </Heading>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handlePhotoUpload}
          style={{ display: 'none' }}
        />
        <Button
          colorScheme="teal"
          leftIcon={<FaPlus />}
          onClick={() => fileInputRef.current?.click()}
        >
          Add Photo
        </Button>
      </HStack>

      {/* Photos Grid */}
      {photos.length === 0 ? (
        <Card bg={bgColor} borderColor={borderColor} borderWidth={1}>
          <CardBody>
            <VStack spacing={4} py={8}>
              <FaCamera size={48} color="gray" />
              <Text color="gray.500" textAlign="center">
                No photos yet. Start documenting your cat's journey!
              </Text>
              <Button
                colorScheme="teal"
                leftIcon={<FaCamera />}
                onClick={() => fileInputRef.current?.click()}
              >
                Upload First Photo
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        Object.entries(photosByWeek).map(([weekKey, weekPhotos]) => {
          const [year, week] = weekKey.split('-W');
          return (
            <Card key={weekKey} bg={bgColor} borderColor={borderColor} borderWidth={1}>
              <CardBody>
                <Heading size="md" mb={4}>
                  Week {week}, {year}
                </Heading>
                <Grid
                  templateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }}
                  gap={4}
                >
                  {weekPhotos.map((photo) => (
                    <Box
                      key={photo.id}
                      position="relative"
                      borderRadius="md"
                      overflow="hidden"
                      borderWidth={1}
                      borderColor={borderColor}
                      _hover={{ transform: 'scale(1.02)', transition: 'all 0.2s' }}
                      cursor="pointer"
                    >
                      <Image
                        src={photo.imageUrl}
                        alt={photo.caption || 'Cat photo'}
                        objectFit="cover"
                        height="200px"
                        width="100%"
                        onClick={() => viewPhoto(photo)}
                      />
                      <Box
                        position="absolute"
                        top={2}
                        right={2}
                        display="flex"
                        gap={2}
                      >
                        <IconButton
                          icon={<FaExpand />}
                          aria-label="View photo"
                          size="sm"
                          colorScheme="blue"
                          onClick={() => viewPhoto(photo)}
                        />
                        <IconButton
                          icon={<FaTrash />}
                          aria-label="Delete photo"
                          size="sm"
                          colorScheme="red"
                          onClick={() => handleDelete(photo.id)}
                        />
                      </Box>
                      {photo.caption && (
                        <Box p={2} bg={bgColor}>
                          <Text fontSize="sm" noOfLines={2}>
                            {photo.caption}
                          </Text>
                          <Text fontSize="xs" color="gray.500">
                            {format(photo.uploadDate, 'MMM d, yyyy')}
                          </Text>
                        </Box>
                      )}
                    </Box>
                  ))}
                </Grid>
              </CardBody>
            </Card>
          );
        })
      )}

      {/* Add Photo Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Photo</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              {formData.imageUrl && (
                <Image
                  src={formData.imageUrl}
                  alt="Preview"
                  maxHeight="300px"
                  objectFit="contain"
                />
              )}
              <FormControl>
                <FormLabel>Caption</FormLabel>
                <Input
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Add a caption..."
                />
              </FormControl>
              <FormControl>
                <FormLabel>Notes</FormLabel>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any notes about this photo..."
                  rows={3}
                />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="teal" onClick={handleSubmit}>
              Save Photo
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* View Photo Modal */}
      <Modal isOpen={isViewOpen} onClose={onViewClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedPhoto?.caption || 'Photo'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedPhoto && (
              <VStack spacing={4}>
                <Image
                  src={selectedPhoto.imageUrl}
                  alt={selectedPhoto.caption || 'Cat photo'}
                  maxHeight="500px"
                  objectFit="contain"
                />
                <Text fontSize="sm" color="gray.600">
                  Uploaded on {format(selectedPhoto.uploadDate, 'MMMM d, yyyy')}
                </Text>
                {selectedPhoto.notes && (
                  <Text>{selectedPhoto.notes}</Text>
                )}
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default PhotoGallery;