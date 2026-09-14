import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
  Linking,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { setAuthSession, setAuthToken, hydrateAuthSession } from '@/services/authStore';
import api from '../services/api';
import { Button } from '~/components/ui/button';
import Ionicons from '@expo/vector-icons/Ionicons';

interface RejectedInfo {
  email: string;
  alasan_penolakan: string;
  name?: string;
}

export default function Login() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);
  const [rejectedInfo, setRejectedInfo] = useState<RejectedInfo | null>(null);
  const [forgotModalVisible, setForgotModalVisible] = useState<boolean>(false);

  // Fungsi untuk redirect ke dashboard sesuai role
  const redirectToDashboard = (role: string) => {
    if (role === 'ADMIN') {
      router.replace('/(admin)/dashboard');
    } else if (role === 'PENGURUS') {
      router.replace('/(pengurus)/dashboard');
    } else if (role === 'ANGGOTA') {
      router.replace('/(anggota)/dashboard');
    } else {
      router.replace('/');
    }
  };

  // Cek session saat halaman fokus
  useFocusEffect(
    useCallback(() => {
      setCheckingSession(true);

      const checkSession = async () => {
        try {
          const auth = await hydrateAuthSession();

          if (auth.token && auth.role) {
            redirectToDashboard(auth.role);
            return;
          }
        } catch (error) {
          console.error('Error checking session:', error);
        } finally {
          setCheckingSession(false);
        }
      };

      checkSession();
    }, [])
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const handleLogin = async () => {
    // Reset state
    setRejectedInfo(null);

    // Validasi input
    if (!email.trim()) {
      setError('Email wajib diisi');
      return;
    }

    if (!password) {
      setError('Kata sandi wajib diisi');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await api.post('/login', { email: email.trim(), password });
      const token = res.data.token;
      const role = res.data.user.role.kode_role;

      await setAuthSession(token, role);
      setAuthToken(token);

      await new Promise((resolve) => setTimeout(resolve, 150));

      redirectToDashboard(role);
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;

      // Cek jika akun nonaktif (403) dan ada alasan penolakan
      if (status === 403) {
        const alasan = data?.alasan_penolakan;
        if (alasan) {
          setRejectedInfo({
            email: data?.email ?? email.trim(),
            alasan_penolakan: alasan,
            name: data?.name,
          });
          setError('');
        } else {
          setError(data?.message ?? 'Akun Anda belum disetujui atau telah dinonaktifkan');
        }
      } else if (status === 422) {
        const serverErrors = data?.errors;
        if (serverErrors?.email) {
          setError(serverErrors.email[0]);
        } else if (serverErrors?.password) {
          setError(serverErrors.password[0]);
        } else {
          setError('Email atau kata sandi salah');
        }
      } else if (status === 401) {
        setError('Email atau kata sandi salah');
      } else {
        setError('Terjadi kesalahan, silakan coba lagi');
      }
    } finally {
      setLoading(false);
    }
  };

  // Buka modal lupa password
  const handleForgotPassword = () => {
    setForgotModalVisible(true);
  };

  // Hubungi Admin via WhatsApp (untuk lupa password)
  const handleContactAdminForgot = async () => {
    const message = encodeURIComponent(
      `Halo Admin,\n\nSaya lupa kata sandi akun saya${email.trim() ? ` dengan email: ${email.trim()}` : ''}.\n\nMohon bantuannya untuk mereset kata sandi saya. Terima kasih.`
    );
    const url = `https://wa.me/6287780916272?text=${message}`;

    try {
      await Linking.openURL(url);
      setForgotModalVisible(false);
    } catch (error) {
      console.error('Gagal membuka WhatsApp:', error);
    }
  };

  // Handle hubungi admin dengan alasan penolakan
  const handleContactAdmin = async () => {
    if (!rejectedInfo) return;

    const message = encodeURIComponent(
      `Halo Admin,\n\nSaya ingin menanyakan terkait pendaftaran akun saya.\n\nEmail: ${rejectedInfo.email}${rejectedInfo.name ? `\nNama: ${rejectedInfo.name}` : ''}\n\nStatus: Ditolak\nAlasan: ${rejectedInfo.alasan_penolakan}\n\nMohon bantuannya. Terima kasih.`
    );
    const url = `https://wa.me/6287780916272?text=${message}`;

    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Gagal membuka WhatsApp:', error);
    }
  };

  // Tampilkan loading saat cek session
  if (checkingSession) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  return (
    <>
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
            {/* Info Akun Ditolak */}
            {rejectedInfo && (
              <View className="-mt-5 mb-4 rounded-2xl border border-red-200 bg-red-50 p-5 shadow-sm shadow-stone-300 dark:border-red-900/40 dark:bg-red-950/30 dark:shadow-none">
                <View className="mb-3 flex-row items-center gap-3">
                  <View className="h-10 w-10 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                    <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-red-800 dark:text-red-400">
                      Pendaftaran Ditolak
                    </Text>
                    <Text className="mt-0.5 text-xs text-red-600/80 dark:text-red-400/70">
                      Akun Anda tidak dapat digunakan
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setRejectedInfo(null)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <Ionicons name="close" size={18} color="#dc2626" />
                  </TouchableOpacity>
                </View>

                <View className="rounded-xl bg-white/70 p-3 dark:bg-stone-900/50">
                  <View className="mb-1.5 flex-row items-center gap-1.5">
                    <Ionicons name="information-circle-outline" size={12} color="#dc2626" />
                    <Text className="text-[10px] font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                      Alasan Penolakan
                    </Text>
                  </View>
                  <Text className="text-sm leading-5 text-red-800 dark:text-red-300">
                    {rejectedInfo.alasan_penolakan}
                  </Text>
                </View>

                <TouchableOpacity
                  className="mt-3 flex-row items-center justify-center gap-2 rounded-xl bg-red-600 py-3 active:opacity-90"
                  onPress={handleContactAdmin}
                  activeOpacity={0.8}>
                  <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                  <Text className="text-sm font-semibold text-white">Hubungi Admin</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Form Login */}
            <View className={`${rejectedInfo ? '' : '-mt-5'} rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none`}>
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
                onChangeText={(t) => {
                  setEmail(t);
                  if (rejectedInfo) setRejectedInfo(null);
                }}
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

      {/* Modal Lupa Password */}
      <Modal
        visible={forgotModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setForgotModalVisible(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-5">
          <View className="w-full rounded-2xl border border-stone-200 bg-white p-5 dark:border-stone-800 dark:bg-stone-900">
            {/* Header Modal */}
            <View className="mb-4 items-center">
              <View className="mb-3 h-14 w-14 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                <Ionicons name="key-outline" size={26} color="#b45309" />
              </View>
              <Text className="text-base font-bold text-stone-800 dark:text-stone-100">
                Lupa Kata Sandi?
              </Text>
              <Text className="mt-1 text-center text-xs leading-5 text-stone-500 dark:text-stone-400">
                Untuk mereset kata sandi, silakan hubungi admin melalui WhatsApp dengan menyertakan email akun Anda.
              </Text>
            </View>

            {/* Info Default Password */}
            <View className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
              <View className="mb-1.5 flex-row items-center gap-1.5">
                <Ionicons name="information-circle-outline" size={14} color="#b45309" />
                <Text className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-500">
                  Informasi
                </Text>
              </View>
              <Text className="text-xs leading-5 text-amber-800 dark:text-amber-300">
                Kata sandi default adalah <Text className="font-bold">tanggal lahir</Text> Anda dengan format{' '}
                <Text className="font-bold">DDMMYYYY</Text>.
              </Text>
              <Text className="mt-1.5 text-xs leading-5 text-amber-800 dark:text-amber-300">
                Contoh: lahir 5 Januari 2000 → <Text className="font-bold">05012000</Text>
              </Text>
            </View>

            {/* Email Input (opsional) */}
            <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              EMAIL (OPSIONAL)
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

            {/* Tombol Aksi */}
            <View className="flex-row gap-3">
              <TouchableOpacity
                className="flex-1 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 py-3.5 dark:border-stone-700 dark:bg-stone-800"
                onPress={() => setForgotModalVisible(false)}
                activeOpacity={0.7}>
                <Text className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                  Batal
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-green-600 py-3.5 active:opacity-90"
                onPress={handleContactAdminForgot}
                activeOpacity={0.7}>
                <Ionicons name="logo-whatsapp" size={16} color="#ffffff" />
                <Text className="text-sm font-semibold text-white">
                  Hubungi Admin
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}