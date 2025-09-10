import React from 'react';
import { HStack, Box, Text } from '@chakra-ui/react';
import { PhotoThumbnail } from './PhotoThumbnail';

interface PhotoThumbnailGridProps {
  photos: string[];
  maxVisible?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onPhotoClick?: (index: number) => void;
  showCount?: boolean;
  spacing?: number;
}

export const PhotoThumbnailGrid: React.FC<PhotoThumbnailGridProps> = ({
  photos,
  maxVisible = 3,
  size = 'sm',
  onPhotoClick,
  showCount = true,
  spacing = 1,
}) => {
  if (!photos || photos.length === 0) return null;

  const visiblePhotos = photos.slice(0, maxVisible);
  const remainingCount = photos.length - maxVisible;

  return (
    <HStack spacing={spacing} align="center">
      {visiblePhotos.map((photo, index) => (
        <PhotoThumbnail
          key={index}
          src={photo}
          alt={`Photo ${index + 1}`}
          size={size}
          onClick={() => onPhotoClick?.(index)}
          loading="lazy"
          index={index === maxVisible - 1 && remainingCount > 0 ? 0 : undefined}
          total={index === maxVisible - 1 && remainingCount > 0 ? remainingCount + 1 : undefined}
        />
      ))}
      
      {showCount && remainingCount > 0 && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          bg="gray.200"
          borderRadius="md"
          px={2}
          py={1}
          cursor="pointer"
          onClick={() => onPhotoClick?.(maxVisible - 1)}
          _hover={{ bg: 'gray.300' }}
        >
          <Text fontSize="xs" fontWeight="bold" color="gray.700">
            +{remainingCount} more
          </Text>
        </Box>
      )}
    </HStack>
  );
};