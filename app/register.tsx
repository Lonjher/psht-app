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

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  jenis_kelamin?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[0-9]{9,13}$/;

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, tanggal_lahir: formattedDate }));
        // Clear error jika sudah diisi
        setFieldErrors((prev) => ({ ...prev, tanggal_lahir: undefined }));
      }
    } else {
      if (selectedDate) {
        const formattedDate = selectedDate.toISOString().split('T')[0];
        setForm((prev) => ({ ...prev, tanggal_lahir: formattedDate }));
        setFieldErrors((prev) => ({ ...prev, tanggal_lahir: undefined }));
      }
    }
  };

  // Validasi per field
  const validateField = (field: keyof RegisterForm, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Nama lengkap wajib diisi';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        if (value.trim().length > 255) return 'Nama maksimal 255 karakter';
        return undefined;

      case 'email':
        if (!value.trim()) return 'Email wajib diisi';
        if (!EMAIL_REGEX.test(value.trim())) return 'Format email tidak valid';
        return undefined;

      case 'password':
        if (!value) return 'Kata sandi wajib diisi';
        if (value.length < 8) return 'Kata sandi minimal 8 karakter';
        if (value.length > 255) return 'Kata sandi maksimal 255 karakter';
        if (!/[A-Z]/.test(value)) return 'Kata sandi harus mengandung huruf kapital';
        if (!/[a-z]/.test(value)) return 'Kata sandi harus mengandung huruf kecil';
        if (!/[0-9]/.test(value)) return 'Kata sandi harus mengandung angka';
        return undefined;

      case 'password_confirmation':
        if (!value) return 'Konfirmasi kata sandi wajib diisi';
        if (value !== form.password) return 'Konfirmasi kata sandi tidak cocok';
        return undefined;

      case 'jenis_kelamin':
        if (!value) return 'Jenis kelamin wajib dipilih';
        return undefined;

      case 'tanggal_lahir':
        if (!value) return 'Tanggal lahir wajib diisi';
        
        // Validasi umur minimal 5 tahun dan maksimal 100 tahun
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 5) return 'Umur minimal 5 tahun';
        if (age > 100) return 'Umur maksimal 100 tahun';
        return undefined;

      case 'alamat':
        if (!value.trim()) return 'Alamat wajib diisi';
        if (value.trim().length < 10) return 'Alamat minimal 10 karakter';
        if (value.trim().length > 500) return 'Alamat maksimal 500 karakter';
        return undefined;

      case 'no_hp':
        if (!value.trim()) return 'Nomor HP wajib diisi';
        if (!PHONE_REGEX.test(value.trim())) return 'Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)';
        return undefined;

      default:
        return undefined;
    }
  };

  // Handler untuk update field dengan validasi
  const handleFieldChange = (field: keyof RegisterForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    // Validasi field yang berubah
    const error = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    
    // Jika password berubah, validasi ulang konfirmasi password
    if (field === 'password' && form.password_confirmation) {
      const confirmError = validateField('password_confirmation', form.password_confirmation);
      setFieldErrors((prev) => ({ ...prev, password_confirmation: confirmError }));
    }
  };

  // Validasi semua field
  const validateAllFields = (): FieldErrors => {
    const errors: FieldErrors = {};
    
    (Object.keys(form) as Array<keyof RegisterForm>).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    return errors;
  };

  const handleRegister = async () => {
    setError('');
    
    // Validasi semua field
    const errors = validateAllFields();
    setFieldErrors(errors);
    
    // Cek jika ada error
    if (Object.keys(errors).length > 0) {
      setError('Periksa kembali kolom yang ditandai merah');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
        jenis_kelamin: form.jenis_kelamin,
        tanggal_lahir: form.tanggal_lahir,
        alamat: form.alamat.trim(),
        no_hp: form.no_hp.trim(),
      };
      
      await api.post('/register', payload);
      setSuccess(true);
    } catch (e: any) {
      console.error('Register error:', e);
      
      // Handle error dari backend
      const serverErrors = e.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const mappedErrors: FieldErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          const value = serverErrors[key];
          const message = Array.isArray(value) ? value[0] : String(value);
          if (key in form) {
            mappedErrors[key as keyof RegisterForm] = message;
          }
        });
        setFieldErrors(mappedErrors);
        setError('Pendaftaran gagal. Periksa kembali data Anda.');
      } else {
        setError(e.response?.data?.message ?? 'Pendaftaran gagal. Periksa kembali data Anda.');
      }
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
            <FieldLabel text="NAMA LENGKAP" />
            <TextInput
              className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${
                fieldErrors.name
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}
              placeholder="Nama lengkap"
              placeholderTextColor="#a8a29e"
              value={form.name}
              onChangeText={(text) => handleFieldChange('name', text)}
            />
            <FieldErrorText message={fieldErrors.name} />

            {/* Jenis Kelamin */}
            <FieldLabel text="JENIS KELAMIN" />
            <View className="mb-1 flex-row gap-2">
              <TouchableOpacity
                onPress={() => handleFieldChange('jenis_kelamin', 'Laki-Laki')}
                className={`flex-1 rounded-xl border px-4 py-3 ${
                  form.jenis_kelamin === 'Laki-Laki'
                    ? 'border-amber-700 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                    : fieldErrors.jenis_kelamin
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
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
                onPress={() => handleFieldChange('jenis_kelamin', 'Perempuan')}
                className={`flex-1 rounded-xl border px-4 py-3 ${
                  form.jenis_kelamin === 'Perempuan'
                    ? 'border-amber-700 bg-amber-50 dark:border-amber-500 dark:bg-amber-900/20'
                    : fieldErrors.jenis_kelamin
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
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
            <FieldErrorText message={fieldErrors.jenis_kelamin} />

            {/* Tanggal Lahir */}
            <FieldLabel text="TANGGAL LAHIR" />
            <TouchableOpacity
              className={`mb-1 rounded-xl border px-4 py-3 ${
                fieldErrors.tanggal_lahir
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}
              onPress={() => setShowDatePicker(true)}>
              <Text
                className={`text-sm ${
                  form.tanggal_lahir ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                }`}>
                {form.tanggal_lahir || 'Pilih tanggal lahir'}
              </Text>
            </TouchableOpacity>
            <FieldErrorText message={fieldErrors.tanggal_lahir} />
            {showDatePicker && (
              <DateTimePicker
                value={form.tanggal_lahir ? new Date(form.tanggal_lahir) : new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}

            {/* Alamat */}
            <FieldLabel text="ALAMAT LENGKAP" />
            <TextInput
              className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${
                fieldErrors.alamat
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}
              placeholder="Alamat lengkap"
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={{ minHeight: 60 }}
              value={form.alamat}
              onChangeText={(text) => handleFieldChange('alamat', text)}
            />
            <FieldErrorText message={fieldErrors.alamat} />

            {/* No HP */}
            <FieldLabel text="NO. HP" />
            <TextInput
              className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${
                fieldErrors.no_hp
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#a8a29e"
              keyboardType="phone-pad"
              value={form.no_hp}
              onChangeText={(text) => handleFieldChange('no_hp', text)}
              maxLength={14}
            />
            <FieldErrorText message={fieldErrors.no_hp} />

            {/* Email */}
            <FieldLabel text="EMAIL" />
            <TextInput
              className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${
                fieldErrors.email
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}
              placeholder="nama@email.com"
              placeholderTextColor="#a8a29e"
              value={form.email}
              onChangeText={(text) => handleFieldChange('email', text)}
              autoCapitalize="none"
              keyboardType="email-address"
            />
            <FieldErrorText message={fieldErrors.email} />

            {/* Kata Sandi */}
            <FieldLabel text="KATA SANDI" />
            <View
              className={`mb-1 flex-row items-center rounded-xl border pr-3 ${
                fieldErrors.password
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}>
              <TextInput
                className="flex-1 px-4 py-3 text-sm text-stone-800 dark:text-stone-100"
                placeholder="Minimal 8 karakter"
                placeholderTextColor="#a8a29e"
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={(text) => handleFieldChange('password', text)}
              />
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                  {showPassword ? 'Sembunyikan' : 'Lihat'}
                </Text>
              </TouchableOpacity>
            </View>
            <FieldErrorText message={fieldErrors.password} />

            {/* Konfirmasi Kata Sandi */}
            <FieldLabel text="KONFIRMASI KATA SANDI" />
            <View
              className={`mb-1 flex-row items-center rounded-xl border pr-3 ${
                fieldErrors.password_confirmation
                  ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                  : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
              }`}>
              <TextInput
                className="flex-1 px-4 py-3 text-sm text-stone-800 dark:text-stone-100"
                placeholder="Ulangi kata sandi"
                placeholderTextColor="#a8a29e"
                secureTextEntry={!showConfirm}
                value={form.password_confirmation}
                onChangeText={(text) => handleFieldChange('password_confirmation', text)}
                onSubmitEditing={handleRegister}
              />
              <TouchableOpacity onPress={() => setShowConfirm((v) => !v)}>
                <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                  {showConfirm ? 'Sembunyikan' : 'Lihat'}
                </Text>
              </TouchableOpacity>
            </View>
            <FieldErrorText message={fieldErrors.password_confirmation} />

            <Button
              className="mt-4 w-full bg-amber-700 active:opacity-90"
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

// Helper components
function FieldLabel({ text }: { text: string }) {
  return (
    <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">{text}</Text>
  );
}

function FieldErrorText({ message }: { message?: string }) {
  if (!message) return <View className="mb-4" />;
  return (
    <Text className="mb-4 mt-1 text-xs text-red-600 dark:text-red-400">
      {message}
    </Text>
  );
}