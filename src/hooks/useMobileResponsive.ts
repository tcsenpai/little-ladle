import { useState, useEffect, useCallback } from 'react';
import { UI_CONFIG, DEBOUNCE_DELAYS } from '../constants/config';

export const useMobileResponsive = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const updateScreenSize = useCallback(() => {
    const width = window.innerWidth;
    
    setIsMobile(width < UI_CONFIG.RESPONSIVE.MOBILE_BREAKPOINT);
    setIsTablet(width >= UI_CONFIG.RESPONSIVE.MOBILE_BREAKPOINT && width < UI_CONFIG.RESPONSIVE.DESKTOP_BREAKPOINT);
    setIsDesktop(width >= UI_CONFIG.RESPONSIVE.DESKTOP_BREAKPOINT);
    
    // Close mobile drawer when screen gets larger
    if (width >= UI_CONFIG.RESPONSIVE.MOBILE_BREAKPOINT) {
      setIsMobileDrawerOpen(false);
    }
  }, []);

  useEffect(() => {
    updateScreenSize();

    let timeoutId: NodeJS.Timeout;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, DEBOUNCE_DELAYS.RESIZE);
    };

    window.addEventListener('resize', debouncedResize);
    return () => {
      window.removeEventListener('resize', debouncedResize);
      clearTimeout(timeoutId);
    };
  }, [updateScreenSize]);

  const openMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(true);
  }, []);

  const closeMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(false);
  }, []);

  const toggleMobileDrawer = useCallback(() => {
    setIsMobileDrawerOpen(prev => !prev);
  }, []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    isMobileDrawerOpen,
    openMobileDrawer,
    closeMobileDrawer,
    toggleMobileDrawer,
    screenType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
  };
};