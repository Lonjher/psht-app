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
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert'; // komponen Alert custom

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

  const [alert, setAlert] = useState<{
    type: 'success' | 'error';
    title: string;
    description?: string;
  } | null>(null);

  const showAlert = (type: 'success' | 'error', title: string, description?: string) => {
    setAlert({ type, title, description });
    setTimeout(() => setAlert(null), 4000);
  };

  // Update satu field sekaligus bersihkan error field itu
  const updateField = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (fieldErrors[key]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
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

  // Validasi ringan di sisi client sebelum hit API
  const validateClientSide = (): FieldErrors => {
    const errors: FieldErrors = {};

    if (!form.name.trim()) {
      errors.name = 'Nama lengkap wajib diisi';
    } else if (form.name.trim().length < 3) {
      errors.name = 'Nama minimal 3 karakter';
    }

    if (!form.jenis_kelamin) {
      errors.jenis_kelamin = 'Jenis kelamin wajib dipilih';
    }

    if (!form.tanggal_lahir) {
      errors.tanggal_lahir = 'Tanggal lahir wajib diisi';
    }

    if (!form.alamat.trim()) {
      errors.alamat = 'Alamat wajib diisi';
    }

    if (!form.no_hp.trim()) {
      errors.no_hp = 'Nomor HP wajib diisi';
    } else if (!PHONE_REGEX.test(form.no_hp.trim())) {
      errors.no_hp = 'Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)';
    }

    if (!form.email.trim()) {
      errors.email = 'Email wajib diisi';
    } else if (!EMAIL_REGEX.test(form.email.trim())) {
      errors.email = 'Format email tidak valid';
    }

    if (!form.password) {
      errors.password = 'Password wajib diisi';
    } else if (form.password.length < 8) {
      errors.password = 'Password minimal 8 karakter';
    }

    return errors;
  };

  // Mapping error dari backend (format Laravel: { errors: { field: string[] } })
  // sesuaikan key di sini kalau nama field backend berbeda dari form
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

  const handleSave = async () => {
    // Validasi client-side dulu, biar user langsung dapat feedback
    const clientErrors = validateClientSide();
    if (Object.keys(clientErrors).length > 0) {
      setFieldErrors(clientErrors);
      showAlert('error', 'Data belum lengkap', 'Periksa kembali kolom yang ditandai merah');
      return;
    }

    setFieldErrors({});
    setLoading(true);
    try {
      await api.post('/users', form);
      showAlert('success', 'Berhasil', 'Anggota baru ditambahkan');
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
      generateNumber();
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;

      if (status === 422 && data?.errors) {
        // Error validasi spesifik per field dari backend
        const serverErrors = mapServerErrors(data);
        setFieldErrors(serverErrors);

        const errorCount = Object.keys(serverErrors).length;
        showAlert(
          'error',
          'Validasi gagal',
          errorCount > 0
            ? `Periksa kembali ${errorCount} kolom yang ditandai merah`
            : (data?.message ?? 'Terjadi kesalahan validasi')
        );
      } else if (status === 409 || data?.message?.toLowerCase?.().includes('email')) {
        // Kasus umum: email/nomor sudah terdaftar
        setFieldErrors((prev) => ({ ...prev, email: data?.message ?? 'Email sudah terdaftar' }));
        showAlert('error', 'Gagal', data?.message ?? 'Email sudah terdaftar');
      } else {
        showAlert('error', 'Gagal', data?.message ?? 'Terjadi kesalahan, silakan coba lagi');
      }
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (selectedDate) {
        updateField('tanggal_lahir', selectedDate.toISOString().split('T')[0]);
      }
    } else {
      if (selectedDate) {
        updateField('tanggal_lahir', selectedDate.toISOString().split('T')[0]);
      }
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
            {alert && (
              <View className="mb-4">
                <Alert
                  variant={alert.type === 'success' ? 'success' : 'destructive'}
                  title={alert.title}
                  description={alert.description}
                  onClose={() => setAlert(null)}
                />
              </View>
            )}

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
            </View>

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
                onValueChange={onDateChange}
                onDismiss={() => setShowDatePicker(false)}
              />
            )}

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
              onChangeText={(t) => updateField('no_hp', t)}
            />
            <FieldErrorText message={fieldErrors.no_hp} />

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