// app/(admin)/kenaikan/index.tsx
import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

interface UserWithKenaikan {
  id: number;
  name: string;
  nomor_anggota?: string;
  status: string;
  total_kenaikan: number;
  tingkatan_terakhir?: string | null;
  kenaikan_terakhir?: {
    id: number;
    tingkatan_id: number;
    tanggal_kenaikan: string;
    status: string;
    tingkatan?: {
      id: number;
      nama_tingkatan: string;
      urutan: number;
    };
  } | null;
  tingkatan?: {
    id: number;
    nama_tingkatan: string;
    urutan: number;
  } | null;
}

// Daftar tingkatan yang sudah ditentukan
const DAFTAR_TINGKATAN = [
  { label: 'Polos', urutan: 1 },
  { label: 'Jambon', urutan: 2 },
  { label: 'Hijau', urutan: 3 },
  { label: 'Putih Kecil', urutan: 4 },
  { label: 'Putih', urutan: 5 },
];

export default function ListKenaikan() {
  const [data, setData] = useState<UserWithKenaikan[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [selectedTingkatan, setSelectedTingkatan] = useState('semua');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Ambil hanya user yang aktif
      const res = await api.get('/users?status=aktif');
      const users = res.data;

      // Filter tambahan untuk memastikan hanya user aktif
      const activeUsers = users.filter((user: UserWithKenaikan) => 
        user.status?.toLowerCase() === 'aktif'
      );

      const usersWithKenaikan = activeUsers.map((user: UserWithKenaikan) => ({
        id: user.id,
        name: user.name,
        nomor_anggota: user.nomor_anggota,
        status: user.status,
        total_kenaikan: user.total_kenaikan || 0,
        tingkatan_terakhir: user.tingkatan_terakhir || null,
        kenaikan_terakhir: user.kenaikan_terakhir || null,
        tingkatan: user.tingkatan || null,
      }));

      console.log('Active users count:', usersWithKenaikan.length);
      console.log('Active users:', usersWithKenaikan.map((u: UserWithKenaikan) => u.name));

      setData(usersWithKenaikan);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const getTingkatanLabel = (user: UserWithKenaikan): string => {
    // Prioritas 1: Gunakan tingkatan_terakhir dari backend
    if (user.tingkatan_terakhir && user.tingkatan_terakhir !== 'Belum ada tingkatan') {
      return user.tingkatan_terakhir;
    }
    
    // Prioritas 2: Cek dari kenaikan terakhir
    if (user.kenaikan_terakhir?.tingkatan?.nama_tingkatan) {
      return user.kenaikan_terakhir.tingkatan.nama_tingkatan;
    }
    
    // Prioritas 3: Cek dari tingkatan langsung
    if (user.tingkatan?.nama_tingkatan) {
      return user.tingkatan.nama_tingkatan;
    }
    
    return 'Belum ada';
  };

  // Hitung jumlah anggota untuk setiap tingkatan
  const getTingkatanCount = (label: string): number => {
    return data.filter((user) => getTingkatanLabel(user) === label).length;
  };

  const filtered = data.filter((item) => {
    const matchQuery =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      (item.nomor_anggota ?? '').toLowerCase().includes(query.toLowerCase());
    
    let matchTingkatan = false;
    
    if (selectedTingkatan === 'semua') {
      matchTingkatan = true;
    } else if (selectedTingkatan === 'Belum ada') {
      // Khusus untuk filter "Belum ada"
      const label = getTingkatanLabel(item);
      matchTingkatan = label === 'Belum ada';
    } else {
      matchTingkatan = getTingkatanLabel(item) === selectedTingkatan;
    }
    
    return matchQuery && matchTingkatan;
  });

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
              router.replace('/(admin)/dashboard');
            }}
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
        <Text className="mt-1 text-2xl font-bold text-white">Kenaikan Tingkat</Text>
        <Text className="mt-1 text-xs text-stone-300">
          Pilih anggota untuk melihat riwayat kenaikan
        </Text>
      </View>

      {/* Search */}
      <View className="-mt-4 px-5">
        <View className="flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Ionicons name="search" size={16} color="#a8a29e" />
          <TextInput
            className="flex-1 text-sm text-stone-800 dark:text-stone-100"
            placeholder="Cari nama atau nomor anggota..."
            placeholderTextColor="#a8a29e"
            value={query}
            onChangeText={setQuery}
          />
          {query !== '' && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color="#a8a29e" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs - Horizontal Scroll */}
      <View className="mt-4">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2 px-5">
          {/* Filter Semua */}
          <FilterChip
            label="Semua"
            active={selectedTingkatan === 'semua'}
            onPress={() => setSelectedTingkatan('semua')}
          />

          {/* Filter Tingkatan yang sudah ditentukan */}
          {DAFTAR_TINGKATAN.map(({ label }) => {
            const isSelected = selectedTingkatan === label;
            
            return (
              <FilterChip
                key={label}
                label={label}
                active={isSelected}
                onPress={() => setSelectedTingkatan(label)}
              />
            );
          })}

          {/* Filter Belum ada - SELALU TAMPIL */}
          <FilterChip
            label="Belum ada"
            active={selectedTingkatan === 'Belum ada'}
            onPress={() => setSelectedTingkatan('Belum ada')}
          />
        </ScrollView>
      </View>

      {/* Info Jumlah Data */}
      <View className="mt-3 flex-row items-center justify-between px-5 mb-1">
        <Text className="text-xs text-stone-500 dark:text-stone-400">
          Menampilkan{' '}
          <Text className="font-bold text-stone-700 dark:text-stone-200">
            {filtered.length}
          </Text>{' '}
          dari{' '}
          <Text className="font-bold text-stone-700 dark:text-stone-200">
            {data.length}
          </Text>{' '}
          anggota aktif
        </Text>
        {selectedTingkatan !== 'semua' && (
          <View className="flex-row items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 dark:bg-amber-900/30">
            <Ionicons name="ribbon-outline" size={11} color="#b45309" />
            <Text className="text-[10px] font-semibold text-amber-700 dark:text-amber-500">
              {selectedTingkatan}
            </Text>
          </View>
        )}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-10 pt-3"
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-800/60">
              <Ionicons name="trending-up-outline" size={26} color="#a8a29e" />
            </View>
            <Text className="text-center text-sm leading-5 text-stone-400 dark:text-stone-600">
              Tidak ada anggota yang sesuai
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const lastStatus = item.kenaikan_terakhir?.status;
          const statusCfg = lastStatus ? statusConfig[lastStatus] : null;

          return (
            <TouchableOpacity
              className="mb-3 flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
              onPress={() => {
                router.push({
                  pathname: '/kenaikan/riwayat/[id]',
                  params: {
                    id: item.id,
                    name: item.name,
                  },
                });
              }}
              activeOpacity={0.7}>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Text className="text-xs font-bold text-amber-700 dark:text-amber-500">
                  {getInitials(item.name)}
                </Text>
              </View>

              <View className="flex-1">
                <Text className="text-sm font-semibold text-stone-800 dark:text-stone-100">
                  {item.name}
                </Text>
                {item.nomor_anggota && (
                  <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                    {item.nomor_anggota}
                  </Text>
                )}
                <View className="mt-1 flex-row items-center gap-2">
                  <View className="flex-row items-center gap-1">
                    <Ionicons name="trending-up-outline" size={11} color="#a8a29e" />
                    <Text className="text-xs text-stone-400 dark:text-stone-600">
                      {item.total_kenaikan}x kenaikan
                    </Text>
                  </View>

                  <View className="h-1 w-1 rounded-full bg-stone-400" />

                  <View className="flex-row items-center gap-1">
                    <Ionicons name="ribbon-outline" size={11} color="#a8a29e" />
                    <Text className="text-xs text-stone-500 dark:text-stone-400">
                      {getTingkatanLabel(item)}
                    </Text>
                  </View>
                </View>
              </View>

              {statusCfg && (
                <View className={`rounded-full px-2.5 py-1 ${statusCfg.bg}`}>
                  <Text className={`text-[10px] font-semibold ${statusCfg.text}`}>
                    {statusCfg.label}
                  </Text>
                </View>
              )}

              <Ionicons name="chevron-forward" size={16} color="#a8a29e" />
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      className={`rounded-full px-4 py-2 ${
        active
          ? 'bg-stone-800 dark:bg-amber-700'
          : 'border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-900'
      }`}
      activeOpacity={0.8}>
      <Text
        className={`text-xs font-medium ${
          active ? 'text-white' : 'text-stone-600 dark:text-stone-300'
        }`}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}