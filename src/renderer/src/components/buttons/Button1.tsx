import React from 'react';
import { clsx } from 'clsx';

export type ButtonVariant = 'primary' | 'outline' | 'secondary' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface Button1Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: React.ReactNode;
  label?: string;
}

export const Button1: React.FC<Button1Props> = ({
  variant = 'outline',
  size = 'md',
  icon,
  label,
  children,
  className = '',
  type = 'button',
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center gap-1.5 rounded-xl font-semibold transition cursor-pointer select-none';

  const sizeClasses: Record<ButtonSize, string> = {
    sm: 'px-3 py-1.5 text-[11px]',
    md: 'px-4 py-2.5 text-xs',
    lg: 'px-5 py-2.5 text-sm'
  };

  const variantClasses: Record<ButtonVariant, string> = {
    outline:
      'bg-white hover:bg-slate-50 border border-slate-200/90 text-slate-700 shadow-xs',
    primary:
      'bg-linear-to-r from-primary to-secondary hover:opacity-95 text-white shadow-xs shadow-primary/20',
    secondary:
      'bg-slate-100 hover:bg-slate-200 text-slate-800 shadow-xs',
    danger:
      'bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600'
  };

  const disabledClasses = disabled
    ? 'opacity-60 cursor-not-allowed pointer-events-none'
    : 'active:scale-[0.98]';

  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(
        baseClasses,
        sizeClasses[size],
        variantClasses[variant],
        disabledClasses,
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {label && <span>{label}</span>}
      {children}
    </button>
  );
};

export default Button1;