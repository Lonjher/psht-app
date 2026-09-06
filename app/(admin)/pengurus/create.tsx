import { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/Alert';

interface PengurusForm {
  name: string;
  no_hp: string;
  email: string;
  password: string;
  tanggal_lahir: string;
  alamat: string;
}

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  tanggal_lahir?: string;
  alamat?: string;
  no_hp?: string;
}

interface AlertState {
  visible: boolean;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^0[0-9]{9,13}$/;

export default function CreatePengurus() {
  const [form, setForm] = useState<PengurusForm>({
    name: '',
    no_hp: '',
    email: '',
    password: '',
    tanggal_lahir: '',
    alamat: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // Reset form function
  const resetForm = useCallback(() => {
    setForm({
      name: '',
      no_hp: '',
      email: '',
      password: '',
      tanggal_lahir: '',
      alamat: '',
    });
    setFieldErrors({});
    setShowPassword(false);
    setShowDatePicker(false);
    setLoading(false);
    setAlertState({ visible: false, variant: 'info', title: '', description: '' });
  }, []);

  // Reset form setiap kali halaman mendapat fokus
  useFocusEffect(
    useCallback(() => {
      resetForm();
    }, [resetForm])
  );

  // Validasi per field
  const validateField = (field: keyof PengurusForm, value: string): string | undefined => {
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
        if (!value) return 'Password wajib diisi';
        if (value.length < 8) return 'Password minimal 8 karakter';
        if (value.length > 255) return 'Password maksimal 255 karakter';
        if (!/[A-Z]/.test(value)) return 'Password harus mengandung huruf kapital';
        if (!/[a-z]/.test(value)) return 'Password harus mengandung huruf kecil';
        if (!/[0-9]/.test(value)) return 'Password harus mengandung angka';
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
        
        if (age < 17) return 'Umur minimal 17 tahun';
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
  const handleFieldChange = (field: keyof PengurusForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    
    const error = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Validasi semua field
  const validateAllFields = (): FieldErrors => {
    const errors: FieldErrors = {};
    
    (Object.keys(form) as Array<keyof PengurusForm>).forEach((field) => {
      const error = validateField(field, form[field]);
      if (error) {
        errors[field] = error;
      }
    });
    
    return errors;
  };

  // Handler khusus untuk onValueChange
  const onValueChange = (event: any) => {
    console.log('onValueChange event:', event);
    
    let dateToUse: Date | undefined;
    
    if (event instanceof Date) {
      dateToUse = event;
    } 
    else if (event?.nativeEvent?.timestamp) {
      dateToUse = new Date(event.nativeEvent.timestamp);
    }
    else if (event?.timestamp) {
      dateToUse = new Date(event.timestamp);
    }
    
    console.log('Date to use:', dateToUse);
    
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (dateToUse) {
      const year = dateToUse.getFullYear();
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const day = String(dateToUse.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      console.log('Formatted date:', formattedDate);
      handleFieldChange('tanggal_lahir', formattedDate);
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
      await api.post('/pengurus', {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        no_hp: form.no_hp.trim(),
        tanggal_lahir: form.tanggal_lahir,
        alamat: form.alamat.trim(),
      });
      
      showAlert('success', 'Berhasil', 'Pengurus baru berhasil ditambahkan');
      
      setTimeout(() => {
        resetForm();
        router.replace('/pengurus');
      }, 1500);
    } catch (e: any) {
      console.error('Error saving:', e);
      
      const serverErrors = e.response?.data?.errors;
      if (serverErrors && typeof serverErrors === 'object') {
        const mappedErrors: FieldErrors = {};
        Object.keys(serverErrors).forEach((key) => {
          const value = serverErrors[key];
          const message = Array.isArray(value) ? value[0] : String(value);
          if (key in form) {
            mappedErrors[key as keyof FieldErrors] = message;
          }
        });
        setFieldErrors(mappedErrors);
      }
      
      showAlert('error', 'Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
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
              onPress={() => router.replace('/pengurus')}
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
              {/* Nama Lengkap */}
              <FieldLabel text="NAMA LENGKAP" />
              <TextInput
                className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${
                  fieldErrors.name
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                }`}
                placeholder="Nama pengurus"
                placeholderTextColor="#a8a29e"
                value={form.name}
                onChangeText={(t) => handleFieldChange('name', t)}
              />
              <FieldErrorText message={fieldErrors.name} />

              {/* Tanggal Lahir */}
              <FieldLabel text="TANGGAL LAHIR" />
              <TouchableOpacity
                className={`mb-1 rounded-xl border px-4 py-3 ${
                  fieldErrors.tanggal_lahir
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                }`}
                onPress={() => {
                  console.log('Opening date picker...');
                  setShowDatePicker(true);
                }}>
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm ${
                      form.tanggal_lahir
                        ? 'text-stone-800 dark:text-stone-100'
                        : 'text-stone-400'
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
                    onValueChange={onValueChange}
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

              {/* Alamat Lengkap */}
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
                onChangeText={(t) => handleFieldChange('alamat', t)}
              />
              <FieldErrorText message={fieldErrors.alamat} />

              {/* No HP */}
              <FieldLabel text="NO HP" />
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
                onChangeText={(t) => handleFieldChange('no_hp', t)}
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
                onChangeText={(t) => handleFieldChange('email', t)}
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
                  onChangeText={(t) => handleFieldChange('password', t)}
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
                  {loading ? 'Menyimpan...' : 'Simpan Pengurus'}
                </Text>
              </Button>
            </View>
          </View>
        </ScrollView>

        {/* Alert Modal */}
        <Alert
          visible={alertState.visible}
          variant={alertState.variant}
          title={alertState.title}
          description={alertState.description}
          onClose={hideAlert}
        />
      </KeyboardAvoidingView>
    </>
  );
}

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