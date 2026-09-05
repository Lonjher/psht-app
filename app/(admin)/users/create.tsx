// app/(admin)/users/create.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/Alert';

const generateNomorAnggota = (existingNumbers: string[]): string => {
  const numbers = existingNumbers
    .map((num) => {
      const match = num.match(/PSHT-(\d+)/);
      return match ? parseInt(match[1], 10) : 0;
    })
    .filter((n) => !isNaN(n));

  const nextNumber = (Math.max(...numbers, 0) + 1).toString().padStart(6, '0');
  return `PSHT-${nextNumber}`;
};

type FormState = {
  nomor_anggota: string;
  name: string;
  jenis_kelamin: string;
  tanggal_lahir: string;
  alamat: string;
  no_hp: string;
  email: string;
  password: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;

interface AlertState {
  visible: boolean;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[0-9]{9,13}$/;

export default function CreateUser() {
  const [form, setForm] = useState<FormState>({
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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    variant: 'info',
    title: '',
    description: '',
  });
  const isDark = useColorScheme() === 'dark';

  const showAlert = (
    variant: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string
  ) => {
    setAlertState({ visible: true, variant, title, description });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  // Validasi per field
  const validateField = (field: keyof FormState, value: string): string | undefined => {
    switch (field) {
      case 'name':
        if (!value.trim()) return 'Nama lengkap wajib diisi';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        if (value.trim().length > 255) return 'Nama maksimal 255 karakter';
        return undefined;

      case 'jenis_kelamin':
        if (!value) return 'Jenis kelamin wajib dipilih';
        return undefined;

      case 'tanggal_lahir':
        if (!value) return 'Tanggal lahir wajib diisi';
        
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

      case 'email':
        if (!value.trim()) return 'Email wajib diisi';
        if (!EMAIL_REGEX.test(value.trim())) return 'Format email tidak valid';
        return undefined;

      case 'password':
        if (!value) return 'Password wajib diisi';
        if (value.length < 8) return 'Password minimal 8 karakter';
        if (value.length > 255) return 'Password maksimal 255 karakter';
        if (!/[A-Z]/.test(value)) return 'Password harus mengandung huruf kapital';
        if (!/[a-z]/.test(value)) return 'Password harus mengandung huruf kecil';
        if (!/[0-9]/.test(value)) return 'Password harus mengandung angka';
        return undefined;

      default:
        return undefined;
    }
  };

  // Handler untuk update field dengan validasi real-time
  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    const error = validateField(key, value);
    setFieldErrors((prev) => ({ ...prev, [key]: error }));
  };

  // Validasi semua field
  const validateAllFields = (): FieldErrors => {
    const errors: FieldErrors = {};
    
    (Object.keys(form) as Array<keyof FormState>).forEach((field) => {
      if (field === 'nomor_anggota') return; // Skip nomor_anggota
      const error = validateField(field, form[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    return errors;
  };

  // Mapping error dari backend
  const mapServerErrors = (data: any): FieldErrors => {
    const mapped: FieldErrors = {};
    const rawErrors = data?.errors;

    if (rawErrors && typeof rawErrors === 'object') {
      Object.keys(rawErrors).forEach((key) => {
        const value = rawErrors[key];
        const message = Array.isArray(value) ? value[0] : String(value);
        if (key in form) {
          mapped[key as keyof FormState] = message;
        }
      });
    }

    return mapped;
  };

  const generateNumber = async () => {
    try {
      const res = await api.get('/users');
      const existingNumbers = (res.data as any[])
        .map((user) => user.nomor_anggota)
        .filter((num) => num && typeof num === 'string');
      const newNumber = generateNomorAnggota(existingNumbers);
      setForm((prev) => ({ ...prev, nomor_anggota: newNumber }));
    } catch (error) {
      const timestamp = Date.now().toString().slice(-6);
      setForm((prev) => ({ ...prev, nomor_anggota: `PSHT-${timestamp}` }));
    }
  };

  useEffect(() => {
    generateNumber();
  }, []);

  // Handler untuk DatePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    let dateToUse: Date | undefined;

    if (selectedDate instanceof Date) {
      dateToUse = selectedDate;
    } else if (event instanceof Date) {
      dateToUse = event;
    } else if (event?.nativeEvent?.timestamp) {
      dateToUse = new Date(event.nativeEvent.timestamp);
    } else if (event?.timestamp) {
      dateToUse = new Date(event.timestamp);
    }

    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (dateToUse) {
      const year = dateToUse.getFullYear();
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const day = String(dateToUse.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      updateField('tanggal_lahir', formattedDate);
    }
  };

  const handleSave = async () => {
    const errors = validateAllFields();
    setFieldErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      showAlert('warning', 'Data Belum Lengkap', 'Periksa kembali kolom yang ditandai merah');
      return;
    }

    setLoading(true);
    try {
      await api.post('/users', {
        ...form,
        name: form.name.trim(),
        email: form.email.trim(),
        alamat: form.alamat.trim(),
        no_hp: form.no_hp.trim(),
      });
      
      showAlert('success', 'Berhasil', 'Anggota baru berhasil ditambahkan');
      
      setTimeout(() => {
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
        setFieldErrors({});
        
        if (router.canGoBack()) {
          router.back();
        } else {
          router.replace('/users');
        }
        
        generateNumber();
      }, 1500);
    } catch (e: any) {
      console.error('Error saving:', e);
      
      const status = e?.response?.status;
      const data = e?.response?.data;

      if (status === 422 && data?.errors) {
        const serverErrors = mapServerErrors(data);
        setFieldErrors(serverErrors);
        showAlert('error', 'Validasi Gagal', 'Periksa kembali kolom yang ditandai merah');
      } else {
        showAlert('error', 'Gagal', data?.message ?? 'Terjadi kesalahan, silakan coba lagi');
      }
    } finally {
      setLoading(false);
    }
  };

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
          <View className="bg-stone-800 px-5 pb-8 pt-14 dark:bg-stone-900">
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }
                router.replace('/users');
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
              {/* Nomor Anggota */}
              <FieldLabel text="NO. ANGGOTA" />
              <TextInput
                className="mb-4 rounded-xl border border-stone-200 bg-stone-100 px-4 py-3 text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-700 dark:text-stone-300"
                placeholder="PSHT-000001"
                placeholderTextColor="#a8a29e"
                autoCapitalize="characters"
                editable={false}
                value={form.nomor_anggota}
              />

              {/* Nama Lengkap */}
              <FieldLabel text="NAMA LENGKAP" />
              <TextInput
                className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${
                  fieldErrors.name
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                }`}
                placeholder="Nama anggota"
                placeholderTextColor="#a8a29e"
                value={form.name}
                onChangeText={(t) => updateField('name', t)}
              />
              <FieldErrorText message={fieldErrors.name} />

              {/* Jenis Kelamin */}
              <FieldLabel text="JENIS KELAMIN" />
              <View
                className={`mb-1 overflow-hidden rounded-xl border ${
                  fieldErrors.jenis_kelamin
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                }`}>
                <TouchableOpacity
                  className="flex-row items-center justify-between px-4 py-3"
                  onPress={() =>
                    updateField(
                      'jenis_kelamin',
                      form.jenis_kelamin === 'Laki-Laki' ? 'Perempuan' : 'Laki-Laki'
                    )
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
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm ${
                      form.tanggal_lahir ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                    }`}>
                    {form.tanggal_lahir || 'Pilih tanggal lahir'}
                  </Text>
                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={isDark ? '#a8a29e' : '#78716c'}
                  />
                </View>
              </TouchableOpacity>
              <FieldErrorText message={fieldErrors.tanggal_lahir} />
              
              {showDatePicker && (
                <View>
                  <DateTimePicker
                    value={
                      form.tanggal_lahir
                        ? new Date(form.tanggal_lahir + 'T00:00:00')
                        : new Date()
                    }
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={onDateChange}
                  />
                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      className="mt-2 rounded-lg bg-stone-200 py-2 dark:bg-stone-700"
                      onPress={() => setShowDatePicker(false)}>
                      <Text className="text-center text-sm font-medium text-stone-800 dark:text-stone-100">
                        Selesai
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
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
                onChangeText={(t) => updateField('alamat', t)}
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
                maxLength={14}
                value={form.no_hp}
                onChangeText={(t) => updateField('no_hp', t)}
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
                autoCapitalize="none"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(t) => updateField('email', t)}
              />
              <FieldErrorText message={fieldErrors.email} />

              {/* Password */}
              <FieldLabel text="PASSWORD" />
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
                  onChangeText={(t) => updateField('password', t)}
                />
                <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                  <Text className="text-xs font-medium text-amber-700 dark:text-amber-500">
                    {showPassword ? 'Sembunyikan' : 'Lihat'}
                  </Text>
                </TouchableOpacity>
              </View>
              <FieldErrorText message={fieldErrors.password} />

              <Button
                className="mt-4 w-full bg-amber-700 active:opacity-90"
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

      {/* Alert Modal */}
      <Alert
        visible={alertState.visible}
        variant={alertState.variant}
        title={alertState.title}
        description={alertState.description}
        onClose={hideAlert}
      />
    </>
  );
}

function FieldLabel({ text, optional = false }: { text: string; optional?: boolean }) {
  return (
    <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
      {text} {optional && <Text className="text-stone-400 dark:text-stone-600">(opsional)</Text>}
    </Text>
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