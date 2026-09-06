import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/Alert';

interface TingkatanForm {
  nama_tingkatan: string;
  urutan: string;
  deskripsi: string;
}

interface FieldErrors {
  nama_tingkatan?: string;
  urutan?: string;
  deskripsi?: string;
}

interface AlertState {
  visible: boolean;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

export default function CreateTingkatan() {
  const [form, setForm] = useState<TingkatanForm>({
    nama_tingkatan: '',
    urutan: '',
    deskripsi: ''
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    variant: 'info',
    title: '',
    description: '',
  });

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
      nama_tingkatan: '',
      urutan: '',
      deskripsi: '',
    });
    setFieldErrors({});
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
  const validateField = (field: keyof TingkatanForm, value: string): string | undefined => {
    switch (field) {
      case 'nama_tingkatan':
        if (!value.trim()) return 'Nama tingkatan wajib diisi';
        if (value.trim().length < 3) return 'Nama minimal 3 karakter';
        if (value.trim().length > 255) return 'Nama maksimal 255 karakter';
        return undefined;

      case 'urutan':
        if (!value.trim()) return 'Urutan wajib diisi';
        const urutanNum = parseInt(value);
        if (isNaN(urutanNum)) return 'Urutan harus berupa angka';
        if (urutanNum < 1) return 'Urutan minimal 1';
        if (urutanNum > 100) return 'Urutan maksimal 100';
        return undefined;

      case 'deskripsi':
        if (value.trim().length > 500) return 'Deskripsi maksimal 500 karakter';
        return undefined;

      default:
        return undefined;
    }
  };

  // Handler untuk update field dengan validasi
  const handleFieldChange = (field: keyof TingkatanForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));

    const error = validateField(field, value);
    setFieldErrors((prev) => ({ ...prev, [field]: error }));
  };

  // Validasi semua field
  const validateAllFields = (): FieldErrors => {
    const errors: FieldErrors = {};

    (Object.keys(form) as Array<keyof TingkatanForm>).forEach((field) => {
      if (field === 'deskripsi') return; // Deskripsi opsional
      const error = validateField(field, form[field]);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
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
      await api.post('/tingkatan', {
        ...form,
        urutan: parseInt(form.urutan),
        nama_tingkatan: form.nama_tingkatan.trim(),
        deskripsi: form.deskripsi.trim(),
      });

      showAlert('success', 'Berhasil', 'Tingkatan berhasil ditambahkan');

      setTimeout(() => {
        resetForm();
        router.replace('/tingkatan');
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
              onPress={() => router.replace('/tingkatan')}
              className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="chevron-back" size={18} color="#ffffff" />
            </TouchableOpacity>

            <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
              <Ionicons name="layers-outline" size={20} color="#ffffff" />
            </View>

            <Text className="text-2xl font-bold text-white">Tambah Tingkatan</Text>
            <Text className="mt-1 text-sm text-stone-300">Lengkapi data tingkatan sabuk baru</Text>
          </View>

          {/* Form Card */}
          <View className="flex-1 px-5">
            <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
              {/* Nama Tingkatan */}
              <FieldLabel text="NAMA TINGKATAN" />
              <TextInput
                className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${fieldErrors.nama_tingkatan
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                  }`}
                placeholder="Contoh: Sabuk Polos"
                placeholderTextColor="#a8a29e"
                value={form.nama_tingkatan}
                onChangeText={(t) => handleFieldChange('nama_tingkatan', t)}
              />
              <FieldErrorText message={fieldErrors.nama_tingkatan} />

              {/* Urutan */}
              <FieldLabel text="URUTAN" />
              <TextInput
                className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${fieldErrors.urutan
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                  }`}
                placeholder="Contoh: 1"
                placeholderTextColor="#a8a29e"
                keyboardType="numeric"
                value={form.urutan}
                onChangeText={(t) => handleFieldChange('urutan', t)}
              />
              <FieldErrorText message={fieldErrors.urutan} />

              {/* Deskripsi */}
              <FieldLabel text="DESKRIPSI" optional />
              <TextInput
                className={`mb-1 rounded-xl border px-4 py-3 text-sm text-stone-800 dark:text-stone-100 ${fieldErrors.deskripsi
                    ? 'border-red-400 bg-red-50 dark:border-red-500 dark:bg-red-950/30'
                    : 'border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800'
                  }`}
                placeholder="Keterangan singkat tingkatan ini"
                placeholderTextColor="#a8a29e"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ minHeight: 80 }}
                value={form.deskripsi}
                onChangeText={(t) => handleFieldChange('deskripsi', t)}
              />
              <FieldErrorText message={fieldErrors.deskripsi} />

              <Button
                className="mt-4 w-full bg-amber-700 active:opacity-90"
                size="lg"
                onPress={handleSave}
                disabled={loading}>
                <Text className="font-semibold text-white">
                  {loading ? 'Menyimpan...' : 'Simpan Tingkatan'}
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