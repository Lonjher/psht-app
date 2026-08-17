import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/services/api';

interface DetailKenaikan {
  id: number;
  user: { name: string };
  tingkatan: { nama_tingkatan: string } | null;
  tanggal_kenaikan: string;
  status: string;
  penguji?: { name: string };
  nilai?: {
    tes_tulis: number;
    tes_senam_jurus: number;
    tes_mental: number;
    kehadiran: number;
  };
  catatan?: string;
}

export default function DetailKenaikan() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [data, setData] = useState<DetailKenaikan | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/riwayat-kenaikan')
      .then((res) => {
        console.log('🔹 Full response:', JSON.stringify(res.data, null, 2));
        const found = res.data.find((item: any) => item.id === Number(id));
        console.log('🔸 Found item:', found);
        setData(found || null);
      })
      .catch((err) => {
        console.log('❌ Error fetching riwayat:', err.response?.status, err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-50">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  if (!data) {
    return (
      <View className="flex-1 bg-slate-50 px-5 pt-14">
        <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); return; } router.replace('/'); }}>
          <Text className="mb-4 text-sm text-blue-600">← Kembali</Text>
        </TouchableOpacity>
        <Text className="text-lg text-slate-500">Data tidak ditemukan.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-50 px-5 pt-14">
      <TouchableOpacity onPress={() => { if (router.canGoBack()) { router.back(); return; } router.replace('/'); }}>
        <Text className="mb-4 text-sm text-blue-600">← Kembali</Text>
      </TouchableOpacity>

      <View className="rounded-xl bg-white p-5 shadow-sm">
        <Text className="mb-4 text-lg font-bold text-slate-800">Detail Kenaikan</Text>

        <View className="mb-3 flex-row">
          <Text className="w-28 text-sm text-slate-500">Tingkatan</Text>
          <Text className="text-sm font-medium text-slate-800">
            {data.tingkatan?.nama_tingkatan ?? '-'}
          </Text>
        </View>
        <View className="mb-3 flex-row">
          <Text className="w-28 text-sm text-slate-500">Tanggal</Text>
          <Text className="text-sm text-slate-800">{data.tanggal_kenaikan}</Text>
        </View>
        <View className="mb-3 flex-row">
          <Text className="w-28 text-sm text-slate-500">Status</Text>
          <Text
            className={`text-sm font-medium ${
              data.status === 'lulus'
                ? 'text-green-600'
                : data.status === 'tidak_lulus'
                  ? 'text-red-600'
                  : 'text-amber-600'
            }`}>
            {data.status}
          </Text>
        </View>
        {data.penguji && (
          <View className="mb-3 flex-row">
            <Text className="w-28 text-sm text-slate-500">Diuji oleh</Text>
            <Text className="text-sm text-slate-800">{data.penguji.name}</Text>
          </View>
        )}
      </View>

      {/* Nilai */}
      {data.nilai && (
        <View className="mt-4 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-3 text-base font-semibold text-slate-800">Nilai</Text>
          <View className="-mx-2 flex-row flex-wrap">
            <NilaiItem label="Tes Tulis" value={data.nilai.tes_tulis} />
            <NilaiItem label="Senam & Jurus" value={data.nilai.tes_senam_jurus} />
            <NilaiItem label="Tes Mental" value={data.nilai.tes_mental} />
            <NilaiItem label="Kehadiran" value={data.nilai.kehadiran} />
          </View>
        </View>
      )}

      {/* Catatan */}
      {data.catatan ? (
        <View className="mt-4 rounded-xl bg-white p-5 shadow-sm">
          <Text className="mb-2 text-base font-semibold text-slate-800">Catatan</Text>
          <Text className="text-sm text-slate-600">{data.catatan}</Text>
        </View>
      ) : null}
    </View>
  );
}

function NilaiItem({ label, value }: { label: string; value: number }) {
  return (
    <View className="w-1/2 p-2">
      <View className="rounded-lg bg-slate-50 p-3">
        <Text className="text-xs text-slate-500">{label}</Text>
        <Text className="text-lg font-bold text-slate-800">{value}</Text>
      </View>
    </View>
  );
}
