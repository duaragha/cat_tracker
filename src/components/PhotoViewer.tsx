import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Image,
  IconButton,
  HStack,
  Text,
  useColorModeValue,
  Flex,
  Button,
} from '@chakra-ui/react';
import {
  FaChevronLeft,
  FaChevronRight,
  FaDownload,
  FaExpand,
  FaCompress,
} from 'react-icons/fa';

interface PhotoViewerProps {
  photos: string[];
  initialIndex?: number;
  isOpen: boolean;
  onClose: () => void;
  title?: string;
}

export const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photos,
  initialIndex = 0,
  isOpen,
  onClose,
  title,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const overlayBg = useColorModeValue('blackAlpha.800', 'blackAlpha.900');

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex, isOpen]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : photos.length - 1));
    setImageLoading(true);
  }, [photos.length]);

  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < photos.length - 1 ? prev + 1 : 0));
    setImageLoading(true);
  }, [photos.length]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          handlePrevious();
          break;
        case 'ArrowRight':
          handleNext();
          break;
        case 'Escape':
          if (isFullscreen) {
            setIsFullscreen(false);
          } else {
            onClose();
          }
          break;
        case ' ':
          e.preventDefault();
          handleNext();
          break;
      }
    },
    [isOpen, handlePrevious, handleNext, isFullscreen, onClose]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleDownload = () => {
    const currentPhoto = photos[currentIndex];
    const link = document.createElement('a');
    link.href = currentPhoto;
    link.download = `photo-${currentIndex + 1}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  if (photos.length === 0) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="full"
      isCentered
      motionPreset="scale"
    >
      <ModalOverlay bg={overlayBg} />
      <ModalContent
        bg="transparent"
        shadow="none"
        maxW="100vw"
        maxH="100vh"
        m={0}
      >
        <ModalCloseButton
          color="white"
          size="lg"
          top={4}
          right={4}
          zIndex={10}
          _hover={{ bg: 'whiteAlpha.200' }}
        />
        
        <ModalBody p={0} position="relative" h="100vh" display="flex" alignItems="center">
          {/* Navigation Controls */}
          {photos.length > 1 && (
            <>
              <IconButton
                aria-label="Previous photo"
                icon={<FaChevronLeft />}
                position="absolute"
                left={4}
                top="50%"
                transform="translateY(-50%)"
                zIndex={10}
                size="lg"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={handlePrevious}
              />
              
              <IconButton
                aria-label="Next photo"
                icon={<FaChevronRight />}
                position="absolute"
                right={4}
                top="50%"
                transform="translateY(-50%)"
                zIndex={10}
                size="lg"
                variant="ghost"
                color="white"
                _hover={{ bg: 'whiteAlpha.200' }}
                onClick={handleNext}
              />
            </>
          )}
          
          {/* Main Image Container */}
          <Flex
            w="full"
            h="full"
            align="center"
            justify="center"
            position="relative"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                onClose();
              }
            }}
          >
            <Box
              maxW="90vw"
              maxH="90vh"
              position="relative"
              bg={bgColor}
              borderRadius="lg"
              overflow="hidden"
              shadow="2xl"
            >
              {imageLoading && (
                <Box
                  position="absolute"
                  top="50%"
                  left="50%"
                  transform="translate(-50%, -50%)"
                  color="gray.400"
                >
                  Loading...
                </Box>
              )}
              
              <Image
                src={photos[currentIndex]}
                alt={`Photo ${currentIndex + 1}`}
                maxW="90vw"
                maxH="85vh"
                objectFit="contain"
                onLoad={() => setImageLoading(false)}
                display={imageLoading ? 'none' : 'block'}
              />
            </Box>
          </Flex>
          
          {/* Bottom Controls */}
          <HStack
            position="absolute"
            bottom={4}
            left="50%"
            transform="translateX(-50%)"
            bg="blackAlpha.700"
            borderRadius="full"
            px={4}
            py={2}
            spacing={4}
            zIndex={10}
          >
            {title && (
              <Text color="white" fontSize="sm" fontWeight="medium">
                {title}
              </Text>
            )}
            
            {photos.length > 1 && (
              <Text color="white" fontSize="sm">
                {currentIndex + 1} / {photos.length}
              </Text>
            )}
            
            <IconButton
              aria-label="Download photo"
              icon={<FaDownload />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={handleDownload}
            />
            
            <IconButton
              aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
              icon={isFullscreen ? <FaCompress /> : <FaExpand />}
              size="sm"
              variant="ghost"
              color="white"
              _hover={{ bg: 'whiteAlpha.200' }}
              onClick={toggleFullscreen}
            />
          </HStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};