import { View, Text, Image, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useColorScheme } from 'react-native';

export function SplashScreen() {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    // Animasi fade dan scale
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
      // Animasi pulse untuk loading indicator
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ),
    ]).start();

    // Cleanup animasi loop
    return () => {
      pulseAnim.stopAnimation();
    };
  }, [fadeAnim, scaleAnim, pulseAnim]);

  return (
    <View className={`flex-1 items-center justify-center ${isDark ? 'bg-stone-900' : 'bg-stone-100'}`}>
      {/* Animated Background Decorations */}
      <View className="absolute inset-0">
        {/* Top right circle */}
        <View className={`absolute -right-20 -top-20 h-64 w-64 rounded-full ${isDark ? 'bg-amber-700/10' : 'bg-amber-200/30'}`} />
        {/* Bottom left circle */}
        <View className={`absolute -bottom-16 -left-16 h-48 w-48 rounded-full ${isDark ? 'bg-amber-600/15' : 'bg-amber-300/20'}`} />
        {/* Center accent */}
        <View className={`absolute left-1/4 top-1/4 h-32 w-32 rounded-full ${isDark ? 'bg-amber-500/5' : 'bg-amber-400/10'}`} />
        {/* Additional decoration */}
        <View className={`absolute right-1/4 bottom-1/4 h-24 w-24 rounded-full ${isDark ? 'bg-stone-700/20' : 'bg-stone-300/30'}`} />
      </View>

      {/* Content Container */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center">
        {/* Logo Container */}
        <View className={`mb-8 h-28 w-28 items-center justify-center rounded-3xl border-2 p-3 ${
          isDark 
            ? 'border-amber-600/30 bg-stone-800/50' 
            : 'border-amber-500/30 bg-white/80'
        }`}>
          <Image
            className="h-full w-full"
            source={require('../assets/images/logo.png')}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text className={`text-center text-3xl font-bold ${isDark ? 'text-white' : 'text-stone-800'}`}>
          PSHT
        </Text>
        <View className={`mt-1 h-px w-16 ${isDark ? 'bg-amber-600/50' : 'bg-amber-500/50'}`} />
        <Text className={`mt-2 text-center text-sm font-medium ${isDark ? 'text-amber-500' : 'text-amber-600'}`}>
          Ranting Guluk-Guluk
        </Text>

        {/* Subtitle */}
        <Text className={`mt-4 text-center text-xs leading-5 ${isDark ? 'text-stone-400' : 'text-stone-500'}`}>
          Persaudaraan Setia Hati Terate
        </Text>

        {/* Loading Indicator */}
        <Animated.View
          style={{ opacity: pulseAnim }}
          className="mt-12 flex-row items-center gap-1.5">
          <View className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-amber-600' : 'bg-amber-500'}`} />
          <View className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-amber-600/60' : 'bg-amber-500/60'}`} />
          <View className={`h-2.5 w-2.5 rounded-full ${isDark ? 'bg-amber-600/30' : 'bg-amber-500/30'}`} />
        </Animated.View>
      </Animated.View>

      {/* Footer Text */}
      <View className="absolute bottom-8 items-center">
        <View className={`mb-2 h-px w-12 ${isDark ? 'bg-stone-700' : 'bg-stone-300'}`} />
        <Text className={`text-xs ${isDark ? 'text-stone-500' : 'text-stone-400'}`}>
          Memuat Aplikasi...
        </Text>
      </View>
    </View>
  );
}