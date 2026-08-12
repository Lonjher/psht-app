import { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { Button } from '@/components/ui/button';

export default function CreateTingkatan() {
  const [form, setForm] = useState({ nama_tingkatan: '', urutan: '', deskripsi: '' });
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/tingkatan', { ...form, urutan: parseInt(form.urutan) });
      Alert.alert('Berhasil', 'Tingkatan ditambahkan');
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-stone-50 dark:bg-stone-950"
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View className="bg-stone-800 px-5 pb-8 pt-14 dark:bg-stone-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Ionicons name="chevron-back" size={18} color="#ffffff" />
        </TouchableOpacity>

        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
          <Ionicons name="layers-outline" size={20} color="#ffffff" />
        </View>

        <Text className="text-2xl font-bold text-white">Tambah Tingkatan</Text>
        <Text className="mt-1 text-sm text-stone-300">Lengkapi data tingkatan sabuk baru</Text>
      </View>

      {/* Form Card */}
      <View className="flex-1 px-5">
        <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            NAMA TINGKATAN
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Contoh: Sabuk Polos"
            placeholderTextColor="#a8a29e"
            value={form.nama_tingkatan}
            onChangeText={(t) => setForm({ ...form, nama_tingkatan: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            URUTAN
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Contoh: 1"
            placeholderTextColor="#a8a29e"
            keyboardType="numeric"
            value={form.urutan}
            onChangeText={(t) => setForm({ ...form, urutan: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            DESKRIPSI <Text className="text-stone-400 dark:text-stone-600">(opsional)</Text>
          </Text>
          <TextInput
            className="mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Keterangan singkat tingkatan ini"
            placeholderTextColor="#a8a29e"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
            value={form.deskripsi}
            onChangeText={(t) => setForm({ ...form, deskripsi: t })}
          />

          <Button
            className="w-full bg-amber-700 active:opacity-90"
            size="lg"
            onPress={handleSave}
            disabled={loading}>
            <Text className="font-semibold text-white">
              {loading ? 'Menyimpan...' : 'Simpan Tingkatan'}
            </Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
