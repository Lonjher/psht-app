// app/(admin)/users/[id]/index.tsx
import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Alert } from '@/components/Alert';

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

export default function EditUser() {
  const { id, returnTo } = useLocalSearchParams<{ id: string; returnTo?: string }>();
  const [form, setForm] = useState({
    name: '',
    email: '',
    nomor_anggota: '',
    no_hp: '',
    alamat: '',
    tanggal_lahir: '',
    status: '',
    tingkatan_terakhir: '',
  });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [approving, setApproving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
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

  const handleBack = () => {
    if (returnTo === 'users') {
      router.replace('/users');
      return;
    }

    router.replace('/users');
  };

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      const u = res.data;
      setForm({
        name: u.name,
        email: u.email,
        nomor_anggota: u.nomor_anggota ?? '',
        no_hp: u.no_hp ?? '',
        alamat: u.alamat ?? '',
        tanggal_lahir: u.tanggal_lahir ?? '',
        status: u.status,
        tingkatan_terakhir:
          u.tingkatan_terakhir ??
          u.kenaikan_terakhir?.tingkatan?.nama_tingkatan ??
          u.tingkatan?.nama_tingkatan ??
          'Belum ada tingkatan',
      });
      console.log('User data:', u);
    } catch (e) {
      console.error('Error fetching user:', e);
      showAlert('error', 'Gagal', 'Gagal memuat data anggota');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const handleUpdate = async () => {
    if (isPending) {
      showAlert('warning', 'Perhatian', 'Anggota harus disetujui terlebih dahulu.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${id}`, form);

      showAlert('success', 'Berhasil', 'Data anggota berhasil diperbarui');

      setTimeout(() => {
        handleBack();
      }, 1500);
    } catch (e: any) {
      console.error('Error updating:', e);
      showAlert('error', 'Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
  };

  const handleApprove = () => {
    showAlert(
      'warning',
      'Setujui Anggota',
      'Setujui anggota ini? Anggota akan menjadi aktif dan nomor anggota akan dibuat otomatis.',
      {
        showCancel: true,
        confirmText: 'Setujui',
        cancelText: 'Batal',
        onConfirm: async () => {
          setApproving(true);
          try {
            await api.patch(`/users/${id}/approve`);
            await fetchUser(); // ambil data terbaru, termasuk nomor_anggota

            hideAlert();
            showAlert('success', 'Disetujui', 'Anggota sekarang aktif dan nomor anggota telah dibuat');
          } catch (e: any) {
            console.error('Error approving:', e);
            hideAlert();
            showAlert('error', 'Gagal', e.response?.data?.message ?? 'Gagal menyetujui');
          } finally {
            setApproving(false);
          }
        },
      }
    );
  };

  const handleResetPassword = async () => {
    if (isPending) {
      showAlert('warning', 'Perhatian', 'Anggota harus disetujui terlebih dahulu.');
      return;
    }

    if (!form.tanggal_lahir) {
      showAlert(
        'warning',
        'Tanggal Lahir Belum Diisi',
        'Isi terlebih dahulu sebelum mereset password.'
      );
      return;
    }

    const [year, month, day] = form.tanggal_lahir.split('-');
    const defaultPassword = `${day}${month}${year}`;

    showAlert(
      'warning',
      'Reset Password',
      `Password akan direset ke format tanggal lahir (DDMMYYYY): ${defaultPassword}`,
      {
        showCancel: true,
        confirmText: 'Reset',
        cancelText: 'Batal',
        onConfirm: async () => {
          setResettingPassword(true);
          try {
            await api.patch(`/users/${id}/reset-password`, {
              password: defaultPassword,
            });

            hideAlert();
            showAlert('success', 'Berhasil', `Password telah direset ke ${defaultPassword}`);
          } catch (e: any) {
            hideAlert();
            showAlert(
              'error',
              'Gagal',
              e.response?.data?.message ?? 'Terjadi kesalahan saat mereset password'
            );
          } finally {
            setResettingPassword(false);
          }
        },
      }
    );
  };

  const handleDelete = () => {
    showAlert(
      'warning',
      'Hapus Anggota',
      'Hapus anggota ini? Tindakan ini tidak dapat dibatalkan.',
      {
        showCancel: true,
        confirmText: 'Hapus',
        cancelText: 'Batal',
        onConfirm: async () => {
          setDeleting(true);
          try {
            await api.delete(`/users/${id}`);

            hideAlert();
            showAlert('success', 'Dihapus', 'Data anggota berhasil dihapus');

            setTimeout(() => {
              handleBack();
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

      setForm((prev) => ({ ...prev, tanggal_lahir: formattedDate }));
    }
  };

  const getInitials = (name: string) =>
    name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

  const isPending = form.status.toLowerCase() === 'pending';
  const isAktif = form.status.toLowerCase() === 'aktif';

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  return (
    <>
      <ScrollView
        className="flex-1 bg-stone-50 dark:bg-stone-950"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="items-center bg-stone-800 px-5 pb-10 pt-14 dark:bg-stone-900">
          <TouchableOpacity
            onPress={handleBack}
            className="absolute left-5 top-14 h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Ionicons name="chevron-back" size={18} color="#ffffff" />
          </TouchableOpacity>

          <View className="mb-3 h-16 w-16 items-center justify-center rounded-full border border-amber-200/40 bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/30">
            <Text className="text-lg font-bold text-amber-700 dark:text-amber-500">
              {getInitials(form.name || '??')}
            </Text>
          </View>

          <Text className="text-lg font-bold text-white">{form.name || 'Detail Anggota'}</Text>
          <Text className="mt-0.5 text-xs text-stone-300">{form.email}</Text>

          <View
            className={`mt-3 rounded-full px-3 py-1 ${isAktif ? 'bg-emerald-500/20' : 'bg-amber-500/20'
              }`}>
            <Text
              className={`text-xs font-semibold capitalize ${isAktif ? 'text-emerald-400' : 'text-amber-400'
                }`}>
              {form.status}
            </Text>
          </View>

          <View className="mt-2 rounded-full bg-white/10 px-3 py-1">
            <Text className="text-xs font-medium text-stone-200">
              {form.tingkatan_terakhir}
            </Text>
          </View>
        </View>

        {/* Approve Banner */}
        {isPending && (
          <View className="px-5">
            <View className="-mt-5 flex-row items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
              <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                <Ionicons name="time-outline" size={18} color="#b45309" />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                  Menunggu Persetujuan
                </Text>
                <Text className="mt-0.5 text-xs leading-4 text-amber-700/80 dark:text-amber-500/70">
                  Setujui agar anggota ini dapat mengakses akun
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleApprove}
                disabled={approving}
                className="rounded-full bg-amber-700 px-3.5 py-2"
                activeOpacity={0.8}>
                <Text className="text-xs font-semibold text-white">
                  {approving ? '...' : 'Setujui'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Form Card */}
        <View className="z-10 flex-1 px-5">
          <View className="mt-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            <Text className="mb-4 text-sm font-bold text-stone-800 dark:text-stone-100">
              Edit Data Anggota
            </Text>

            <FieldLabel text="NAMA LENGKAP" />
            <TextInput
              className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${isPending ? 'bg-stone-200 dark:bg-stone-700' : 'bg-stone-50 dark:bg-stone-800'
                }`}
              value={form.name}
              onChangeText={(t) => setForm({ ...form, name: t })}
              editable={!isPending}
            />

            <FieldLabel text="EMAIL" />
            <TextInput
              className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${isPending ? 'bg-stone-200 dark:bg-stone-700' : 'bg-stone-50 dark:bg-stone-800'
                }`}
              autoCapitalize="none"
              keyboardType="email-address"
              value={form.email}
              onChangeText={(t) => setForm({ ...form, email: t })}
              editable={!isPending}
            />

            <FieldLabel text="NOMOR ANGGOTA" />
            <TextInput
              className="mb-4 rounded-xl border border-stone-200 bg-stone-200 px-4 py-3 text-sm text-stone-500 dark:border-stone-700 dark:bg-stone-700 dark:text-stone-400"
              autoCapitalize="characters"
              value={isAktif ? form.nomor_anggota : ''}
              editable={false}
            />

            <FieldLabel text="NO HP" />
            <TextInput
              className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${isPending ? 'bg-stone-200 dark:bg-stone-700' : 'bg-stone-50 dark:bg-stone-800'
                }`}
              keyboardType="phone-pad"
              maxLength={14}
              value={form.no_hp}
              onChangeText={(t) => setForm({ ...form, no_hp: t })}
              editable={!isPending}
            />

            <FieldLabel text="TANGGAL LAHIR" />
            <TouchableOpacity
              className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 dark:border-stone-700 ${isPending ? 'bg-stone-200 dark:bg-stone-700' : 'bg-stone-50 dark:bg-stone-800'
                }`}
              onPress={() => {
                if (!isPending) setShowDatePicker(true);
              }}
              disabled={isPending}>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-sm ${form.tanggal_lahir ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
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

            <FieldLabel text="ALAMAT" />
            <TextInput
              className={`mb-5 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${isPending ? 'bg-stone-200 dark:bg-stone-700' : 'bg-stone-50 dark:bg-stone-800'
                }`}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={{ minHeight: 60 }}
              value={form.alamat}
              onChangeText={(t) => setForm({ ...form, alamat: t })}
              editable={!isPending}
            />

            <Button
              className="w-full bg-amber-700 active:opacity-90"
              size="lg"
              onPress={handleUpdate}
              disabled={saving || isPending}>
              <Text className="font-semibold text-white">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Text>
            </Button>
          </View>

          {/* Reset Password Section */}
          <View className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/60 p-5 dark:border-blue-900/40 dark:bg-blue-950/20">
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name="key-outline" size={16} color="#2563eb" />
              <Text className="text-sm font-bold text-blue-600 dark:text-blue-400">
                Reset Password
              </Text>
            </View>
            <Text className="mb-4 text-xs leading-5 text-blue-500/80 dark:text-blue-400/70">
              Password akan direset ke tanggal lahir dengan format DDMMYYYY.
              {form.tanggal_lahir && (
                <Text className="font-semibold">
                  {'\n'}Password default: {form.tanggal_lahir.split('-').reverse().join('')}
                </Text>
              )}
            </Text>
            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-xl border border-blue-300 bg-white py-3.5 dark:border-blue-900/50 dark:bg-stone-900"
              onPress={handleResetPassword}
              disabled={resettingPassword || isPending || !form.tanggal_lahir}
              activeOpacity={0.7}>
              <Ionicons name="key-outline" size={16} color="#2563eb" />
              <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                {resettingPassword ? 'Mereset...' : 'Reset Password'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View className="mt-5 rounded-2xl border border-red-100 bg-red-50/60 p-5 dark:border-red-900/40 dark:bg-red-950/20">
            <View className="mb-3 flex-row items-center gap-2">
              <Ionicons name="warning-outline" size={16} color="#dc2626" />
              <Text className="text-sm font-bold text-red-600 dark:text-red-400">Zona Berbahaya</Text>
            </View>
            <Text className="mb-4 text-xs leading-5 text-red-500/80 dark:text-red-400/70">
              Menghapus anggota akan menghilangkan seluruh riwayat keanggotaan secara permanen.
            </Text>

            <TouchableOpacity
              className="flex-row items-center justify-center gap-2 rounded-xl border border-red-300 bg-white py-3.5 dark:border-red-900/50 dark:bg-stone-900"
              onPress={handleDelete}
              disabled={deleting}
              activeOpacity={0.7}>
              <Ionicons name="trash-outline" size={16} color="#dc2626" />
              <Text className="text-sm font-semibold text-red-600 dark:text-red-400">
                {deleting ? 'Menghapus...' : 'Hapus Anggota'}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="h-8" />
        </View>
      </ScrollView>

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

function FieldLabel({ text }: { text: string }) {
  return (
    <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">{text}</Text>
  );
}