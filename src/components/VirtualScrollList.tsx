import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Box } from '@chakra-ui/react';

interface VirtualScrollListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number; // Number of extra items to render outside visible area
  keyExtractor: (item: T, index: number) => string | number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
}

function VirtualScrollList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  keyExtractor,
  onScroll,
  className
}: VirtualScrollListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const startIndex = Math.floor(scrollTop / itemHeight);
    const endIndex = Math.min(
      startIndex + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    // Apply overscan
    const overscanStart = Math.max(0, startIndex - overscan);
    const overscanEnd = Math.min(items.length - 1, endIndex + overscan);

    return {
      start: overscanStart,
      end: overscanEnd,
      visibleStart: startIndex,
      visibleEnd: endIndex
    };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.start, visibleRange.end + 1).map((item, index) => ({
      item,
      index: visibleRange.start + index,
      key: keyExtractor(item, visibleRange.start + index)
    }));
  }, [items, visibleRange, keyExtractor]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Calculate total height and offset
  const totalHeight = items.length * itemHeight;
  const offsetY = visibleRange.start * itemHeight;

  return (
    <Box
      ref={containerRef}
      height={`${containerHeight}px`}
      overflow="auto"
      onScroll={handleScroll}
      className={className}
    >
      <Box height={`${totalHeight}px`} position="relative">
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          transform={`translateY(${offsetY}px)`}
        >
          {visibleItems.map(({ item, index, key }) => (
            <Box key={key} height={`${itemHeight}px`}>
              {renderItem(item, index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default VirtualScrollList;