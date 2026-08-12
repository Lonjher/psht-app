import { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from '@expo/vector-icons/Ionicons';
import { setAuthToken } from '@/services/authStore';
import api from '@/services/api';

interface DashboardData {
  total_anggota: number;
  total_pengurus: number;
  total_kenaikan: number;
  pending_anggota: number;
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/dashboard');
      setData(res.data);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await AsyncStorage.multiRemove(['token', 'role']);
          setAuthToken(null);
          router.replace('/login');
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="bg-stone-800 px-5 pb-8 pt-14 dark:bg-stone-900">
        <View className="flex-row items-center justify-between">
          <View>
            <Text className="text-xs font-medium tracking-widest text-amber-500">DASHBOARD</Text>
            <Text className="mt-1 text-xl font-bold text-white">Halo, Admin</Text>
            <Text className="mt-0.5 text-xs text-stone-300">Selamat datang kembali</Text>
          </View>

          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push('/profile')}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10"
              activeOpacity={0.7}>
              <Ionicons name="person-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleLogout}
              className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10"
              activeOpacity={0.7}>
              <Ionicons name="log-out-outline" size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#b45309" />
        }>
        {/* Stats Grid */}
        <View className="mt-5 flex-row flex-wrap">
          <CardStat
            label="Total Anggota"
            value={data?.total_anggota ?? 0}
            icon="people"
            color="blue"
          />
          <CardStat
            label="Pengurus"
            value={data?.total_pengurus ?? 0}
            icon="shield-checkmark"
            color="violet"
          />
          <CardStat
            label="Kenaikan"
            value={data?.total_kenaikan ?? 0}
            icon="trending-up"
            color="emerald"
          />
          <CardStat
            label="Menunggu Persetujuan"
            value={data?.pending_anggota ?? 0}
            icon="time"
            color="amber"
          />
        </View>

        {/* Menu Section */}
        <Text className="mb-3 mt-8 text-base font-bold text-stone-800 dark:text-stone-100">
          Menu Admin
        </Text>

        <View className="gap-2.5">
          <MenuButton
            label="Kelola Pengurus"
            desc="Data pengurus ranting"
            icon="shield-checkmark-outline"
            onPress={() => router.push('/pengurus')}
          />
          <MenuButton
            label="Kelola Anggota"
            desc="Data & status keanggotaan"
            icon="people-outline"
            onPress={() => router.push('/users')}
          />
          <MenuButton
            label="Kelola Tingkatan"
            desc="Daftar tingkatan sabuk"
            icon="layers-outline"
            onPress={() => router.push('/tingkatan')}
          />
          <MenuButton
            label="Kelola Kenaikan"
            desc="Riwayat kenaikan tingkat"
            icon="trending-up-outline"
            onPress={() => router.push('/kenaikan')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

/* ===== Sub Components ===== */

const colorMap = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-600 dark:text-blue-400',
  },
  violet: {
    bg: 'bg-violet-100 dark:bg-violet-900/30',
    text: 'text-violet-600 dark:text-violet-400',
  },
  emerald: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  amber: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-500',
  },
};

function CardStat({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  color: keyof typeof colorMap;
}) {
  const c = colorMap[color];
  return (
    <View className="w-1/2 p-1.5">
      <View className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
        <View className={`mb-3 h-9 w-9 items-center justify-center rounded-xl ${c.bg}`}>
          <Ionicons
            name={icon}
            size={17}
            color={
              color === 'blue'
                ? '#2563eb'
                : color === 'violet'
                  ? '#7c3aed'
                  : color === 'emerald'
                    ? '#059669'
                    : '#b45309'
            }
          />
        </View>
        <Text className="text-2xl font-bold text-stone-800 dark:text-stone-100">{value}</Text>
        <Text className="mt-0.5 text-xs leading-4 text-stone-500 dark:text-stone-400">{label}</Text>
      </View>
    </View>
  );
}

function MenuButton({
  label,
  desc,
  icon,
  onPress,
}: {
  label: string;
  desc: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white px-4 py-3.5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
      onPress={onPress}
      activeOpacity={0.7}>
      <View className="h-10 w-10 items-center justify-center rounded-xl bg-stone-100 dark:bg-stone-800">
        <Ionicons name={icon} size={18} color="#b45309" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-stone-800 dark:text-stone-100">{label}</Text>
        <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#a8a29e" />
    </TouchableOpacity>
  );
}
