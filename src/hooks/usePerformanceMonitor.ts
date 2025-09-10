import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  componentName: string;
  timestamp: number;
}

interface PerformanceMonitorConfig {
  enabled?: boolean;
  logToConsole?: boolean;
  threshold?: number; // Log only if render time exceeds this (ms)
}

export const usePerformanceMonitor = (
  componentName: string, 
  config: PerformanceMonitorConfig = {}
) => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    logToConsole = true,
    threshold = 16 // 60fps = 16.67ms per frame
  } = config;

  const renderStartTime = useRef<number>(0);
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  // Start timing before render
  const startTiming = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  // End timing after render
  const endTiming = useCallback(() => {
    if (!enabled || renderStartTime.current === 0) return;

    const renderTime = performance.now() - renderStartTime.current;
    const metrics: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
      // @ts-ignore - performance.memory might not be available in all browsers
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    };

    metricsRef.current.push(metrics);

    // Keep only last 100 metrics to prevent memory leak
    if (metricsRef.current.length > 100) {
      metricsRef.current.shift();
    }

    // Log slow renders
    if (logToConsole && renderTime > threshold) {
      console.warn(
        `🐌 Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`,
        metrics
      );
    }

    renderStartTime.current = 0;
  }, [enabled, componentName, threshold, logToConsole]);

  // Get performance statistics
  const getStats = useCallback(() => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return null;

    const renderTimes = metrics.map(m => m.renderTime);
    const avgRenderTime = renderTimes.reduce((a, b) => a + b, 0) / renderTimes.length;
    const maxRenderTime = Math.max(...renderTimes);
    const minRenderTime = Math.min(...renderTimes);

    return {
      componentName,
      totalRenders: metrics.length,
      avgRenderTime,
      maxRenderTime,
      minRenderTime,
      slowRenders: metrics.filter(m => m.renderTime > threshold).length
    };
  }, [componentName, threshold]);

  // Automatic timing for useEffect
  useEffect(() => {
    startTiming();
    return endTiming;
  });

  return {
    startTiming,
    endTiming,
    getStats,
    metrics: metricsRef.current
  };
};

// Hook for measuring specific operations
export const useOperationTimer = (enabled = true) => {
  const timersRef = useRef<Map<string, number>>(new Map());

  const startTimer = useCallback((operationName: string) => {
    if (!enabled) return;
    timersRef.current.set(operationName, performance.now());
  }, [enabled]);

  const endTimer = useCallback((operationName: string, logResult = true) => {
    if (!enabled) return 0;
    
    const startTime = timersRef.current.get(operationName);
    if (startTime === undefined) {
      console.warn(`Timer "${operationName}" was not started`);
      return 0;
    }

    const duration = performance.now() - startTime;
    timersRef.current.delete(operationName);

    if (logResult) {
      console.log(`⏱️ ${operationName}: ${duration.toFixed(2)}ms`);
    }

    return duration;
  }, [enabled]);

  return { startTimer, endTimer };
};

// Hook for measuring memory usage
export const useMemoryMonitor = (componentName: string, interval = 5000) => {
  const memoryStatsRef = useRef<Array<{ timestamp: number; memory: number }>>([]);

  useEffect(() => {
    // @ts-ignore
    if (typeof (performance as any).memory === 'undefined') {
      console.warn('Memory monitoring not supported in this browser');
      return;
    }

    const measureMemory = () => {
      // @ts-ignore
      const memory = (performance as any).memory.usedJSHeapSize;
      memoryStatsRef.current.push({
        timestamp: Date.now(),
        memory
      });

      // Keep only last 50 measurements
      if (memoryStatsRef.current.length > 50) {
        memoryStatsRef.current.shift();
      }
    };

    measureMemory(); // Initial measurement
    const intervalId = setInterval(measureMemory, interval);

    return () => clearInterval(intervalId);
  }, [interval]);

  const getMemoryStats = useCallback(() => {
    const stats = memoryStatsRef.current;
    if (stats.length === 0) return null;

    const memories = stats.map(s => s.memory);
    const avgMemory = memories.reduce((a, b) => a + b, 0) / memories.length;
    const maxMemory = Math.max(...memories);
    const minMemory = Math.min(...memories);

    return {
      componentName,
      measurements: stats.length,
      avgMemory: Math.round(avgMemory / 1024 / 1024), // MB
      maxMemory: Math.round(maxMemory / 1024 / 1024), // MB
      minMemory: Math.round(minMemory / 1024 / 1024), // MB
      latest: Math.round(memories[memories.length - 1] / 1024 / 1024) // MB
    };
  }, [componentName]);

  return {
    getMemoryStats,
    memoryHistory: memoryStatsRef.current
  };
};