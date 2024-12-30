import { useEffect, useCallback, useRef } from 'react';
import { checkAndUpdateQueueTimers } from '../services/queueTimer';

const CHECK_INTERVAL = 30000; // Increase to 30 seconds to reduce API calls
const MAX_RETRIES = 3;

export function useQueueTimer() {
  const timerRef = useRef<number>();
  const isCheckingRef = useRef(false);
  const retriesRef = useRef(0);

  const checkQueue = useCallback(async () => {
    if (isCheckingRef.current) return;
    
    try {
      isCheckingRef.current = true;
      await checkAndUpdateQueueTimers();
      retriesRef.current = 0; // Reset retries on success
    } catch (error) {
      console.error('Queue check failed:', error);
      retriesRef.current++;
      
      // If we haven't exceeded max retries, schedule a retry
      if (retriesRef.current < MAX_RETRIES) {
        setTimeout(checkQueue, 5000); // Retry after 5 seconds
      }
    } finally {
      isCheckingRef.current = false;
    }
  }, []);

  useEffect(() => {
    checkQueue(); // Initial check
    timerRef.current = window.setInterval(checkQueue, CHECK_INTERVAL);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [checkQueue]);
}