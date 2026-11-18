import { useContext } from 'react';
import { NavigationContext } from './navigationContext.js';

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation phải được sử dụng bên trong NavigationProvider');
  }
  return context;
}
