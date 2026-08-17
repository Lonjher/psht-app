import { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

interface Kenaikan {
  id: number;
  user: { name: string };
  tingkatan: { nama_tingkatan: string };
  tanggal_kenaikan: string;
  status: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  lulus: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    label: 'Lulus',
  },
  proses: {
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-500',
    label: 'Proses',
  },
  tidak_lulus: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-600 dark:text-red-400',
    label: 'Tidak Lulus',
  },
};

export default function ListKenaikan() {
  const [data, setData] = useState<Kenaikan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get('/kenaikan')
      .then((res) => setData(res.data.data ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const getInitials = (name: string) =>
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
      <View className="bg-stone-800 px-5 pb-6 pt-14 dark:bg-stone-900">
        <View className="mb-5 flex-row items-center justify-between">
          <TouchableOpacity
            onPress={() => { if (router.canGoBack()) { router.back(); return; } router.replace('/'); }}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="chevron-back" size={18} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/kenaikan/create')}
            className="flex-row items-center gap-1.5 rounded-full bg-amber-700 px-4 py-2"
            activeOpacity={0.8}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text className="text-xs font-semibold text-white">Input</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-medium tracking-widest text-amber-500">KELOLA</Text>
        <Text className="mt-1 text-2xl font-bold text-white">Data Kenaikan</Text>
        <Text className="mt-1 text-xs text-stone-300">{data.length} riwayat kenaikan</Text>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-10 pt-5"
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-800/60">
              <Ionicons name="trending-up-outline" size={26} color="#a8a29e" />
            </View>
            <Text className="text-center text-sm leading-5 text-stone-400 dark:text-stone-600">
              Belum ada data kenaikan
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const cfg = statusConfig[item.status] ?? statusConfig.proses;
          return (
            <TouchableOpacity
              className="mb-3 flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
              onPress={() => router.push({ pathname: '/kenaikan/[id]', params: { id: item.id } })}
              activeOpacity={0.7}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Text className="text-xs font-bold text-amber-700 dark:text-amber-500">
                  {getInitials(item.user?.name)}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {item.user?.name}
                </Text>
                <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  {item.tingkatan?.nama_tingkatan}
                </Text>
                <View className="mt-1 flex-row items-center gap-1">
                  <Ionicons name="calendar-outline" size={11} color="#a8a29e" />
                  <Text className="text-xs text-stone-400 dark:text-stone-600">
                    {item.tanggal_kenaikan}
                  </Text>
                </View>
              </View>

              <View className={`rounded-full px-2.5 py-1 ${cfg.bg}`}>
                <Text className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}
