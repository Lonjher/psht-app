import { Tabs, Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, ActivityIndicator, Text, useColorScheme } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { hydrateAuthSession, setAuthToken } from '@/services/authStore';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  useEffect(() => {
    const restoreSession = async () => {
      const session = await hydrateAuthSession();
      setAuthToken(session.token);
      setRole(session.role);
      setLoading(false);
    };

    restoreSession();
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }
  if (role !== 'ADMIN') return <Redirect href="/login" />;

  return (
    <SafeAreaView className="flex-1 bg-stone-50 dark:bg-stone-950">
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: '#b45309', // amber-700
          tabBarInactiveTintColor: isDark ? '#78716c' : '#a8a29e', // stone-500 / stone-400
          tabBarStyle: {
            backgroundColor: isDark ? '#1c1917' : '#ffffff', // stone-900 / white
            borderTopColor: isDark ? '#292524' : '#e7e5e4', // stone-800 / stone-200
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 8,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
          },
        }}>
        <Tabs.Screen
          name="dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="pengurus/index"
          options={{
            title: 'Pengurus',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'people' : 'people-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="users/index"
          options={{
            title: 'Anggota',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="tingkatan/index"
          options={{
            title: 'Tingkatan',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons name={focused ? 'layers' : 'layers-outline'} size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="kenaikan/index"
          options={{
            title: 'Kenaikan',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'trending-up' : 'trending-up-outline'}
                size={size}
                color={color}
              />
            ),
          }}
        />

        {/* Sembunyikan halaman create/detail dari tab bar */}
        <Tabs.Screen name="pengurus/create" options={{ href: null }} />
        <Tabs.Screen name="pengurus/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="users/create" options={{ href: null }} />
        <Tabs.Screen name="users/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="tingkatan/create" options={{ href: null }} />
        <Tabs.Screen name="tingkatan/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="kenaikan/create" options={{ href: null }} />
        <Tabs.Screen name="kenaikan/[id]/index" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="kenaikan/riwayat/[id]" options={{ href: null }} />
      </Tabs>
    </SafeAreaView>
  );
}
