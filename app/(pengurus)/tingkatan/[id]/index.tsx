import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
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
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  showCancel?: boolean;
}

export default function EditTingkatan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<TingkatanForm>({
    nama_tingkatan: '',
    urutan: '',
    deskripsi: ''
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [alertState, setAlertState] = useState<AlertState>({
    visible: false,
    variant: 'info',
    title: '',
    description: '',
  });

  const showAlert = (
    variant: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string,
    options?: {
      onConfirm?: () => void;
      confirmText?: string;
      cancelText?: string;
      showCancel?: boolean;
    }
  ) => {
    setAlertState({
      visible: true,
      variant,
      title,
      description,
      onConfirm: options?.onConfirm,
      confirmText: options?.confirmText,
      cancelText: options?.cancelText,
      showCancel: options?.showCancel,
    });
  };

  const hideAlert = () => {
    setAlertState((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    api
      .get(`/tingkatan/${id}`)
      .then((res) => {
        const t = res.data;
        setForm({
          nama_tingkatan: t.nama_tingkatan,
          urutan: t.urutan.toString(),
          deskripsi: t.deskripsi ?? '',
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        showAlert('error', 'Gagal', 'Gagal memuat data tingkatan');
      })
      .finally(() => setLoading(false));
  }, [id]);

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

  const handleUpdate = async () => {
    const errors = validateAllFields();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      showAlert('warning', 'Data Belum Lengkap', 'Periksa kembali kolom yang ditandai merah');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/tingkatan/${id}`, {
        ...form,
        urutan: parseInt(form.urutan),
        nama_tingkatan: form.nama_tingkatan.trim(),
        deskripsi: form.deskripsi.trim(),
      });

      showAlert('success', 'Berhasil', 'Tingkatan berhasil diperbarui');

      setTimeout(() => {
        router.replace('/tingkatan');
      }, 1500);
    } catch (e: any) {
      console.error('Error updating:', e);

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
      setSaving(false);
    }
  };

  const handleDelete = () => {
    showAlert(
      'warning',
      'Hapus Tingkatan',
      'Hapus tingkatan ini? Tindakan ini tidak dapat dibatalkan.',
      {
        showCancel: true,
        confirmText: 'Hapus',
        cancelText: 'Batal',
        onConfirm: async () => {
          setDeleting(true);
          try {
            await api.delete(`/tingkatan/${id}`);

            hideAlert();
            showAlert('success', 'Dihapus', 'Tingkatan berhasil dihapus');

            setTimeout(() => {
              router.replace('/tingkatan');
            }, 1500);
          } catch (e: any) {
            hideAlert();
            showAlert('error', 'Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
          } finally {
            setDeleting(false);
          }
        },
      }
    );
  };

  if (loading) {
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
          <View className="items-center bg-stone-800 px-5 pb-10 pt-14 dark:bg-stone-900">
            <TouchableOpacity
              onPress={() => router.replace('/tingkatan')}
              className="absolute left-5 top-14 h-9 w-9 items-center justify-center rounded-full bg-white/10">
              <Ionicons name="chevron-back" size={18} color="#ffffff" />
            </TouchableOpacity>

            <View className="mb-3 h-16 w-16 items-center justify-center rounded-full border border-amber-200/40 bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/30">
              <Text className="text-lg font-bold text-amber-700 dark:text-amber-500">
                {form.urutan || '-'}
              </Text>
            </View>

            <Text className="text-lg font-bold text-white">
              {form.nama_tingkatan || 'Detail Tingkatan'}
            </Text>
            <Text className="mt-0.5 text-xs text-stone-300">Urutan ke-{form.urutan}</Text>
          </View>

          {/* Form Card */}
          <View className="flex-1 px-5">
            <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
              <Text className="mb-4 text-sm font-bold text-stone-800 dark:text-stone-100">
                Edit Data Tingkatan
              </Text>

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
                onPress={handleUpdate}
                disabled={saving}>
                <Text className="font-semibold text-white">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Text>
              </Button>
            </View>

            {/* Danger Zone */}
            <View className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-5 dark:border-red-900/40 dark:bg-red-950/20">
              <View className="mb-3 flex-row items-center gap-2">
                <Ionicons name="warning-outline" size={16} color="#dc2626" />
                <Text className="text-sm font-bold text-red-600 dark:text-red-400">Zona Berbahaya</Text>
              </View>
              <Text className="mb-4 text-xs leading-5 text-red-500/80 dark:text-red-400/70">
                Menghapus tingkatan dapat memengaruhi data kenaikan yang terkait dengan tingkatan ini.
              </Text>
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2 rounded-xl border border-red-300 bg-white py-3.5 dark:border-red-900/50 dark:bg-stone-900"
                onPress={handleDelete}
                disabled={deleting}
                activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={16} color="#dc2626" />
                <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                  {deleting ? 'Menghapus...' : 'Hapus Tingkatan'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="h-8" />
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
        onConfirm={alertState.onConfirm}
        confirmText={alertState.confirmText}
        cancelText={alertState.cancelText}
        showCancel={alertState.showCancel}
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