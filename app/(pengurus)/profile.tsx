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
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/Alert';

interface ProfileData {
  name: string;
  email: string;
  nomor_anggota?: string;
  no_hp?: string;
  alamat?: string;
  tanggal_lahir?: string;
  role: { nama_role: string };
}

interface AlertState {
  visible: boolean;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

export default function Profile() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: '', no_hp: '', alamat: '', tanggal_lahir: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
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

  const handleBack = () => {
    if (editMode) {
      setEditMode(false);
      return;
    }

    router.replace('/(pengurus)/dashboard');
  };

  useEffect(() => {
    api
      .get('/profile')
      .then((res) => {
        const p = res.data;
        setProfile(p);
        setForm({
          name: p.name,
          no_hp: p.no_hp ?? '',
          alamat: p.alamat ?? '',
          tanggal_lahir: p.tanggal_lahir ?? '',
        });
      })
      .catch((error) => {
        console.error('Error fetching profile:', error);
        showAlert('error', 'Gagal', 'Gagal memuat data profil');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdate = async () => {
    if (!form.name.trim()) {
      showAlert('warning', 'Data Belum Lengkap', 'Nama lengkap wajib diisi');
      return;
    }

    if (form.no_hp && !/^0[0-9]{9,13}$/.test(form.no_hp.trim())) {
      showAlert('warning', 'Format Tidak Valid', 'Format nomor HP tidak valid (contoh: 08xxxxxxxxxx)');
      return;
    }

    setSaving(true);
    try {
      await api.put('/profile', {
        ...form,
        name: form.name.trim(),
        no_hp: form.no_hp.trim(),
        alamat: form.alamat.trim(),
      });
      
      showAlert('success', 'Berhasil', 'Profil berhasil diperbarui');
      
      setTimeout(async () => {
        setEditMode(false);
        const res = await api.get('/profile');
        setProfile(res.data);
        setForm({
          name: res.data.name,
          no_hp: res.data.no_hp ?? '',
          alamat: res.data.alamat ?? '',
          tanggal_lahir: res.data.tanggal_lahir ?? '',
        });
      }, 1500);
    } catch (e: any) {
      console.error('Error updating profile:', e);
      showAlert('error', 'Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
    } finally {
      setSaving(false);
    }
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

  const getInitials = (name?: string) =>
    (name ?? '?')
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();

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
              {getInitials(profile?.name)}
            </Text>
          </View>

          <Text className="text-lg font-bold text-white">{profile?.name}</Text>
          <Text className="mt-0.5 text-xs text-stone-300">{profile?.email}</Text>

          <View className="mt-3 rounded-full bg-white/10 px-3 py-1">
            <Text className="text-xs font-medium text-white">{profile?.role?.nama_role}</Text>
          </View>
        </View>

        <View className="flex-1 px-5">
          {!editMode ? (
            <>
              {/* Info Card */}
              <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
                <Text className="mb-3 text-sm font-bold text-stone-800 dark:text-stone-100">
                  Informasi Akun
                </Text>
                <DetailRow label="No. Anggota" value={profile?.nomor_anggota ?? '-'} />
                <DetailRow label="No. HP" value={profile?.no_hp ?? '-'} />
                <DetailRow label="Alamat" value={profile?.alamat ?? '-'} />
                <DetailRow label="Tgl. Lahir" value={profile?.tanggal_lahir ?? '-'} last />
              </View>

              <TouchableOpacity
                className="mt-5 flex-row items-center justify-center gap-2 rounded-xl bg-amber-700 py-3.5"
                onPress={() => setEditMode(true)}
                activeOpacity={0.8}>
                <Ionicons name="create-outline" size={16} color="#ffffff" />
                <Text className="text-sm font-semibold text-white">Edit Profil</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
              <Text className="mb-4 text-sm font-bold text-stone-800 dark:text-stone-100">
                Edit Profil
              </Text>

              <FieldLabel text="NAMA LENGKAP" />
              <TextInput
                className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                placeholder="Nama lengkap"
                placeholderTextColor="#a8a29e"
                value={form.name}
                onChangeText={(t) => setForm({ ...form, name: t })}
              />

              <FieldLabel text="NO HP" />
              <TextInput
                className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                placeholder="08xxxxxxxxxx"
                placeholderTextColor="#a8a29e"
                keyboardType="phone-pad"
                maxLength={14}
                value={form.no_hp}
                onChangeText={(t) => setForm({ ...form, no_hp: t })}
              />

              <FieldLabel text="ALAMAT" />
              <TextInput
                className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
                placeholder="Alamat lengkap"
                placeholderTextColor="#a8a29e"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
                style={{ minHeight: 60 }}
                value={form.alamat}
                onChangeText={(t) => setForm({ ...form, alamat: t })}
              />

              <FieldLabel text="TANGGAL LAHIR" />
              <TouchableOpacity
                className="mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
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

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className="flex-1 items-center justify-center rounded-xl border border-stone-200 bg-stone-50 py-3.5 dark:border-stone-700 dark:bg-stone-800"
                  onPress={() => setEditMode(false)}
                  activeOpacity={0.7}>
                  <Text className="text-sm font-semibold text-stone-600 dark:text-stone-300">
                    Batal
                  </Text>
                </TouchableOpacity>
                <Button
                  className="flex-1 bg-amber-700 active:opacity-90"
                  onPress={handleUpdate}
                  disabled={saving}>
                  <Text className="text-sm font-semibold text-white">
                    {saving ? 'Menyimpan...' : 'Simpan'}
                  </Text>
                </Button>
              </View>
            </View>
          )}

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
      />
    </>
  );
}

function FieldLabel({ text }: { text: string }) {
  return (
    <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">{text}</Text>
  );
}

function DetailRow({
  label,
  value,
  last = false,
}: {
  label: string;
  value: string;
  last?: boolean;
}) {
  return (
    <View
      className={`flex-row items-center justify-between py-3 ${
        !last ? 'border-b border-stone-100 dark:border-stone-800' : ''
      }`}>
      <Text className="text-sm text-stone-500 dark:text-stone-400">{label}</Text>
      <Text className="text-sm font-medium text-stone-800 dark:text-stone-100">{value}</Text>
    </View>
  );
}