import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useEffect, useState, useCallback } from 'react';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

interface RiwayatItem {
  id: number;
  tingkatan: { nama_tingkatan: string } | null;
  tanggal_kenaikan: string;
  status: string;
  nilai?: {
    tes_tulis: number;
    tes_senam_jurus: number;
    tes_mental: number;
    kehadiran: number;
  };
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  lulus: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', label: 'Lulus' },
  proses: { bg: 'bg-amber-500/20', text: 'text-amber-400', label: 'Proses' },
  tidak_lulus: { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Tidak Lulus' },
};

export default function RiwayatKenaikan() {
  const [data, setData] = useState<RiwayatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/riwayat-kenaikan');
      setData(res.data);
    } catch (err) {
      console.log('Gagal mengambil riwayat:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Ambil data setiap kali halaman mendapat fokus (setelah kembali dari detail)
  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-stone-50 px-5 pt-14 dark:bg-stone-950">
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-stone-200 dark:bg-stone-800">
        <Ionicons name="chevron-back" size={18} color="#78716c" />
      </TouchableOpacity>

      <Text className="mb-4 text-2xl font-bold text-stone-800 dark:text-stone-100">
        Riwayat Kenaikan
      </Text>

      {data.length === 0 ? (
        <View className="mt-10 items-center">
          <Ionicons name="ribbon-outline" size={48} color="#a8a29e" />
          <Text className="mt-2 text-sm text-stone-400">Belum ada riwayat kenaikan.</Text>
        </View>
      ) : (
        <FlatList
          data={data}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchData();
              }}
            />
          }
          renderItem={({ item }) => {
            const cfg = statusConfig[item.status] ?? statusConfig.proses;
            return (
              <TouchableOpacity
                className="mb-3 rounded-xl border border-stone-200 bg-white p-4 shadow-sm dark:border-stone-800 dark:bg-stone-900"
                onPress={() =>
                  router.push({ pathname: '/riwayat-kenaikan/[id]', params: { id: item.id } })
                }
                activeOpacity={0.7}>
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                      <Ionicons name="ribbon" size={18} color="#b45309" />
                    </View>
                    <View>
                      <Text className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {item.tingkatan?.nama_tingkatan ?? 'Tidak diketahui'}
                      </Text>
                      <Text className="text-xs text-stone-500">{item.tanggal_kenaikan}</Text>
                    </View>
                  </View>
                  <View className={`rounded-full px-3 py-1 ${cfg.bg}`}>
                    <Text className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}
