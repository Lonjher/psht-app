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
} from 'react-native';
import { router } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '../services/api';
import { Button } from '~/components/ui/button';

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  no_hp: string;
}

export default function Register() {
  const [form, setForm] = useState<RegisterForm>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    jenis_kelamin: '',
    tanggal_lahir: '',
    alamat: '',
    no_hp: '',
  });
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const [showDatePicker, setShowDatePicker] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        setForm((prev) => ({ ...prev, tanggal_lahir: selectedDate.toISOString().split('T')[0] }));
      }
    } else {
      if (selectedDate) {
        setForm((prev) => ({ ...prev, tanggal_lahir: selectedDate.toISOString().split('T')[0] }));
      }
    }
  };

  const handleRegister = async () => {
    setError('');

    // Validasi field kosong
    const requiredFields = [
      form.name.trim(),
      form.email.trim(),
      form.password,
      form.password_confirmation,
      form.jenis_kelamin,
      form.tanggal_lahir,
      form.alamat.trim(),
      form.no_hp.trim(),
    ];
    if (requiredFields.some((field) => !field)) {
      setError('Semua kolom wajib diisi.');
      return;
    }

    // Validasi format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError('Format email tidak valid.');
      return;
    }

    // Validasi panjang password
    if (form.password.length < 8) {
      setError('Kata sandi minimal 8 karakter.');
      return;
    }

    // Validasi kecocokan password
    if (form.password !== form.password_confirmation) {
      setError('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setLoading(true);
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

            {/* Nama Lengkap */}
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

            {/* Jenis Kelamin */}
            <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              JENIS KELAMIN
            </Text>
            <View className="mb-4 flex-row gap-2">
              <TouchableOpacity
                onPress={() => setForm({ ...form, jenis_kelamin: 'Laki-Laki' })}
                className={`flex-1 rounded-xl border px-4 py-3 ${
                  form.jenis_kelamin === 'Laki-Laki'
                    ? 'border-amber-700 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                }`}>
                <Text
                  className={`text-center text-sm ${
                    form.jenis_kelamin === 'Laki-Laki'
                      ? 'font-semibold text-amber-700 dark:text-amber-500'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}>
                  Laki-Laki
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setForm({ ...form, jenis_kelamin: 'Perempuan' })}
                className={`flex-1 rounded-xl border px-4 py-3 ${
                  form.jenis_kelamin === 'Perempuan'
                    ? 'border-amber-700 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                }`}>
                <Text
                  className={`text-center text-sm ${
                    form.jenis_kelamin === 'Perempuan'
                      ? 'font-semibold text-amber-700 dark:text-amber-500'
                      : 'text-stone-500 dark:text-stone-400'
                  }`}>
                  Perempuan
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tanggal Lahir */}
            <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              TANGGAL LAHIR
            </Text>
            <TouchableOpacity
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
              onPress={() => setShowDatePicker(true)}>
              <Text
                className={`text-sm ${
                  form.tanggal_lahir ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                }`}>
                {form.tanggal_lahir || 'Pilih tanggal lahir'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={form.tanggal_lahir ? new Date(form.tanggal_lahir) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}

            {/* Alamat */}
            <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              ALAMAT
            </Text>
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="Alamat lengkap"
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={{ minHeight: 60 }}
              value={form.alamat}
              onChangeText={(text) => setForm({ ...form, alamat: text })}
            />

            {/* No HP */}
            <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
              NO. HP
            </Text>
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#a8a29e"
              keyboardType="phone-pad"
              value={form.no_hp}
              onChangeText={(text) => setForm({ ...form, no_hp: text })}
            />

            {/* Email */}
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

            {/* Kata Sandi */}
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

            {/* Konfirmasi Kata Sandi */}
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
              <Text className="font-semibold text-white">
                {loading ? 'Memproses...' : 'Daftar'}
              </Text>
            </Button>
          </View>

          {/* Masuk Link */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-sm text-stone-500 dark:text-stone-400">Sudah punya akun? </Text>
            <TouchableOpacity onPress={() => router.replace({ pathname: '/login' })}>
              <Text className="text-sm font-semibold text-amber-700 dark:text-amber-500">
                Masuk
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
