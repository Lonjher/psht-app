// app/(admin)/users/create.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';

const generateNomorAnggota = (existingNumbers: string[]): string => {
  // Extract numeric part from format PSHT-000000
  const numbers = existingNumbers
    .map((num) => {
      const match = num.match(/PSHT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const nextNumber = (Math.max(...numbers, 0) + 1).toString().padStart(6, '0');
  return `PSHT-${nextNumber}`;
};

export default function CreateUser() {
  const [form, setForm] = useState({
    nomor_anggota: '',
    name: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    no_hp: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const generateNumber = async () => {
    try {
      const res = await api.get('/users');
      const existingNumbers = (res.data as any[])
        .map((user) => user.nomor_anggota)
        .filter((num) => num && typeof num === 'string');
      const newNumber = generateNomorAnggota(existingNumbers);
      setForm((prev) => ({ ...prev, nomor_anggota: newNumber }));
    } catch (error) {
      // Fallback: generate with timestamp if API fails
      const timestamp = Date.now().toString().slice(-6);
      setForm((prev) => ({ ...prev, nomor_anggota: `PSHT-${timestamp}` }));
    }
  };

  useEffect(() => {
    generateNumber();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.post('/users', form);
      Alert.alert('Berhasil', 'Anggota baru ditambahkan');
      // Reset form ke nilai awal
      setForm({
        nomor_anggota: '',
        name: '',
        jenis_kelamin: '',
        tanggal_lahir: '',
        alamat: '',
        no_hp: '',
        email: '',
        password: '',
      });
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
      // Generate nomor anggota baru untuk input berikutnya
      generateNumber();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setForm((prev) => ({ ...prev, tanggal_lahir: selectedDate.toISOString().split('T')[0] }));
      }
    } else {
      // iOS
      if (selectedDate) {
        setForm((prev) => ({ ...prev, tanggal_lahir: selectedDate.toISOString().split('T')[0] }));
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0} // sesuaikan dengan tinggi header
    >
      <ScrollView
        className="flex-1 bg-stone-50 dark:bg-stone-950"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-stone-800 px-5 pb-8 pt-14 dark:bg-stone-900">
          <TouchableOpacity
            onPress={() => {
              if (router.canGoBack()) {
                router.back();
                return;
              }
              router.replace('/');
            }}
            className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="chevron-back" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
            <Ionicons name="person-add-outline" size={20} color="#ffffff" />
          </View>

          <Text className="text-2xl font-bold text-white">Tambah Anggota</Text>
          <Text className="mt-1 text-sm text-stone-300">
            Lengkapi data untuk mendaftarkan anggota baru
          </Text>
        </View>

        {/* Form Card */}
        <View className="flex-1 px-5">
          <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            <View className="mb-4 flex-row items-center gap-2">
              <View className="flex-1">
                <FieldLabel text="NO. ANGGOTA" />
                <TextInput
                  className="rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-700 dark:text-stone-300"
                  placeholder="PSHT-000001"
                  placeholderTextColor="#a8a29e"
                  autoCapitalize="characters"
                  editable={false}
                  value={form.nomor_anggota}
                />
              </View>
              {/* <TouchableOpacity
              onPress={generateNumber}
              className="mt-7 h-11 w-11 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <Ionicons name="refresh" size={20} color="#b45309" />
            </TouchableOpacity> */}
            </View>
            <FieldLabel text="NAMA LENGKAP" />
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="Nama anggota"
              placeholderTextColor="#a8a29e"
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
            />
            <FieldLabel text="JENIS KELAMIN" />
            <View className="mb-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
              <TouchableOpacity
                className="flex-row items-center justify-between px-4 py-3"
                onPress={() =>
                  setForm((prev) => ({
                    ...prev,
                    jenis_kelamin: prev.jenis_kelamin === 'Laki-Laki' ? 'Perempuan' : 'Laki-Laki',
                  }))
                }>
                <Text
                  className={`text-sm ${
                    form.jenis_kelamin ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                  }`}>
                  {form.jenis_kelamin || 'Pilih jenis kelamin'}
                </Text>
                <Ionicons name="swap-horizontal-outline" size={18} color="#a8a29e" />
              </TouchableOpacity>
            </View>
            <FieldLabel text="TANGGAL LAHIR" />
            <TouchableOpacity
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
              onPress={() => {
                setShowDatePicker(true);
              }}>
              <Text
                className={`text-sm ${form.tanggal_lahir ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'}`}>
                {form.tanggal_lahir || 'Pilih tanggal lahir'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.tanggal_lahir ? new Date(form.tanggal_lahir) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onDateChange}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}
            <FieldLabel text="ALAMAT" />
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="Alamat lengkap"
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={{ minHeight: 60 }}
              value={form.alamat}
              onChangeText={(t) => setForm({ ...form, alamat: t })}
            />
            <FieldLabel text="NO. HP" />
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#a8a29e"
              keyboardType="phone-pad"
              value={form.no_hp}
              onChangeText={(t) => setForm({ ...form, no_hp: t })}
            />
            <FieldLabel text="EMAIL" />
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="nama@email.com"
              placeholderTextColor="#a8a29e"
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
            />
            <FieldLabel text="PASSWORD" />
            <View className="mb-5 flex-row items-center rounded-xl border border-stone-200 bg-stone-50 pr-3 dark:border-stone-700 dark:bg-stone-800">
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
            <Button
              className="w-full bg-amber-700 active:opacity-90"
              size="lg"
              onPress={handleSave}
              disabled={loading}>
              <Text className="font-semibold text-white">
                {loading ? 'Menyimpan...' : 'Simpan Anggota'}
              </Text>
            </Button>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function FieldLabel({ text, optional = false }: { text: string; optional?: boolean }) {
  return (
    <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
      {text} {optional && <Text className="text-stone-400 dark:text-stone-600">(opsional)</Text>}
    </Text>
  );
}
