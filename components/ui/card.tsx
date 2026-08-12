import { View } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export default function Card({ children, className }: CardProps) {
  return (
    <View className={`rounded-xl border border-gray-100 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </View>
  );
}
