import { useState } from 'react';
import { View, Text, TextInput, Alert, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { Button } from '@/components/ui/button';

export default function CreatePengurus() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    nomor_anggota: '',
    password: '',
    no_hp: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/pengurus', form);
      Alert.alert('Berhasil', 'Pengurus baru ditambahkan');
      router.replace({ pathname: '/pengurus' });
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
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
          onPress={() => router.replace({ pathname: '/pengurus' })}
          className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Ionicons name="chevron-back" size={18} color="#ffffff" />
        </TouchableOpacity>

        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
          <Ionicons name="person-add-outline" size={20} color="#ffffff" />
        </View>

        <Text className="text-2xl font-bold text-white">Tambah Pengurus</Text>
        <Text className="mt-1 text-sm text-stone-300">
          Lengkapi data untuk mendaftarkan pengurus baru
        </Text>
      </View>

      {/* Form Card */}
      <View className="flex-1 px-5">
        <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            NAMA LENGKAP
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Nama pengurus"
            placeholderTextColor="#a8a29e"
            value={form.name}
            onChangeText={(t) => setForm({ ...form, name: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            EMAIL
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="nama@email.com"
            placeholderTextColor="#a8a29e"
            autoCapitalize="none"
            keyboardType="email-address"
            value={form.email}
            onChangeText={(t) => setForm({ ...form, email: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            NOMOR ANGGOTA <Text className="text-stone-400 dark:text-stone-600">(opsional)</Text>
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="PSHT-000001"
            placeholderTextColor="#a8a29e"
            autoCapitalize="characters"
            value={form.nomor_anggota}
            onChangeText={(t) => setForm({ ...form, nomor_anggota: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            PASSWORD
          </Text>
          <View className="mb-4 flex-row items-center rounded-xl border border-stone-200 bg-stone-50 pr-3 dark:border-stone-700 dark:bg-stone-800">
            <TextInput
              className="flex-1 px-4 py-3 text-sm text-stone-800 dark:text-stone-100"
              placeholder="Minimal 8 karakter"
              placeholderTextColor="#a8a29e"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(t) => setForm({ ...form, password: t })}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            NO HP <Text className="text-stone-400 dark:text-stone-600">(opsional)</Text>
          </Text>
          <TextInput
            className="mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="08xxxxxxxxxx"
            placeholderTextColor="#a8a29e"
            keyboardType="phone-pad"
            value={form.no_hp}
            onChangeText={(t) => setForm({ ...form, no_hp: t })}
          />

          <Button
            className="w-full bg-amber-700 active:opacity-90"
            size="lg"
            onPress={handleSave}
            disabled={loading}>
            <Text className="font-semibold text-white">
              {loading ? 'Menyimpan...' : 'Simpan Pengurus'}
            </Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
