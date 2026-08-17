import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
} from 'react-native';
import { router } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';

interface UserOption {
  id: number;
  name: string;
  nomor_anggota?: string;
}
interface TingkatanOption {
  id: number;
  nama_tingkatan: string;
}

export default function CreateKenaikan() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [tingkatans, setTingkatans] = useState<TingkatanOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedTingkatan, setSelectedTingkatan] = useState<number | null>(null);
  const [tanggal, setTanggal] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState('proses');
  const [nilai, setNilai] = useState({
    tes_tulis: '',
    tes_senam_jurus: '',
    tes_mental: '',
    kehadiran: '',
  });
  const [catatan, setCatatan] = useState('');
  const [loading, setLoading] = useState(false);
  const isDark = useColorScheme() === 'dark';

  useEffect(() => {
    api.get('/users?status=aktif').then((res) => setUsers(res.data));
    api.get('/tingkatan').then((res) => setTingkatans(res.data));
  }, []);

  const handleSubmit = async () => {
    if (!selectedUser || !selectedTingkatan || !tanggal) {
      Alert.alert('Lengkapi data', 'Anggota, tingkatan, dan tanggal wajib diisi');
      return;
    }
    setLoading(true);
    try {
      await api.post('/kenaikan', {
        user_id: selectedUser,
        tingkatan_id: selectedTingkatan,
        tanggal_kenaikan: tanggal,
        status,
        nilai: {
          tes_tulis: parseInt(nilai.tes_tulis) || 0,
          tes_senam_jurus: parseInt(nilai.tes_senam_jurus) || 0,
          tes_mental: parseInt(nilai.tes_mental) || 0,
          kehadiran: parseInt(nilai.kehadiran) || 0,
        },
        catatan,
      });
      Alert.alert('Berhasil', 'Data kenaikan disimpan');
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/');
      }
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (_event: any, selectedDate?: Date) => {
    const currentDate = selectedDate ?? new Date();
    const isoDate = currentDate.toISOString().split('T')[0];
    setTanggal(isoDate);
  };

  return (
    <ScrollView
      className="flex-1 bg-stone-50 dark:bg-stone-950"
      contentContainerClassName="flex-grow"
      keyboardShouldPersistTaps="handled">
      {/* Header */}
      <View className="bg-stone-800 px-5 pb-8 pt-14 dark:bg-stone-900">
        <TouchableOpacity
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
              return;
            }
            router.replace('/');
          }}
          className="mb-6 h-9 w-9 items-center justify-center rounded-full bg-white/10">
          <Ionicons name="chevron-back" size={18} color="#ffffff" />
        </TouchableOpacity>

        <View className="mb-3 h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
          <Ionicons name="trending-up-outline" size={20} color="#ffffff" />
        </View>

        <Text className="text-2xl font-bold text-white">Input Kenaikan</Text>
        <Text className="mt-1 text-sm text-stone-300">
          Catat hasil ujian kenaikan tingkat anggota
        </Text>
      </View>

      <View className="flex-1 px-5">
        {/* Data Utama */}
        <View className="-mt-5 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <FieldLabel text="ANGGOTA" />
          <View className="mb-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
            <Picker
              selectedValue={selectedUser}
              onValueChange={setSelectedUser}
              style={{ color: isDark ? '#f5f5f4' : '#1c1917' }}
              dropdownIconColor={isDark ? '#d6d3d1' : '#78716c'}>
              <Picker.Item label="Pilih Anggota..." value={null} />
              {users.map((u) => (
                <Picker.Item
                  key={u.id}
                  label={u.nomor_anggota ? `${u.nomor_anggota} - ${u.name}` : u.name}
                  value={u.id}
                />
              ))}
            </Picker>
          </View>

          <FieldLabel text="TINGKATAN" />
          <View className="mb-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
            <Picker
              selectedValue={selectedTingkatan}
              onValueChange={setSelectedTingkatan}
              style={{ color: isDark ? '#f5f5f4' : '#1c1917' }}
              dropdownIconColor={isDark ? '#d6d3d1' : '#78716c'}>
              <Picker.Item label="Pilih Tingkatan..." value={null} />
              {tingkatans.map((t) => (
                <Picker.Item key={t.id} label={t.nama_tingkatan} value={t.id} />
              ))}
            </Picker>
          </View>

          <FieldLabel text="TANGGAL KENAIKAN" />
          <TouchableOpacity
            className="mb-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
            onPress={() => setShowDatePicker(true)}>
            <Text
              className={`text-sm ${
                tanggal ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
              }`}>
              {tanggal || 'Pilih tanggal kenaikan'}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={tanggal ? new Date(tanggal) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onValueChange={onDateChange}
              onDismiss={() => setShowDatePicker(false)}
            />
          )}
        </View>

        {/* Nilai */}
        <View className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Text className="mb-3 text-sm font-bold text-stone-800 dark:text-stone-100">
            Penilaian
          </Text>
          <View className="-mx-1.5 flex-row flex-wrap">
            <NilaiInput
              label="Tes Tulis"
              value={nilai.tes_tulis}
              onChangeText={(t) => setNilai({ ...nilai, tes_tulis: t })}
            />
            <NilaiInput
              label="Senam & Jurus"
              value={nilai.tes_senam_jurus}
              onChangeText={(t) => setNilai({ ...nilai, tes_senam_jurus: t })}
            />
            <NilaiInput
              label="Mental"
              value={nilai.tes_mental}
              onChangeText={(t) => setNilai({ ...nilai, tes_mental: t })}
            />
            <NilaiInput
              label="Kehadiran"
              value={nilai.kehadiran}
              onChangeText={(t) => setNilai({ ...nilai, kehadiran: t })}
            />
          </View>
        </View>

        {/* Status & Catatan */}
        <View className="mb-5 mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <FieldLabel text="CATATAN" optional />
          <TextInput
            className="mb-4 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-800 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
            placeholder="Catatan tambahan"
            placeholderTextColor="#a8a29e"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
            style={{ minHeight: 60 }}
            value={catatan}
            onChangeText={setCatatan}
          />

          <FieldLabel text="STATUS" />
          <View className="mb-1 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
            <Picker
              selectedValue={status}
              onValueChange={setStatus}
              style={{ color: isDark ? '#f5f5f4' : '#1c1917' }}
              dropdownIconColor={isDark ? '#d6d3d1' : '#78716c'}>
              <Picker.Item label="Proses" value="proses" />
              <Picker.Item label="Lulus" value="lulus" />
              <Picker.Item label="Tidak Lulus" value="tidak_lulus" />
            </Picker>
          </View>
        </View>

        <Button
          className="mb-8 w-full bg-amber-700 active:opacity-90"
          size="lg"
          onPress={handleSubmit}
          disabled={loading}>
          <Text className="font-semibold text-white">
            {loading ? 'Menyimpan...' : 'Simpan Data Kenaikan'}
          </Text>
        </Button>
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
        placeholder="0"
        placeholderTextColor="#a8a29e"
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
}
