// app/(admin)/kenaikan/[id]/index.tsx
import { useState, useEffect, useCallback } from 'react';
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
import { router, useLocalSearchParams, useNavigation } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/Alert';

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  lulus: {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    label: 'Lulus',
  },
  proses: {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    label: 'Proses',
  },
  tidak_lulus: {
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    label: 'Tidak Lulus',
  },
};

interface AlertState {
  visible: boolean;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

export default function EditKenaikan() {
  const { id, returnTo, returnId } = useLocalSearchParams<{
    id: string;
    returnTo?: string;
    returnId?: string;
  }>();
  const navigation = useNavigation();
  const [form, setForm] = useState<any>(null);
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
    if (returnTo === 'riwayat' && returnId) {
      router.replace({
        pathname: '/kenaikan/riwayat/[id]',
        params: { id: returnId },
      });
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    router.replace('/kenaikan');
  };

  // Hitung rata-rata dan update status otomatis
  const calculateAndUpdateStatus = useCallback((nilaiObj: any) => {
    const nilaiArray = [
      parseInt(nilaiObj.tes_tulis) || 0,
      parseInt(nilaiObj.tes_senam_jurus) || 0,
      parseInt(nilaiObj.tes_mental) || 0,
      parseInt(nilaiObj.kehadiran) || 0,
    ];

    const validNilai = nilaiArray.filter((n) => n > 0);

    if (validNilai.length > 0) {
      const avg = validNilai.reduce((sum, n) => sum + n, 0) / validNilai.length;
      const roundedAvg = Math.round(avg * 100) / 100;
      
      const newStatus = roundedAvg < 60 ? 'tidak_lulus' : 'lulus';
      
      return {
        rataRata: roundedAvg,
        status: newStatus,
      };
    }

    return {
      rataRata: null,
      status: 'proses',
    };
  }, []);

  useEffect(() => {
    api
      .get(`/kenaikan/${id}`)
      .then((res) => {
        const k = res.data;
        const nilaiObj = {
          tes_tulis: k.nilai?.tes_tulis?.toString() ?? '0',
          tes_senam_jurus: k.nilai?.tes_senam_jurus?.toString() ?? '0',
          tes_mental: k.nilai?.tes_mental?.toString() ?? '0',
          kehadiran: k.nilai?.kehadiran?.toString() ?? '0',
        };

        const { rataRata, status } = calculateAndUpdateStatus(nilaiObj);

        setForm({
          ...k,
          tanggal_kenaikan: k.tanggal_kenaikan,
          status: status,
          tingkatan_id: k.tingkatan_id,
          nilai: nilaiObj,
          catatan: k.catatan ?? '',
          rataRata: rataRata,
        });
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
        showAlert('error', 'Gagal', 'Gagal memuat data kenaikan');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Update status otomatis setiap kali nilai berubah
  const updateNilaiAndStatus = (field: string, value: string) => {
    const newNilai = { ...form.nilai, [field]: value };
    const { rataRata, status } = calculateAndUpdateStatus(newNilai);

    setForm({
      ...form,
      nilai: newNilai,
      status: status,
      rataRata: rataRata,
    });
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

    // Untuk Android, tutup picker setelah memilih
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }

    if (dateToUse) {
      const year = dateToUse.getFullYear();
      const month = String(dateToUse.getMonth() + 1).padStart(2, '0');
      const day = String(dateToUse.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;

      setForm((prev: any) => ({ ...prev, tanggal_kenaikan: formattedDate }));
    }
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/kenaikan/${id}`, {
        ...form,
        nilai: {
          tes_tulis: parseInt(form.nilai.tes_tulis) || 0,
          tes_senam_jurus: parseInt(form.nilai.tes_senam_jurus) || 0,
          tes_mental: parseInt(form.nilai.tes_mental) || 0,
          kehadiran: parseInt(form.nilai.kehadiran) || 0,
        },
      });
      
      showAlert('success', 'Berhasil', 'Data kenaikan berhasil diperbarui');
      
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

  if (loading || !form) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

  const cfg = statusConfig[form.status] ?? statusConfig.proses;

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'lulus':
        return 'Lulus';
      case 'tidak_lulus':
        return 'Tidak Lulus';
      default:
        return 'Proses';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'lulus':
        return 'text-green-600 dark:text-green-400';
      case 'tidak_lulus':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-stone-600 dark:text-stone-400';
    }
  };

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
            <Ionicons name="trending-up" size={24} color="#b45309" />
          </View>

          <Text className="text-lg font-bold text-white">{form.user?.name ?? 'Detail Kenaikan'}</Text>
          <Text className="mt-0.5 text-xs text-stone-300">{form.tingkatan?.nama_tingkatan}</Text>

          <View className={`mt-3 rounded-full px-3 py-1 ${cfg.bg}`}>
            <Text className={`text-xs font-semibold ${cfg.text}`}>{cfg.label}</Text>
          </View>
        </View>

        {/* Nilai Summary */}
        <View className="px-5">
          <View className="-mt-5 flex-row justify-center rounded-2xl border border-stone-200 bg-white px-4 py-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            <View className="flex-1 items-center">
              <Text className="text-lg font-bold text-stone-800 dark:text-stone-100">
                {form.rataRata !== null && form.rataRata !== undefined ? form.rataRata.toFixed(0) : '0'}
              </Text>
              <Text className="mt-0.5 text-[10px] text-stone-500 dark:text-stone-400">Rata-rata</Text>
            </View>
            <View className="w-px bg-stone-200 dark:bg-stone-800" />
            <View className="flex-1 items-center">
              <Ionicons name="calendar-outline" size={16} color="#78716c" />
              <Text className="mt-1 text-[10px] text-stone-500 dark:text-stone-400">
                {form.tanggal_kenaikan}
              </Text>
            </View>
          </View>
        </View>

        {/* Form Card */}
        <View className="flex-1 px-5">
          <View className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            <Text className="mb-4 text-sm font-bold text-stone-800 dark:text-stone-100">
              Edit Data Kenaikan
            </Text>

            <FieldLabel text="TANGGAL KENAIKAN" />
            <TouchableOpacity
              className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
              onPress={() => setShowDatePicker(true)}>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-sm ${
                    form.tanggal_kenaikan
                      ? 'text-stone-800 dark:text-stone-100'
                      : 'text-stone-400'
                  }`}>
                  {form.tanggal_kenaikan || 'Pilih tanggal kenaikan'}
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
                    form.tanggal_kenaikan
                      ? new Date(form.tanggal_kenaikan + 'T00:00:00')
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

            <Text className="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">
              PENILAIAN
            </Text>

            {/* Info Rata-rata */}
            {form.rataRata !== null && form.rataRata !== undefined && (
              <View
                className={`mb-3 rounded-lg p-3 ${
                  form.rataRata < 60
                    ? 'bg-red-50 dark:bg-red-950/30'
                    : 'bg-green-50 dark:bg-green-950/30'
                }`}>
                <Text
                  className={`text-sm font-bold ${
                    form.rataRata < 60
                      ? 'text-red-700 dark:text-red-400'
                      : 'text-green-700 dark:text-green-400'
                  }`}>
                  Rata-rata: {form.rataRata}
                </Text>
                <Text
                  className={`mt-1 text-xs ${
                    form.rataRata < 60
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }`}>
                  Status: {getStatusLabel(form.status)}
                </Text>
              </View>
            )}

            <View className="-mx-1.5 mb-2 flex-row flex-wrap">
              <NilaiInput
                label="Tes Tulis"
                value={form.nilai.tes_tulis}
                onChangeText={(t) => updateNilaiAndStatus('tes_tulis', t)}
              />
              <NilaiInput
                label="Senam & Jurus"
                value={form.nilai.tes_senam_jurus}
                onChangeText={(t) => updateNilaiAndStatus('tes_senam_jurus', t)}
              />
              <NilaiInput
                label="Mental"
                value={form.nilai.tes_mental}
                onChangeText={(t) => updateNilaiAndStatus('tes_mental', t)}
              />
              <NilaiInput
                label="Kehadiran"
                value={form.nilai.kehadiran}
                onChangeText={(t) => updateNilaiAndStatus('kehadiran', t)}
              />
            </View>

            <FieldLabel text="CATATAN" optional />
            <TextInput
              className="mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
              placeholder="Catatan tambahan"
              placeholderTextColor="#a8a29e"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={{ minHeight: 60 }}
              value={form.catatan}
              onChangeText={(t) => setForm({ ...form, catatan: t })}
            />

            {/* Info status otomatis */}
            <Text className={`mb-4 text-xs ${getStatusColor(form.status)}`}>
              Status terisi otomatis berdasarkan rata-rata nilai (di bawah 60 = Tidak Lulus)
            </Text>

            <Button
              className="w-full bg-amber-700 active:opacity-90"
              size="lg"
              onPress={handleUpdate}
              disabled={saving}>
              <Text className="font-semibold text-white">
                {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Text>
            </Button>
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

function NilaiInput({
  label,
  value,
  onChangeText,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
}) {
  return (
    <View className="mb-3 w-1/2 px-1.5">
      <Text className="mb-1 text-xs text-stone-500 dark:text-stone-400">{label}</Text>
      <TextInput
        className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2.5 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
        keyboardType="numeric"
        placeholder="0"
        placeholderTextColor="#a8a29e"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}