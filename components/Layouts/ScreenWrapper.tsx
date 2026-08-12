import { View, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ScreenWrapperProps {
  children: React.ReactNode;
  scroll?: boolean;
  className?: string;
}

export default function ScreenWrapper({ children, scroll = true, className }: ScreenWrapperProps) {
  const Container = scroll ? ScrollView : View;
  return (
    <SafeAreaView className="flex-1 bg-background">
      <Container className={`flex-1 px-4 py-4 ${className}`} showsVerticalScrollIndicator={false}>
        {children}
      </Container>
    </SafeAreaView>
  );
}
