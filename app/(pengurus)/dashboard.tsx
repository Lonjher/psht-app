import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { clearAuthSession, setAuthToken } from '@/services/authStore';
import api from '@/services/api';
import { WithTabs } from '~/components/WithTabs';

interface DashboardData {
  total_anggota_aktif: number;
  kenaikan_saya_uji: number;
}

export default function PengurusDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    api
      .get('/dashboard')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = () => {
    Alert.alert('Keluar Akun', 'Apakah Anda yakin ingin keluar?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: async () => {
          await clearAuthSession();
          setAuthToken(null);
          router.replace('/');
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
            <Text className="mt-1 text-xl font-bold text-white">Halo, Pengurus</Text>
            <Text className="mt-0.5 text-xs text-stone-300">Selamat datang kembali</Text>
          </View>

          <TouchableOpacity
            onPress={handleLogout}
            className="h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/10"
            activeOpacity={0.7}>
            <Ionicons name="log-out-outline" size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-5 pt-8"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10">
        {/* Stats */}
        <View className="-mx-1.5 -mt-5 flex-row flex-wrap">
          <View className="w-1/2 p-1.5">
            <View className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
              <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                <Ionicons name="people" size={17} color="#2563eb" />
              </View>
              <Text className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {data?.total_anggota_aktif ?? 0}
              </Text>
              <Text className="mt-0.5 text-xs leading-4 text-stone-500 dark:text-stone-400">
                Anggota Aktif
              </Text>
            </View>
          </View>

          <View className="w-1/2 p-1.5">
            <View className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
              <View className="mb-3 h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
                <Ionicons name="ribbon" size={17} color="#059669" />
              </View>
              <Text className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                {data?.kenaikan_saya_uji ?? 0}
              </Text>
              <Text className="mt-0.5 text-xs leading-4 text-stone-500 dark:text-stone-400">
                Kenaikan Saya Uji
              </Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <Text className="mb-3 mt-8 text-base font-bold text-stone-800 dark:text-stone-100">
          Menu Pengurus
        </Text>

        <View className="gap-2.5">
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
            label="Input Kenaikan"
            desc="Catat hasil ujian tingkat"
            icon="trending-up-outline"
            onPress={() => router.push('/kenaikan')}
          />
        </View>
      </ScrollView>
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
