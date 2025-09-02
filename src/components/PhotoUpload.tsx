import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  HStack,
  Image,
  SimpleGrid,
  Text,
  VStack,
  IconButton,
  useToast,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { FaCamera, FaTrash, FaPlus } from 'react-icons/fa';

interface PhotoUploadProps {
  maxFiles?: number;
  existingPhotos?: string[];
  onPhotosChange: (photos: string[]) => void;
  category?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  maxFiles = 3,
  existingPhotos = [],
  onPhotosChange,
  category = 'general',
}) => {
  const [photos, setPhotos] = useState<string[]>(existingPhotos);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const remainingSlots = maxFiles - photos.length;
    if (remainingSlots <= 0) {
      toast({
        title: 'Maximum photos reached',
        description: `You can only upload ${maxFiles} photos`,
        status: 'warning',
        duration: 3000,
      });
      return;
    }

    const filesToProcess = Array.from(files).slice(0, remainingSlots);
    
    filesToProcess.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Images must be less than 10MB',
          status: 'error',
          duration: 3000,
        });
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotos((prev) => {
          const newPhotos = [...prev, result];
          onPhotosChange(newPhotos);
          return newPhotos;
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    setPhotos(newPhotos);
    onPhotosChange(newPhotos);
  };

  return (
    <VStack spacing={4} align="stretch">
      <HStack justify="space-between">
        <Text fontSize="sm" fontWeight="medium">
          Photos ({photos.length}/{maxFiles})
        </Text>
        {photos.length < maxFiles && (
          <Button
            size="sm"
            leftIcon={<FaPlus />}
            colorScheme="blue"
            onClick={() => fileInputRef.current?.click()}
          >
            Add Photo
          </Button>
        )}
      </HStack>

      {photos.length > 0 && (
        <SimpleGrid columns={{ base: 2, md: 3 }} spacing={3}>
          {photos.map((photo, index) => (
            <Box
              key={index}
              position="relative"
              borderRadius="md"
              overflow="hidden"
              bg={bgColor}
              borderWidth={1}
              borderColor={borderColor}
            >
              <Image
                src={photo}
                alt={`${category} photo ${index + 1}`}
                height="150px"
                width="100%"
                objectFit="cover"
              />
              <IconButton
                aria-label="Remove photo"
                icon={<FaTrash />}
                size="sm"
                colorScheme="red"
                position="absolute"
                top={2}
                right={2}
                onClick={() => removePhoto(index)}
              />
              <Badge
                position="absolute"
                bottom={2}
                left={2}
                colorScheme="blackAlpha"
                fontSize="xs"
              >
                {index + 1}/{maxFiles}
              </Badge>
            </Box>
          ))}
        </SimpleGrid>
      )}

      {photos.length === 0 && (
        <Box
          borderWidth={2}
          borderStyle="dashed"
          borderColor={borderColor}
          borderRadius="md"
          p={8}
          textAlign="center"
          cursor="pointer"
          onClick={() => fileInputRef.current?.click()}
          _hover={{ borderColor: 'blue.400' }}
        >
          <VStack spacing={2}>
            <FaCamera size={32} color="gray" />
            <Text color="gray.500">Click to upload photos</Text>
            <Text fontSize="xs" color="gray.400">
              Max {maxFiles} photos, up to 10MB each
            </Text>
          </VStack>
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </VStack>
  );
};