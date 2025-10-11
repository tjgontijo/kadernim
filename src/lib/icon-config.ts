/**
 * KADERNIN Icon Configuration
 * Based on the brand guidelines:
 * - Line icons minimalistas
 * - 1.5px stroke thickness
 * - 2px corner radius
 * - 24x24px grid base
 * - SVG format for scalability
 */

import { LucideProps } from 'lucide-react';

// Default icon configuration based on KADERNIN brand guidelines
export const iconConfig: LucideProps = {
  strokeWidth: 1.5,
  size: 24,
};

// Helper function to apply KADERNIN icon styling
export function applyIconStyle(props: LucideProps = {}): LucideProps {
  return {
    ...iconConfig,
    ...props,
  };
}

// CSS variables for icon styling (can be used in global CSS)
export const iconCssVariables = {
  '--icon-stroke-width': '1.5px',
  '--icon-size': '24px',
  '--icon-corner-radius': '2px',
};

// Icon colors based on KADERNIN brand palette
export const iconColors = {
  primary: '#2E5BBA', // Azul Principal
  secondary: '#4A9B8E', // Verde Inovação
  neutral: '#6B7280', // Cinza Neutro
};
