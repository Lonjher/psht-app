import { View, Text, ActivityIndicator, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { clearAuthSession, setAuthToken } from '@/services/authStore';
import api from '@/services/api';

interface DashboardData {
  nama: string;
  nomor_anggota: string;
  tingkatan_saat_ini: string;
  total_kenaikan: number;
}

export default function AnggotaDashboard() {
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

  const getInitials = (name?: string) =>
    (name ?? '?')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

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
            <Text className="text-xs font-medium tracking-widest text-amber-500">
              DASHBOARD ANGGOTA
            </Text>
            <Text className="mt-1 text-xl font-bold text-white">Halo, {data?.nama ?? '-'}</Text>
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
        className="flex-1 px-5 pt-10"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-10">
        {/* Kartu Identitas */}
        <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <View className="mb-4 flex-row items-center">
            <View className="mr-4 h-16 w-16 items-center justify-center rounded-full border border-amber-200/40 bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/30">
              <Text className="text-lg font-bold text-amber-700 dark:text-amber-500">
                {getInitials(data?.nama)}
              </Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-bold text-stone-800 dark:text-stone-100">
                {data?.nama}
              </Text>
              <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {data?.nomor_anggota ?? 'Belum ada nomor'}
              </Text>
            </View>
          </View>

          <View className="h-px bg-stone-100 dark:bg-stone-800" />

          <View className="mt-4 flex-row justify-between">
            <View className="flex-1">
              <Text className="text-xs text-stone-500 dark:text-stone-400">Tingkatan Saat Ini</Text>
              <Text className="mt-0.5 text-sm font-semibold text-stone-800 dark:text-stone-100">
                {data?.tingkatan_saat_ini ?? 'Belum ada'}
              </Text>
            </View>
            <View className="w-px bg-stone-100 dark:bg-stone-800" />
            <View className="flex-1 items-end">
              <Text className="text-xs text-stone-500 dark:text-stone-400">Total Kenaikan</Text>
              <Text className="mt-0.5 text-sm font-semibold text-stone-800 dark:text-stone-100">
                {data?.total_kenaikan ?? 0}
              </Text>
            </View>
          </View>
        </View>

        {/* Menu */}
        <Text className="mb-3 mt-8 text-base font-bold text-stone-800 dark:text-stone-100">
          Menu
        </Text>

        <View className="gap-2.5">
          <MenuButton
            label="Riwayat Kenaikan"
            desc="Lihat histori ujian tingkatan Anda"
            icon="trending-up-outline"
            onPress={() => router.push('/riwayat-kenaikan')}
          />
          <MenuButton
            label="Profil Saya"
            desc="Kelola data diri dan akun"
            icon="person-outline"
            onPress={() => router.push('/profile')}
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
