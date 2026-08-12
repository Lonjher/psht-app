import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';

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

export default function EditKenaikan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get(`/kenaikan/${id}`)
      .then((res) => {
        const k = res.data;
        setForm({
          ...k,
          tanggal_kenaikan: k.tanggal_kenaikan,
          status: k.status,
          tingkatan_id: k.tingkatan_id,
          nilai: {
            tes_tulis: k.nilai?.tes_tulis?.toString() ?? '0',
            tes_senam_jurus: k.nilai?.tes_senam_jurus?.toString() ?? '0',
            tes_mental: k.nilai?.tes_mental?.toString() ?? '0',
            kehadiran: k.nilai?.kehadiran?.toString() ?? '0',
          },
          catatan: k.catatan ?? '',
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

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
      Alert.alert('Berhasil', 'Data kenaikan diperbarui');
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Error');
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
  const rataRata =
    ((parseInt(form.nilai.tes_tulis) || 0) +
      (parseInt(form.nilai.tes_senam_jurus) || 0) +
      (parseInt(form.nilai.tes_mental) || 0) +
      (parseInt(form.nilai.kehadiran) || 0)) /
    4;

  return (
    <ScrollView
      className="flex-1 bg-stone-50 dark:bg-stone-950"
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View className="items-center bg-stone-800 px-5 pb-10 pt-14 dark:bg-stone-900">
        <TouchableOpacity
          onPress={() => router.back()}
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
              {rataRata.toFixed(0)}
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
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            value={form.tanggal_kenaikan}
            onChangeText={(t) => setForm({ ...form, tanggal_kenaikan: t })}
          />

          <FieldLabel text="STATUS" />
          <View className="mb-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
            <Picker
              selectedValue={form.status}
              onValueChange={(v) => setForm({ ...form, status: v })}
              style={{ color: '#1c1917' }}
              dropdownIconColor="#78716c">
              <Picker.Item label="Proses" value="proses" />
              <Picker.Item label="Lulus" value="lulus" />
              <Picker.Item label="Tidak Lulus" value="tidak_lulus" />
            </Picker>
          </View>

          <Text className="mb-3 text-xs font-medium text-stone-500 dark:text-stone-400">
            PENILAIAN
          </Text>
          <View className="-mx-1.5 mb-2 flex-row flex-wrap">
            <NilaiInput
              label="Tes Tulis"
              value={form.nilai.tes_tulis}
              onChangeText={(t) => setForm({ ...form, nilai: { ...form.nilai, tes_tulis: t } })}
            />
            <NilaiInput
              label="Senam & Jurus"
              value={form.nilai.tes_senam_jurus}
              onChangeText={(t) =>
                setForm({ ...form, nilai: { ...form.nilai, tes_senam_jurus: t } })
              }
            />
            <NilaiInput
              label="Mental"
              value={form.nilai.tes_mental}
              onChangeText={(t) => setForm({ ...form, nilai: { ...form.nilai, tes_mental: t } })}
            />
            <NilaiInput
              label="Kehadiran"
              value={form.nilai.kehadiran}
              onChangeText={(t) => setForm({ ...form, nilai: { ...form.nilai, kehadiran: t } })}
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
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
