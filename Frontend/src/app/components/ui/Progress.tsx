'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  color?: 'emerald' | 'amber' | 'crimson' | 'blue';
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const colorStyles = {
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  crimson: 'bg-crimson-500',
  blue: 'bg-blue-500',
};

const sizeStyles = {
  sm: 'h-1',
  md: 'h-2',
  lg: 'h-3',
};

export const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  ({ className, value, color = 'emerald', showLabel = false, size = 'md', ...props }, ref) => (
    <div ref={ref} className={cn('w-full rounded-full bg-slate-800/50 overflow-hidden', sizeStyles[size], className)} {...props}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500 ease-out',
          colorStyles[color]
        )}
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
      {showLabel && (
        <span className="absolute right-0 top-0 text-xs font-bold text-white" style={{ transform: 'translateY(-150%)' }}>
          {Math.round(value)}%
        </span>
      )}
    </div>
  )
);
Progress.displayName = 'Progress';