import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking, // tambahkan import Linking
} from 'react-native';
import { router } from 'expo-router';
import { setAuthSession, setAuthToken } from '@/services/authStore';
import api from '../services/api';
import { Button } from '~/components/ui/button';

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [res, setRes] = useState<any>(null);
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const handleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { email, password });
      const token = res.data.token;
      const role = res.data.user.role.kode_role;

      await setAuthSession(token, role);
      setAuthToken(token);

      await new Promise((resolve) => setTimeout(resolve, 150));

      if (role === 'ADMIN') router.replace({ pathname: '/(admin)/dashboard' });
      else if (role === 'PENGURUS') router.replace({ pathname: '/(pengurus)/dashboard' });
      else router.replace({ pathname: '/(anggota)/dashboard' });
    } catch (e) {
      setError('Email atau kata sandi salah');
    } finally {
      setLoading(false);
    }
  };

  // Fungsi untuk membuka WhatsApp Admin
  const handleForgotPassword = async () => {
    const url = 'https://wa.me/6287780916272';
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        // Fallback: coba buka dengan browser biasa
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Gagal membuka WhatsApp:', error);
      // Bisa tambahkan alert atau pesan error di UI jika diperlukan
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        className="flex-1 bg-stone-50 dark:bg-stone-950"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-stone-800 px-6 pb-10 pt-16 dark:bg-stone-900">
          <TouchableOpacity
            onPress={handleBack}
            className="mb-8 h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Text className="text-white">←</Text>
          </TouchableOpacity>

          <View className="mb-5 h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2">
            <Image className="h-full w-full" source={require('../assets/images/logo.png')} />
          </View>

          <Text className="text-2xl font-bold text-white">Selamat Datang</Text>
          <Text className="mt-1 text-sm text-stone-300">Silakan masuk untuk melanjutkan</Text>
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
              EMAIL
            </Text>
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="nama@email.com"
              placeholderTextColor="#a8a29e"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              KATA SANDI
            </Text>
            <View className="mb-2 flex-row items-center rounded-xl border border-stone-200 bg-stone-50 pr-3 dark:border-stone-700 dark:bg-stone-800">
              <TextInput
                className="flex-1 px-4 py-3 text-sm text-stone-800 dark:text-stone-100"
                placeholder="Kata sandi"
                placeholderTextColor="#a8a29e"
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mb-5 items-end">
              <TouchableOpacity onPress={handleForgotPassword}>
                <Text className="text-xs font-medium text-stone-500 dark:text-stone-400">
                  Lupa kata sandi?
                </Text>
              </TouchableOpacity>
            </View>

            <Button
              className="w-full bg-amber-700 active:opacity-90"
              size="lg"
              onPress={handleLogin}
              disabled={loading}>
              <Text className="font-semibold text-white">{loading ? 'Memproses...' : 'Masuk'}</Text>
            </Button>
          </View>

          {/* Daftar Link */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-stone-500 dark:text-stone-400">Belum punya akun? </Text>
            <TouchableOpacity onPress={() => router.push('/register')}>
              <Text className="text-sm font-semibold text-amber-700 dark:text-amber-500">
                Daftar
              </Text>
            </TouchableOpacity>
          </View>

          {/* Cek Anggota Link */}
          <View className="mt-4 flex-row justify-center">
            <TouchableOpacity onPress={() => router.push('/cek-anggota')}>
              <Text className="text-sm text-stone-400 underline underline-offset-2 dark:text-stone-600">
                Cek Data Keanggotaan
              </Text>
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
    </KeyboardAvoidingView>
  );
}
