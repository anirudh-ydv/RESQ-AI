'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: string;
}

const variantStyles: Record<string, string> = {
  emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  crimson: 'bg-crimson-500/20 text-crimson-400 border-crimson-500/30',
  blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  slate: 'bg-slate-600/50 text-slate-400 border-slate-500/30',
  purple: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  high: 'bg-crimson-500/20 text-crimson-400 border-crimson-500/30 animate-pulse-glow',
  medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  low: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  active: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  responding: 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-blink',
  resolved: 'bg-slate-600/50 text-slate-400 border-slate-500/30',
};

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant = 'slate', children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border',
        variantStyles[variant] || variantStyles.slate,
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
);
Badge.displayName = 'Badge';