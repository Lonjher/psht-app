import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import api from '../services/api';
import { Button } from '~/components/ui/button';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/register', form);
      setSuccess(true);
    } catch (e) {
      setError('Pendaftaran gagal. Periksa kembali data Anda.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 px-6 dark:bg-stone-950">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-emerald-200 bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-900/30">
          <Text className="text-3xl">✓</Text>
        </View>

        <Text className="mb-2 text-2xl font-bold text-stone-800 dark:text-stone-100">
          Pendaftaran Berhasil!
        </Text>
        <Text className="mb-8 text-center text-sm leading-5 text-stone-500 dark:text-stone-400">
          Akun Anda sedang menunggu persetujuan admin.{'\n'}Silakan masuk kembali setelah akun Anda
          disetujui.
        </Text>

        <Button
          className="w-full bg-amber-700 active:opacity-90"
          size="lg"
          onPress={() => router.replace('/login')}>
          <Text className="font-semibold text-white">Ke Halaman Login</Text>
        </Button>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-stone-50 dark:bg-stone-950"
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View className="bg-stone-800 px-6 pb-10 pt-16 dark:bg-stone-900">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-8 h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Text className="text-white">←</Text>
        </TouchableOpacity>

        <View className="mb-5 h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2">
          <Image className="h-full w-full" source={require('../assets/images/logo.png')} />
        </View>

        <Text className="text-2xl font-bold text-white">Daftar Anggota</Text>
        <Text className="mt-1 text-sm text-stone-300">
          Isi data diri untuk mendaftar sebagai anggota
        </Text>
      </View>

      {/* Form Card */}
      <View className="flex-1 px-6">
        <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          {error ? (
            <View className="mb-4 flex-row items-start gap-3 rounded-xl border border-red-100 bg-red-50 p-3 dark:border-red-900/40 dark:bg-red-950/30">
              <View className="mt-0.5 h-5 w-5 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <Text className="text-[10px] text-red-600 dark:text-red-400">!</Text>
              </View>
              <Text className="flex-1 text-sm leading-5 text-red-600 dark:text-red-400">
                {error}
              </Text>
            </View>
          ) : null}

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            NAMA LENGKAP
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Nama lengkap"
            placeholderTextColor="#a8a29e"
            value={form.name}
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            EMAIL
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="nama@email.com"
            placeholderTextColor="#a8a29e"
            value={form.email}
            onChangeText={(text) => setForm({ ...form, email: text })}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            KATA SANDI
          </Text>
          <View className="mb-4 flex-row items-center rounded-xl border border-stone-200 bg-stone-50 pr-3 dark:border-stone-700 dark:bg-stone-800">
            <TextInput
              className="flex-1 px-4 py-3 text-sm text-stone-800 dark:text-stone-100"
              placeholder="Minimal 8 karakter"
              placeholderTextColor="#a8a29e"
              secureTextEntry={!showPassword}
              value={form.password}
              onChangeText={(text) => setForm({ ...form, password: text })}
            />
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
              <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                {showPassword ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            KONFIRMASI KATA SANDI
          </Text>
          <View className="mb-5 flex-row items-center rounded-xl border border-stone-200 bg-stone-50 pr-3 dark:border-stone-700 dark:bg-stone-800">
            <TextInput
              className="flex-1 px-4 py-3 text-sm text-stone-800 dark:text-stone-100"
              placeholder="Ulangi kata sandi"
              placeholderTextColor="#a8a29e"
              secureTextEntry={!showConfirm}
              value={form.password_confirmation}
              onChangeText={(text) => setForm({ ...form, password_confirmation: text })}
              onSubmitEditing={handleRegister}
            />
            <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
              <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                {showConfirm ? 'Sembunyikan' : 'Lihat'}
              </Text>
            </TouchableOpacity>
          </View>

          <Button
            className="w-full bg-amber-700 active:opacity-90"
            size="lg"
            onPress={handleRegister}
            disabled={loading}>
            <Text className="font-semibold text-white">{loading ? 'Memproses...' : 'Daftar'}</Text>
          </Button>
        </View>

        {/* Masuk Link */}
        <View className="mt-6 flex-row justify-center">
          <Text className="text-sm text-stone-500 dark:text-stone-400">Sudah punya akun? </Text>
          <TouchableOpacity onPress={() => router.replace({ pathname: '/login' })}>
            <Text className="text-sm font-semibold text-amber-700 dark:text-amber-500">Masuk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Footer */}
      <View className="items-center pb-8 pt-6">
        <Text className="text-xs text-stone-400 dark:text-stone-600">
          © 2026 PSHT Ranting Guluk-Guluk
        </Text>
      </View>
    </ScrollView>
  );
}
