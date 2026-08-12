import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  ViewProps,
  TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export const Button = ({
  variant = 'default',
  size = 'md',
  loading = false,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) => {
  const baseStyle = 'items-center justify-center rounded-lg flex-row';
  const sizeStyle = {
    sm: 'px-3 py-1.5',
    md: 'px-4 py-2',
    lg: 'px-5 py-3',
  }[size];
  const variantStyle = {
    default: 'bg-blue-600 active:bg-blue-700',
    outline: 'border border-blue-600 bg-transparent active:bg-blue-50',
    ghost: 'bg-transparent active:bg-slate-100',
  }[variant];
  const textStyle = {
    default: 'text-white font-medium text-sm',
    outline: 'text-blue-600 font-medium text-sm',
    ghost: 'text-slate-800 font-medium text-sm',
  }[variant];

  return (
    <TouchableOpacity
      className={`${baseStyle} ${sizeStyle} ${variantStyle} ${disabled ? 'opacity-50' : ''} ${className}`}
      disabled={disabled || loading}
      activeOpacity={0.7}
      {...props}>
      {loading && (
        <ActivityIndicator color={variant === 'default' ? 'white' : '#2563eb'} className="mr-2" />
      )}
      {typeof children === 'string' ? <Text className={textStyle}>{children}</Text> : children}
    </TouchableOpacity>
  );
};
