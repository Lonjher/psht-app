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
import api from '@/services/api';
import { Button } from '@/components/ui/button';

export default function EditTingkatan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [form, setForm] = useState({ nama_tingkatan: '', urutan: '', deskripsi: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
      .finally(() => setLoading(false));
  }, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/tingkatan/${id}`, { ...form, urutan: parseInt(form.urutan) });
      Alert.alert('Berhasil', 'Tingkatan diperbarui');
      router.back();
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Konfirmasi', 'Hapus tingkatan ini? Tindakan ini tidak dapat dibatalkan.', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.delete(`/tingkatan/${id}`);
            Alert.alert('Dihapus', 'Tingkatan berhasil dihapus');
            router.back();
          } catch (e: any) {
            Alert.alert('Gagal', e.response?.data?.message ?? 'Error');
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-stone-50 dark:bg-stone-950">
        <ActivityIndicator size="large" color="#b45309" />
      </View>
    );
  }

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

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            NAMA TINGKATAN
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            value={form.nama_tingkatan}
            onChangeText={(t) => setForm({ ...form, nama_tingkatan: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            URUTAN
          </Text>
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            keyboardType="numeric"
            value={form.urutan}
            onChangeText={(t) => setForm({ ...form, urutan: t })}
          />

          <Text className="mb-1.5 text-xs font-medium text-stone-500 dark:text-stone-400">
            DESKRIPSI
          </Text>
          <TextInput
            className="mb-5 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            style={{ minHeight: 80 }}
            value={form.deskripsi}
            onChangeText={(t) => setForm({ ...form, deskripsi: t })}
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
  );
}
