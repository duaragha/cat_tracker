import React, { useState, useRef, useEffect } from 'react';
import { Image, Box, Skeleton, type ImageProps } from '@chakra-ui/react';

interface LazyImageProps extends Omit<ImageProps, 'loading'> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  placeholderHeight?: number;
  threshold?: number; // Intersection observer threshold
  onLoad?: () => void;
  onError?: () => void;
}

const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  placeholderHeight = 200,
  threshold = 0.1,
  onLoad,
  onError,
  ...imageProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for lazy loading
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, [threshold]);

  const handleLoad = () => {
    setIsLoaded(true);
    onLoad?.();
  };

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  return (
    <Box ref={containerRef} position="relative">
      {!isLoaded && !hasError && (
        <Skeleton
          height={`${placeholderHeight}px`}
          width="100%"
          position="absolute"
          top={0}
          left={0}
          borderRadius="md"
        />
      )}
      
      {isInView && (
        <Image
          ref={imgRef}
          src={hasError ? fallbackSrc : src}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          opacity={isLoaded ? 1 : 0}
          transition="opacity 0.3s ease"
          {...imageProps}
        />
      )}
    </Box>
  );
};

export default LazyImage;