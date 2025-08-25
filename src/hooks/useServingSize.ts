import { useState, useCallback } from 'react';
import { MEAL_CONFIG, ServingSize } from '../constants/config';

export const useServingSize = (initialSize: ServingSize = MEAL_CONFIG.SERVING_OPTIONS[0]) => {
  const [selectedSize, setSelectedSize] = useState<ServingSize>(initialSize);
  const [customSize, setCustomSize] = useState<string>('');
  const [isCustom, setIsCustom] = useState(false);

  const selectServingSize = useCallback((size: ServingSize) => {
    setSelectedSize(size);
    setIsCustom(false);
    setCustomSize('');
  }, []);

  const setCustomServingSize = useCallback((size: string) => {
    const numSize = parseInt(size, 10);
    
    if (isNaN(numSize) || numSize < MEAL_CONFIG.MIN_CUSTOM_SERVING || numSize > MEAL_CONFIG.MAX_CUSTOM_SERVING) {
      setCustomSize(size); // Keep invalid input for user feedback
      return;
    }

    setCustomSize(size);
    setIsCustom(true);
  }, []);

  const getCurrentSize = useCallback((): number => {
    if (isCustom) {
      const numSize = parseInt(customSize, 10);
      return isNaN(numSize) ? MEAL_CONFIG.SERVING_OPTIONS[0] : numSize;
    }
    return selectedSize;
  }, [isCustom, customSize, selectedSize]);

  const isValidCustomSize = useCallback((): boolean => {
    if (!isCustom || !customSize) return true;
    const numSize = parseInt(customSize, 10);
    return !isNaN(numSize) && 
           numSize >= MEAL_CONFIG.MIN_CUSTOM_SERVING && 
           numSize <= MEAL_CONFIG.MAX_CUSTOM_SERVING;
  }, [isCustom, customSize]);

  const reset = useCallback(() => {
    setSelectedSize(MEAL_CONFIG.SERVING_OPTIONS[0]);
    setCustomSize('');
    setIsCustom(false);
  }, []);

  return {
    selectedSize,
    customSize,
    isCustom,
    selectServingSize,
    setCustomServingSize,
    getCurrentSize,
    isValidCustomSize,
    reset,
    servingOptions: MEAL_CONFIG.SERVING_OPTIONS,
  };
};