// app/(admin)/kenaikan/riwayat/[id].tsx
import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

interface KenaikanDetail {
  id: number;
  user_id: number;
  tingkatan_id: number;
  tanggal_kenaikan: string;
  status: string;
  nilai: any;
  catatan: string;
  tingkatan: {
    id: number;
    nama_tingkatan: string;
    urutan: number;
  } | null;
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

export default function RiwayatKenaikan() {
  const params = useLocalSearchParams();
  const userId = params.id as string;
  const name = params.name as string;

  const [data, setData] = useState<KenaikanDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(name || '');
  const [nomorAnggota, setNomorAnggota] = useState('');

  const fetchData = useCallback(async () => {
    if (!userId || userId === 'undefined') {
      console.error('userId tidak valid:', userId);
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      // Langsung gunakan endpoint /users (karena sudah terbukti berhasil)
      console.log('Fetching data dari /users');
      const usersRes = await api.get('/users');
      const users = Array.isArray(usersRes.data)
        ? usersRes.data
        : usersRes.data.data || usersRes.data || [];

      const selectedUser = users.find((u: any) => u.id === Number(userId));

      if (selectedUser) {
        console.log('User ditemukan:', selectedUser.name);
        setUserName(selectedUser.name || userName);
        setNomorAnggota(selectedUser.nomor_anggota || '');

        const kenaikanList = selectedUser.kenaikan_tingkats || [];
        console.log('Jumlah kenaikan:', kenaikanList.length);
        setData(kenaikanList);
      } else {
        console.log('User tidak ditemukan');
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

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

  const parseNilai = (nilai: any): any => {
    if (!nilai) return {};
    if (typeof nilai === 'object') return nilai;
    if (typeof nilai === 'string') {
      try {
        return JSON.parse(nilai);
      } catch (e) {
        return {};
      }
    }
    return {};
  };

  const calculateAverage = (nilai: any) => {
    const nilaiObj = parseNilai(nilai);

    const values = [
      nilaiObj.tes_tulis,
      nilaiObj.tes_senam_jurus,
      nilaiObj.tes_mental,
      nilaiObj.kehadiran,
    ].filter((v) => v !== undefined && v !== null && v !== '');

    if (values.length === 0) return 0;
    const sum = values.reduce((acc, val) => acc + Number(val), 0);
    return Math.round((sum / values.length) * 100) / 100;
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
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/kenaikan');
          }}
          className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Ionicons name="chevron-back" size={18} color="#ffffff" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-3">
          <View className="h-12 w-12 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
            <Text className="text-sm font-bold text-amber-700 dark:text-amber-500">
              {getInitials(userName)}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">{userName}</Text>
            {nomorAnggota && <Text className="mt-0.5 text-xs text-stone-300">{nomorAnggota}</Text>}
            <Text className="mt-0.5 text-xs text-stone-400">{data.length} riwayat kenaikan</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={data}
        keyExtractor={(item, index) => item.id?.toString() || index.toString()}
        contentContainerClassName="px-5 pb-10 pt-5"
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-800/60">
              <Ionicons name="trending-up-outline" size={26} color="#a8a29e" />
            </View>
            <Text className="text-center text-sm leading-5 text-stone-400 dark:text-stone-600">
              Belum ada riwayat kenaikan
            </Text>
          </View>
        }
        renderItem={({ item, index }) => {
          const cfg = statusConfig[item.status] ?? statusConfig.proses;
          const avg = calculateAverage(item.nilai);
          const nilaiObj = parseNilai(item.nilai);

          return (
            <View className="mb-4">
              {/* Timeline connector */}
              {index < data.length - 1 && (
                <View className="ml-6 h-8 w-px bg-stone-300 dark:bg-stone-700" />
              )}

              <View className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
                <View className="flex-row items-start justify-between">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <View className="h-2 w-2 rounded-full bg-amber-500" />
                      <Text className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                        {item.tingkatan?.nama_tingkatan || 'Tingkatan tidak ditemukan'}
                      </Text>
                    </View>

                    <View className="mt-2 flex-row items-center gap-1">
                      <Ionicons name="calendar-outline" size={12} color="#a8a29e" />
                      <Text className="text-xs text-stone-500 dark:text-stone-400">
                        {item.tanggal_kenaikan || '-'}
                      </Text>
                    </View>
                  </View>

                  <View className={`rounded-full px-2.5 py-1 ${cfg.bg}`}>
                    <Text className={`text-[10px] font-semibold ${cfg.text}`}>{cfg.label}</Text>
                  </View>
                </View>

                {/* Nilai */}
                <View className="mt-3 rounded-lg bg-stone-50 p-3 dark:bg-stone-800">
                  <Text className="mb-2 text-xs font-semibold text-stone-600 dark:text-stone-300">
                    Nilai Rata-rata: {avg}
                  </Text>
                  <View className="flex-row flex-wrap gap-2">
                    {nilaiObj.tes_tulis !== undefined && nilaiObj.tes_tulis !== null && (
                      <View className="rounded-full bg-white px-2 py-1 dark:bg-stone-700">
                        <Text className="text-[10px] text-stone-600 dark:text-stone-300">
                          Tulis: {nilaiObj.tes_tulis}
                        </Text>
                      </View>
                    )}
                    {nilaiObj.tes_senam_jurus !== undefined &&
                      nilaiObj.tes_senam_jurus !== null && (
                        <View className="rounded-full bg-white px-2 py-1 dark:bg-stone-700">
                          <Text className="text-[10px] text-stone-600 dark:text-stone-300">
                            Senam: {nilaiObj.tes_senam_jurus}
                          </Text>
                        </View>
                      )}
                    {nilaiObj.tes_mental !== undefined && nilaiObj.tes_mental !== null && (
                      <View className="rounded-full bg-white px-2 py-1 dark:bg-stone-700">
                        <Text className="text-[10px] text-stone-600 dark:text-stone-300">
                          Mental: {nilaiObj.tes_mental}
                        </Text>
                      </View>
                    )}
                    {nilaiObj.kehadiran !== undefined && nilaiObj.kehadiran !== null && (
                      <View className="rounded-full bg-white px-2 py-1 dark:bg-stone-700">
                        <Text className="text-[10px] text-stone-600 dark:text-stone-300">
                          Hadir: {nilaiObj.kehadiran}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Catatan */}
                {item.catatan && (
                  <View className="mt-2">
                    <Text className="text-xs text-stone-500 dark:text-stone-400">
                      Catatan: {item.catatan}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}
