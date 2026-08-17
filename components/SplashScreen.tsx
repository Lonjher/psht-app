import { View, Text, Image, Animated } from 'react-native';
import { useEffect, useRef } from 'react';

export function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  return (
    <View className="flex-1 items-center justify-center bg-gradient-to-b from-stone-900 via-stone-900 to-stone-800">
      {/* Animated Background Decorations */}
      <View className="absolute inset-0">
        {/* Top right circle */}
        <View className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-amber-600/10" />
        {/* Bottom left circle */}
        <View className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-amber-700/15" />
        {/* Center accent */}
        <View className="absolute inset-x-1/3 top-1/4 h-32 w-32 rounded-full bg-amber-500/5" />
      </View>

      {/* Content Container */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center">
        {/* Logo Container */}
        <View className="mb-8 h-28 w-28 items-center justify-center rounded-3xl border-2 border-amber-500/30 bg-white/5 p-3 backdrop-blur-xl">
          <Image
            className="h-full w-full"
            source={require('../assets/images/logo.png')}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className="text-center text-3xl font-bold text-white">PSHT</Text>
        <Text className="mt-1 text-center text-sm font-medium text-amber-400">
          Ranting Guluk-Guluk
        </Text>

        {/* Subtitle */}
        <Text className="mt-4 text-center text-xs leading-5 text-stone-300">
          Persaudaraan Setia Hati Terate
        </Text>

        {/* Loading Indicator */}
        <View className="mt-12 flex-row items-center gap-1">
          <View className="h-2 w-2 rounded-full bg-amber-500" />
          <View className="h-2 w-2 rounded-full bg-amber-500/60" />
          <View className="h-2 w-2 rounded-full bg-amber-500/30" />
        </View>
      </Animated.View>

      {/* Footer Text */}
      <View className="absolute bottom-8 items-center">
        <Text className="text-xs text-stone-500">Memuat Aplikasi...</Text>
      </View>
    </View>
  );
}
