import { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { WithTabs } from '~/components/WithTabs';

interface User {
  id: number;
  name: string;
  email: string;
  nomor_anggota?: string;
  status: string;
}

type FilterStatus = 'semua' | 'aktif' | 'pending';

export default function ListUsers() {
  const [data, setData] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterStatus>('semua');

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get('/users')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const filtered = data.filter((item) => {
    const matchQuery =
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.email.toLowerCase().includes(query.toLowerCase());
    const matchStatus = filter === 'semua' ? true : item.status.toLowerCase() === filter;
    return matchQuery && matchStatus;
  });

  const pendingCount = data.filter((u) => u.status.toLowerCase() === 'pending').length;

  const getInitials = (name: string) =>
    name
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
            onPress={() => router.push('/users/create')}
            className="flex-row items-center gap-1.5 rounded-full bg-amber-700 px-4 py-2"
            activeOpacity={0.8}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text className="text-xs font-semibold text-white">Tambah</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-medium tracking-widest text-amber-500">KELOLA</Text>
        <Text className="mt-1 text-2xl font-bold text-white">Daftar Anggota</Text>
        <Text className="mt-1 text-xs text-stone-300">
          {data.length} anggota • {pendingCount} menunggu persetujuan
        </Text>
      </View>

      {/* Search */}
      <View className="-mt-4 px-5">
        <View className="flex-row items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Ionicons name="search" size={16} color="#a8a29e" />
          <TextInput
            className="flex-1 text-sm text-stone-800 dark:text-stone-100"
            placeholder="Cari nama atau email..."
            placeholderTextColor="#a8a29e"
            value={query}
            onChangeText={setQuery}
          />
        </View>
      </View>

      {/* Filter Tabs */}
      <View className="mt-4 flex-row gap-2 px-5">
        <FilterChip label="Semua" active={filter === 'semua'} onPress={() => setFilter('semua')} />
        <FilterChip label="Aktif" active={filter === 'aktif'} onPress={() => setFilter('aktif')} />
        <FilterChip
          label="Pending"
          active={filter === 'pending'}
          onPress={() => setFilter('pending')}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id.toString()}
        contentContainerClassName="px-5 pb-10 pt-4"
        ListEmptyComponent={
          <View className="mt-16 items-center px-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-800/60">
              <Ionicons name="people-outline" size={26} color="#a8a29e" />
            </View>
            <Text className="text-center text-sm leading-5 text-stone-400 dark:text-stone-600">
              Tidak ada anggota yang sesuai
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isAktif = item.status.toLowerCase() === 'aktif';
          return (
            <TouchableOpacity
              className="mb-3 flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
              onPress={() => router.push({ pathname: '/users/[id]', params: { id: item.id } })}
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
                <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                  {item.email}
                </Text>
                <Text className="mt-0.5 text-xs text-stone-400 dark:text-stone-600">
                  {item.nomor_anggota ?? 'Belum ada nomor anggota'}
                </Text>
              </View>

              <View
                className={`rounded-full px-2.5 py-1 ${
                  isAktif
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}>
                <Text
                  className={`text-[10px] font-semibold capitalize ${
                    isAktif
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-amber-700 dark:text-amber-500'
                  }`}>
                  {item.status}
                </Text>
              </View>
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
