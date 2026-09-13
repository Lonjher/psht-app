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
  KeyboardAvoidingView,
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
  const { id } = useLocalSearchParams<{ id: string }>();
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
  const [rejecting, setRejecting] = useState(false);
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

  const fetchUser = async () => {
    try {
      const res = await api.get(`/users/${id}`);
      const u = res.data;

      console.log('User data dari backend:', JSON.stringify(u, null, 2));
      console.log('tingkatan_terakhir:', u.tingkatan_terakhir);
      console.log('kenaikan_terakhir:', u.kenaikan_terakhir);
      console.log('tingkatan:', u.tingkatan);

      // Helper untuk mendapatkan nama tingkatan (selalu string)
      const getTingkatanName = (): string => {
        if (u.tingkatan_terakhir) {
          if (typeof u.tingkatan_terakhir === 'string') {
            return u.tingkatan_terakhir;
          }
          if (typeof u.tingkatan_terakhir === 'object' && u.tingkatan_terakhir.nama_tingkatan) {
            return u.tingkatan_terakhir.nama_tingkatan;
          }
        }

        if (u.kenaikan_terakhir?.tingkatan?.nama_tingkatan) {
          return u.kenaikan_terakhir.tingkatan.nama_tingkatan;
        }

        if (u.tingkatan?.nama_tingkatan) {
          return u.tingkatan.nama_tingkatan;
        }

        return 'Belum ada tingkatan';
      };

      setForm({
        name: u.name ?? '',
        email: u.email ?? '',
        nomor_anggota: u.nomor_anggota ?? '',
        no_hp: u.no_hp ?? '',
        alamat: u.alamat ?? '',
        tanggal_lahir: u.tanggal_lahir ?? '',
        status: u.status ?? 'pending',
        tingkatan_terakhir: getTingkatanName(),
      });
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
    if (isPending || isNonaktif) {
      showAlert('warning', 'Perhatian', 'Anggota harus aktif untuk dapat diubah.');
      return;
    }

    setSaving(true);
    try {
      await api.put(`/users/${id}`, form);

      showAlert('success', 'Berhasil', 'Data anggota berhasil diperbarui');

      setTimeout(() => {
        router.replace('/users');
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
            await fetchUser();

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

  const handleReject = () => {
    showAlert(
      'warning',
      'Tolak Pendaftaran',
      'Tolak pendaftaran anggota ini? Status akan diubah menjadi nonaktif.',
      {
        showCancel: true,
        confirmText: 'Tolak',
        cancelText: 'Batal',
        onConfirm: async () => {
          setRejecting(true);
          try {
            // Endpoint tolak; sesuaikan dengan API backend
            await api.patch(`/users/${id}/reject`);

            // Ambil data terbaru untuk mendapatkan status baru (nonaktif)
            await fetchUser();

            hideAlert();
            showAlert('success', 'Ditolak', 'Pendaftaran anggota ditolak. Status menjadi nonaktif.');
          } catch (e: any) {
            console.error('Error rejecting:', e);
            hideAlert();
            showAlert('error', 'Gagal', e.response?.data?.message ?? 'Gagal menolak pendaftaran');
          } finally {
            setRejecting(false);
          }
        },
      }
    );
  };

  const handleResetPassword = async () => {
    if (!isAktif) {
      showAlert('warning', 'Perhatian', 'Hanya anggota aktif yang dapat direset passwordnya.');
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
              router.replace('/users');
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

  // Handler untuk DatePicker (tetap menggunakan onChange karena lebih stabil)
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

  // Status helper
  const isPending = form.status.toLowerCase() === 'pending';
  const isAktif = form.status.toLowerCase() === 'aktif';
  // Asumsikan status nonaktif bisa 'nonaktif' atau 'ditolak'
  const isNonaktif = form.status.toLowerCase() === 'nonaktif';

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
              onPress={() => router.replace('/users')}
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

            {/* Badge status */}
            <View
              className={`mt-3 rounded-full px-3 py-1 ${
                isAktif
                  ? 'bg-emerald-500/20'
                  : isPending
                  ? 'bg-amber-500/20'
                  : 'bg-red-500/20'
              }`}>
              <Text
                className={`text-xs font-semibold capitalize ${
                  isAktif
                    ? 'text-emerald-400'
                    : isPending
                    ? 'text-amber-400'
                    : 'text-red-400'
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

          {/* Approve/Reject Banner untuk Pending */}
          {isPending && (
            <View className="px-5">
              <View className="-mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900/40 dark:bg-amber-950/30">
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                    <Ionicons name="time-outline" size={18} color="#b45309" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-amber-800 dark:text-amber-400">
                      Menunggu Persetujuan
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4 text-amber-700/80 dark:text-amber-500/70">
                      Setujui atau tolak pendaftaran anggota ini.
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row gap-2">
                  <TouchableOpacity
                    onPress={handleApprove}
                    disabled={approving || rejecting}
                    className="flex-1 rounded-full bg-amber-700 px-3.5 py-2"
                    activeOpacity={0.8}>
                    <Text className="text-center text-xs font-semibold text-white">
                      {approving ? 'Memproses...' : 'Setujui'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleReject}
                    disabled={rejecting || approving}
                    className="flex-1 rounded-full border border-red-300 bg-white px-3.5 py-2"
                    activeOpacity={0.8}>
                    <Text className="text-center text-xs font-semibold text-red-600">
                      {rejecting ? 'Memproses...' : 'Tolak'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}

          {/* Banner untuk Nonaktif */}
          {isNonaktif && (
            <View className="px-5">
              <View className="-mt-5 rounded-2xl border border-red-200 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
                <View className="flex-row items-center gap-3">
                  <View className="h-9 w-9 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/40">
                    <Ionicons name="close-circle-outline" size={18} color="#dc2626" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-red-800 dark:text-red-400">
                      Akun Nonaktif
                    </Text>
                    <Text className="mt-0.5 text-xs leading-4 text-red-700/80 dark:text-red-500/70">
                      Pendaftaran anggota ini telah ditolak.
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                    onPress={handleApprove}
                    disabled={approving || rejecting}
                    className="mt-3 flex-1 rounded-full bg-amber-700 px-3.5 py-2"
                    activeOpacity={0.8}>
                    <Text className="text-center text-xs font-semibold text-white">
                      {approving ? 'Memproses...' : 'Setujui'}
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
                className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${
                  isPending || isNonaktif
                    ? 'bg-stone-200 dark:bg-stone-700'
                    : 'bg-stone-50 dark:bg-stone-800'
                }`}
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
                editable={!isPending && !isNonaktif}
              />

              <FieldLabel text="EMAIL" />
              <TextInput
                className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${
                  isPending || isNonaktif
                    ? 'bg-stone-200 dark:bg-stone-700'
                    : 'bg-stone-50 dark:bg-stone-800'
                }`}
                autoCapitalize="none"
                keyboardType="email-address"
                value={form.email}
                onChangeText={(t) => setForm({ ...form, email: t })}
                editable={!isPending && !isNonaktif}
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
                className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${
                  isPending || isNonaktif
                    ? 'bg-stone-200 dark:bg-stone-700'
                    : 'bg-stone-50 dark:bg-stone-800'
                }`}
                keyboardType="phone-pad"
                maxLength={14}
                value={form.no_hp}
                onChangeText={(t) => setForm({ ...form, no_hp: t })}
                editable={!isPending && !isNonaktif}
              />

              <FieldLabel text="TANGGAL LAHIR" />
              <TouchableOpacity
                className={`mb-4 rounded-xl border border-stone-200 px-4 py-3 dark:border-stone-700 ${
                  isPending || isNonaktif
                    ? 'bg-stone-200 dark:bg-stone-700'
                    : 'bg-stone-50 dark:bg-stone-800'
                }`}
                onPress={() => {
                  if (!isPending && !isNonaktif) setShowDatePicker(true);
                }}
                disabled={isPending || isNonaktif}>
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

              {showDatePicker && !isPending && !isNonaktif && (
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
                className={`mb-5 rounded-xl border border-stone-200 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:text-stone-100 ${
                  isPending || isNonaktif
                    ? 'bg-stone-200 dark:bg-stone-700'
                    : 'bg-stone-50 dark:bg-stone-800'
                }`}
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={{ minHeight: 60 }}
                value={form.alamat}
                onChangeText={(t) => setForm({ ...form, alamat: t })}
                editable={!isPending && !isNonaktif}
              />

              <Button
                className="w-full bg-amber-700 active:opacity-90"
                size="lg"
                onPress={handleUpdate}
                disabled={saving || isPending || isNonaktif}>
                <Text className="font-semibold text-white">
                  {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </Text>
              </Button>
            </View>

            {/* Reset Password Section - hanya tampil untuk anggota aktif */}
            {isAktif && (
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
                  disabled={resettingPassword || !form.tanggal_lahir}
                  activeOpacity={0.7}>
                  <Ionicons name="key-outline" size={16} color="#2563eb" />
                  <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {resettingPassword ? 'Mereset...' : 'Reset Password'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Danger Zone - hanya tampil untuk anggota aktif */}
            {isAktif && (
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
            )}

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

function FieldLabel({ text }: { text: string }) {
  return (
    <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">{text}</Text>
  );
}