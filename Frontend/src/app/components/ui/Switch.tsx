'use client';

import { type HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SwitchProps extends HTMLAttributes<HTMLLabelElement> {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const Switch = forwardRef<HTMLLabelElement, SwitchProps>(
  ({ className, checked, onCheckedChange, label, description, disabled, id, ...props }, ref) => {
    const switchId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <label
        ref={ref}
        className={cn('flex items-center gap-3 cursor-pointer', className)}
        {...props}
      >
        <div className="relative">
          <input
            type="checkbox"
            id={switchId}
            checked={checked}
            onChange={e => onCheckedChange(e.target.checked)}
            disabled={disabled}
            className="sr-only"
            aria-describedby={description ? `${switchId}-desc` : undefined}
          />
          <span
            className={cn(
              'block h-6 w-11 rounded-full transition-colors duration-200',
              checked ? 'bg-emerald-500' : 'bg-slate-700'
            )}
          >
            <span
              className={cn(
                'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow-lg transition-transform duration-200',
                checked ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </span>
        </div>
        <div className="text-left">
          {label && <span className="block font-medium text-white">{label}</span>}
          {description && (
            <p id={`${switchId}-desc`} className="text-xs text-slate-400">{description}</p>
          )}
        </div>
      </label>
    );
  }
);
Switch.displayName = 'Switch';