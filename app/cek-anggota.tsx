import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import api from '../services/api';
import { Button } from '~/components/ui/button';

interface AnggotaData {
  nama: string;
  nomor_anggota: string;
  tingkatan: string;
  status_keanggotaan: string;
}

export default function CekAnggota() {
  const [nomor, setNomor] = useState<string>('');
  const [data, setData] = useState<AnggotaData | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/');
  };

  const handleCek = async () => {
    if (!nomor.trim()) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await api.post('/cek-anggota', { nomor_anggota: nomor });
      setData(res.data);
    } catch (e) {
      setError('Anggota tidak ditemukan. Periksa kembali nomor anggota Anda.');
    } finally {
      setLoading(false);
    }
  };

  const isAktif = data?.status_keanggotaan?.toLowerCase() === 'aktif';

  return (
    <View className="flex-1 bg-stone-50 dark:bg-stone-950">
      {/* Header */}
      <View className="bg-stone-800 px-6 pb-8 pt-14 dark:bg-stone-900">
        <View className="mb-6 flex-row items-center">
          <TouchableOpacity
            onPress={handleBack}
            className="h-9 w-9 items-center justify-center rounded-full bg-white/10">
            <Text className="text-white">←</Text>
          </TouchableOpacity>
          <View className="w-9" />
        </View>

        <Text className="text-xs font-medium tracking-widest text-amber-500">VERIFIKASI DATA</Text>
        <Text className="mt-1 text-2xl font-bold text-white">Cek Data Anggota</Text>
        <Text className="mt-2 text-sm leading-5 text-stone-300">
          Masukkan nomor anggota untuk melihat status{'\n'}dan riwayat keanggotaan Anda
        </Text>
      </View>

      <View className="flex-1 px-6">
        {/* Search Card */}
        <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Text className="mb-2 text-xs font-medium text-stone-500 dark:text-stone-400">
            NOMOR ANGGOTA
          </Text>
          <TextInput
            className="mb-3 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Contoh: PSHT-000001"
            placeholderTextColor="#a8a29e"
            value={nomor}
            onChangeText={setNomor}
            autoCapitalize="characters"
            onSubmitEditing={handleCek}
          />

          <Button
            className="w-full bg-amber-700 active:opacity-90"
            size="lg"
            onPress={handleCek}
            disabled={loading}>
            {loading ? (
              <View className="flex-row items-center gap-2">
                <ActivityIndicator size="small" color="#fff" />
                <Text className="font-semibold text-white">Mencari...</Text>
              </View>
            ) : (
              <Text className="font-semibold text-white">Cek Sekarang</Text>
            )}
          </Button>
        </View>

        {/* Error State */}
        {error ? (
          <View className="mt-5 flex-row items-start gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 dark:border-red-900/40 dark:bg-red-950/30">
            <View className="mt-0.5 h-6 w-6 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
              <Text className="text-xs text-red-600 dark:text-red-400">!</Text>
            </View>
            <Text className="flex-1 text-sm leading-5 text-red-600 dark:text-red-400">{error}</Text>
          </View>
        ) : null}

        {/* Result Card */}
        {data ? (
          <View className="mt-5 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            {/* Profile Header */}
            <View className="items-center bg-stone-100 px-5 py-6 dark:bg-stone-800/60">
              <View className="mb-3 h-16 w-16 items-center justify-center rounded-full border border-amber-200 bg-amber-100 dark:border-amber-900/50 dark:bg-amber-900/30">
                <Text className="text-2xl">🥋</Text>
              </View>
              <Text className="text-base font-bold text-stone-800 dark:text-stone-100">
                {data.nama}
              </Text>
              <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">
                {data.nomor_anggota}
              </Text>

              <View
                className={`mt-3 rounded-full px-3 py-1 ${
                  isAktif
                    ? 'bg-emerald-100 dark:bg-emerald-900/30'
                    : 'bg-stone-200 dark:bg-stone-700/50'
                }`}>
                <Text
                  className={`text-xs font-medium ${
                    isAktif
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : 'text-stone-600 dark:text-stone-300'
                  }`}>
                  {data.status_keanggotaan}
                </Text>
              </View>
            </View>

            {/* Detail List */}
            <View className="px-5 py-4">
              <DetailRow label="Nama Lengkap" value={data.nama} />
              <DetailRow label="Nomor Anggota" value={data.nomor_anggota} />
              <DetailRow label="Tingkatan" value={data.tingkatan} />
              <DetailRow label="Status" value={data.status_keanggotaan} last />
            </View>
          </View>
        ) : null}

        {/* Empty State */}
        {!data && !error && !loading ? (
          <View className="mt-10 items-center px-6">
            <View className="mb-4 h-16 w-16 items-center justify-center rounded-2xl bg-stone-200/60 dark:bg-stone-800/60">
              <Text className="text-2xl">🔍</Text>
            </View>
            <Text className="text-center text-sm leading-5 text-stone-400 dark:text-stone-600">
              Hasil pencarian data anggota akan{'\n'}ditampilkan di sini
            </Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

/* ===== Sub Components ===== */

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
