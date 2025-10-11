"use client";

import React from 'react';
import { LucideIcon, LucideProps } from 'lucide-react';
import { applyIconStyle } from '@/lib/icon-config';
import { cn } from '@/lib/utils';

interface BrandIconProps extends LucideProps {
  icon: LucideIcon;
  variant?: 'primary' | 'secondary' | 'neutral';
}

/**
 * BrandIcon component
 * 
 * A wrapper for Lucide icons that applies KADERNIN brand styling:
 * - 1.5px stroke thickness
 * - 24x24px base size
 * - Proper color variants based on brand palette
 */
export function BrandIcon({
  icon: Icon,
  variant = 'primary',
  className,
  ...props
}: BrandIconProps) {
  // Apply brand styling
  const iconProps = applyIconStyle(props);
  
  // Determine color class based on variant
  const colorClass = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    neutral: 'text-muted-foreground',
  }[variant];

  return (
    <Icon 
      className={cn(colorClass, className)}
      {...iconProps}
    />
  );
}

export default BrandIcon;
