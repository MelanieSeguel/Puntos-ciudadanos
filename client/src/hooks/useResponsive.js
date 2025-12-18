import { useWindowDimensions } from 'react-native';

/**
 * Hook para determinar si estamos en web o móvil y el tamaño de pantalla
 */
export function useResponsive() {
  const { width, height } = useWindowDimensions();

  return {
    isWeb: width > 768,
    isMobile: width <= 768,
    isTablet: width > 768 && width <= 1024,
    isDesktop: width > 1024,
    width,
    height,
  };
}
