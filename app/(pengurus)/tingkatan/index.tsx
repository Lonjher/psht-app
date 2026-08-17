import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { WithTabs } from '~/components/WithTabs';

interface Tingkatan {
  id: number;
  nama_tingkatan: string;
  urutan: number;
}

export default function ListTingkatan() {
  const [data, setData] = useState<Tingkatan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get('/tingkatan')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const sorted = [...data].sort((a, b) => a.urutan - b.urutan);

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
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/');
            }}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="chevron-back" size={18} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/tingkatan/create')}
            className="flex-row items-center gap-1.5 rounded-full bg-amber-700 px-4 py-2"
            activeOpacity={0.8}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text className="text-xs font-semibold text-white">Tambah</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-medium tracking-widest text-amber-500">KELOLA</Text>
        <Text className="mt-1 text-2xl font-bold text-white">Daftar Tingkatan</Text>
        <Text className="mt-1 text-xs text-stone-300">{data.length} tingkatan terdaftar</Text>
      </View>

      <FlatList
        data={sorted}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-10 pt-5"
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-800/60">
              <Ionicons name="layers-outline" size={26} color="#a8a29e" />
            </View>
            <Text className="text-center text-sm leading-5 text-stone-400 dark:text-stone-600">
              Belum ada data tingkatan
            </Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <TouchableOpacity
            className="mb-3 flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
            onPress={() => router.push({ pathname: '/tingkatan/[id]', params: { id: item.id } })}
            activeOpacity={0.7}>
            <View className="h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <Text className="text-sm font-bold text-amber-700 dark:text-amber-500">
                {item.urutan}
              </Text>
            </View>

            <View className="flex-1">
              <Text className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                {item.nama_tingkatan}
              </Text>
              <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                Urutan ke-{item.urutan}
              </Text>
            </View>

            {/* Garis penghubung untuk kesan tangga tingkatan */}
            {index < sorted.length - 1 && (
              <View className="absolute -bottom-3 left-[38px] h-3 w-0.5 bg-stone-200 dark:bg-stone-800" />
            )}

            <Ionicons name="chevron-forward" size={18} color="#a8a29e" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
