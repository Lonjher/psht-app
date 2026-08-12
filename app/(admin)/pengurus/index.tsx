import { useState, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';

interface Pengurus {
  id: number;
  name: string;
  email: string;
  no_hp?: string;
  status: string;
}

export default function ListPengurus() {
  const [data, setData] = useState<Pengurus[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  const fetchData = useCallback(() => {
    setLoading(true);
    api
      .get('/pengurus')
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const filtered = data.filter(
    (item) =>
      item.name.toLowerCase().includes(query.toLowerCase()) ||
      item.email.toLowerCase().includes(query.toLowerCase())
  );

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
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="chevron-back" size={18} color="#ffffff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push('/pengurus/create')}
            className="flex-row items-center gap-1.5 rounded-full bg-amber-700 px-4 py-2"
            activeOpacity={0.8}>
            <Ionicons name="add" size={16} color="#ffffff" />
            <Text className="text-xs font-semibold text-white">Tambah</Text>
          </TouchableOpacity>
        </View>

        <Text className="text-xs font-medium tracking-widest text-amber-500">KELOLA</Text>
        <Text className="mt-1 text-2xl font-bold text-white">Daftar Pengurus</Text>
        <Text className="mt-1 text-xs text-stone-300">{data.length} pengurus terdaftar</Text>
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
              {query ? 'Pengurus tidak ditemukan' : 'Belum ada data pengurus'}
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="mb-3 flex-row items-center gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none"
            onPress={() => router.push({ pathname: '/pengurus/[id]', params: { id: item.id } })}
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
              {item.no_hp ? (
                <Text className="mt-0.5 text-xs text-stone-400 dark:text-stone-600">
                  {item.no_hp}
                </Text>
              ) : null}
            </View>

            <Ionicons name="chevron-forward" size={18} color="#a8a29e" />
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
