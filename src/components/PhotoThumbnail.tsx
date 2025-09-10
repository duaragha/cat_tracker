import React, { useState, useRef, useEffect } from 'react';
import { Box, Image, Skeleton, Text, AspectRatio } from '@chakra-ui/react';
import { FaCamera } from 'react-icons/fa';

interface PhotoThumbnailProps {
  src: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
  loading?: 'lazy' | 'eager';
  showOverlay?: boolean;
  index?: number;
  total?: number;
}

const sizeMap = {
  xs: { width: '40px', height: '40px' },
  sm: { width: '60px', height: '60px' },
  md: { width: '80px', height: '80px' },
  lg: { width: '120px', height: '120px' },
};

export const PhotoThumbnail: React.FC<PhotoThumbnailProps> = ({
  src,
  alt = 'Photo',
  size = 'sm',
  onClick,
  loading = 'lazy',
  showOverlay = false,
  index,
  total,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(loading === 'eager');
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading === 'eager') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.1, rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [loading]);

  const dimensions = sizeMap[size];
  const showCount = index !== undefined && total !== undefined && index === 0 && total > 1;

  return (
    <Box
      ref={imgRef}
      position="relative"
      cursor={onClick ? 'pointer' : 'default'}
      onClick={onClick}
      borderRadius="md"
      overflow="hidden"
      bg="gray.100"
      _hover={onClick ? { transform: 'scale(1.05)', transition: 'transform 0.2s' } : {}}
      {...dimensions}
    >
      {!isLoaded && !hasError && (
        <Skeleton
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          startColor="gray.200"
          endColor="gray.300"
        />
      )}
      
      {hasError ? (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          w="full"
          h="full"
          bg="gray.200"
          color="gray.500"
        >
          <FaCamera size={parseInt(dimensions.width) / 3} />
        </Box>
      ) : (
        isVisible && (
          <Image
            src={src}
            alt={alt}
            w="full"
            h="full"
            objectFit="cover"
            onLoad={() => setIsLoaded(true)}
            onError={() => setHasError(true)}
            display={isLoaded ? 'block' : 'none'}
          />
        )
      )}
      
      {showOverlay && isLoaded && (
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.400"
          display="flex"
          alignItems="center"
          justifyContent="center"
          opacity={0}
          _hover={{ opacity: 1 }}
          transition="opacity 0.2s"
        >
          <FaCamera color="white" size={parseInt(dimensions.width) / 3} />
        </Box>
      )}
      
      {showCount && (
        <Box
          position="absolute"
          bottom={1}
          right={1}
          bg="blackAlpha.700"
          color="white"
          px={1}
          py={0.5}
          borderRadius="sm"
          fontSize="xs"
          fontWeight="bold"
        >
          +{total - 1}
        </Box>
      )}
    </Box>
  );
};