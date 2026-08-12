import { Stack, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function PengurusLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem('role')
      .then((storedRole) => {
        setRole(storedRole);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  if (role !== 'PENGURUS') return <Redirect href="/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="dashboard" />
      <Stack.Screen name="users/index" />
      <Stack.Screen name="users/create" />
      <Stack.Screen name="users/[id]/index" />
      <Stack.Screen name="tingkatan/index" />
      <Stack.Screen name="tingkatan/create" />
      <Stack.Screen name="tingkatan/[id]/index" />
      <Stack.Screen name="kenaikan/index" />
      <Stack.Screen name="kenaikan/create" />
      <Stack.Screen name="kenaikan/[id]/index" />
    </Stack>
  );
}
