// components/ui/alert.tsx
import * as React from 'react';
import { View, Text, TouchableOpacity, type ViewProps, type TextProps } from 'react-native';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const alertVariants = cva(
  "relative w-full rounded-lg border p-4",
  {
    variants: {
      variant: {
        default: "bg-gray-100 border-gray-300",
        destructive: "bg-red-50 border-red-500",
        success: "bg-green-50 border-green-500",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface AlertProps 
  extends ViewProps,
    VariantProps<typeof alertVariants> {
  title?: string;
  description?: string;
  onClose?: () => void;
}

const Alert = React.forwardRef<View, AlertProps>(
  ({ className, variant, title, description, onClose, children, ...props }, ref) => (
    <View
      ref={ref}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <View className="flex-row justify-between items-start">
        <View className="flex-1 mr-2">
          {title && (
            <Text className={cn(
              "mb-1 font-bold text-base",
              variant === 'destructive' && "text-red-700",
              variant === 'success' && "text-green-700",
              variant === 'default' && "text-gray-900"
            )}>
              {title}
            </Text>
          )}
          {description && (
            <Text className={cn(
              "text-sm",
              variant === 'destructive' && "text-red-600",
              variant === 'success' && "text-green-600",
              variant === 'default' && "text-gray-700"
            )}>
              {description}
            </Text>
          )}
          {children}
        </View>
        {onClose && (
          <TouchableOpacity 
            onPress={onClose}
            className="ml-2 p-1"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text className={cn(
              "text-lg font-bold",
              variant === 'destructive' && "text-red-700",
              variant === 'success' && "text-green-700",
              variant === 'default' && "text-gray-700"
            )}>
              ×
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  )
);
Alert.displayName = 'Alert';

const AlertTitle = React.forwardRef<Text, TextProps>(
  ({ className, ...props }, ref) => (
    <Text
      ref={ref}
      className={cn('mb-1 font-bold text-base', className)}
      {...props}
    />
  )
);
AlertTitle.displayName = 'AlertTitle';

const AlertDescription = React.forwardRef<Text, TextProps>(
  ({ className, ...props }, ref) => (
    <Text 
      ref={ref} 
      className={cn('text-sm', className)} 
      {...props} 
    />
  )
);
AlertDescription.displayName = 'AlertDescription';

export { Alert, AlertTitle, AlertDescription };