import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
  ActivityIndicator,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';

interface UserOption {
  id: number;
  name: string;
  nomor_anggota?: string;
  tingkatan_id?: number;
  tingkatan?: {
    id: number;
    nama_tingkatan: string;
    urutan: number;
  } | null;
  kenaikan_tingkats?: Array<{
    id: number;
    tingkatan_id: number;
    status: string;
    tanggal_kenaikan: string;
    tingkatan?: {
      id: number;
      nama_tingkatan: string;
      urutan: number;
    } | null;
  }>;
}

interface TingkatanOption {
  id: number;
  nama_tingkatan: string;
  urutan: number;
}

interface TingkatanResponse {
  tingkatan_sekarang: TingkatanOption | null;
  tingkatan_berikutnya: TingkatanOption | null;
  semua_tingkatan: TingkatanOption[];
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
  const [loadingTingkatan, setLoadingTingkatan] = useState(false);
  const [infoTingkatan, setInfoTingkatan] = useState<{
    sekarang: string;
    berikutnya: string;
  } | null>(null);
  const [rataRata, setRataRata] = useState<number | null>(null);
  const isDark = useColorScheme() === 'dark';

  // Reset form function
  const resetForm = useCallback(() => {
    setSelectedUser(null);
    setSelectedTingkatan(null);
    setTanggal('');
    setShowDatePicker(false);
    setStatus('proses');
    setNilai({
      tes_tulis: '',
      tes_senam_jurus: '',
      tes_mental: '',
      kehadiran: '',
    });
    setCatatan('');
    setLoading(false);
    setLoadingTingkatan(false);
    setInfoTingkatan(null);
    setRataRata(null);
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [usersRes, tingkatanRes] = await Promise.all([
        api.get('/users?status=aktif'),
        api.get('/tingkatan'),
      ]);
      
      setUsers(usersRes.data);
      // Sort tingkatan berdasarkan urutan
      const sortedTingkatan = [...tingkatanRes.data].sort((a, b) => a.urutan - b.urutan);
      setTingkatans(sortedTingkatan);
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  }, []);

  // Gunakan useFocusEffect untuk mereset form dan memuat ulang data setiap kali halaman fokus
  useFocusEffect(
    useCallback(() => {
      // Reset form setiap kali halaman mendapat fokus
      resetForm();
      
      // Muat ulang data
      loadInitialData();
      
      // Cleanup function
      return () => {
        // Pastikan date picker tertutup saat meninggalkan halaman
        setShowDatePicker(false);
      };
    }, [resetForm, loadInitialData])
  );

  // Effect untuk menghitung rata-rata dan status secara otomatis
  useEffect(() => {
    const nilaiArray = [
      parseInt(nilai.tes_tulis) || 0,
      parseInt(nilai.tes_senam_jurus) || 0,
      parseInt(nilai.tes_mental) || 0,
      parseInt(nilai.kehadiran) || 0,
    ];
    
    // Filter nilai yang valid (lebih dari 0)
    const validNilai = nilaiArray.filter(n => n > 0);
    
    if (validNilai.length > 0) {
      const avg = validNilai.reduce((sum, n) => sum + n, 0) / validNilai.length;
      const roundedAvg = Math.round(avg * 100) / 100;
      setRataRata(roundedAvg);
      
      // Set status otomatis berdasarkan rata-rata
      if (roundedAvg < 60) {
        setStatus('tidak_lulus');
      } else {
        setStatus('lulus');
      }
    } else {
      setRataRata(null);
      setStatus('proses');
    }
  }, [nilai.tes_tulis, nilai.tes_senam_jurus, nilai.tes_mental, nilai.kehadiran]);

  const handleUserChange = async (userId: number | null) => {
    setSelectedUser(userId);
    setSelectedTingkatan(null);
    setInfoTingkatan(null);
    
    if (!userId) return;
    
    setLoadingTingkatan(true);
    try {
      // Gunakan endpoint khusus untuk mendapatkan tingkatan berikutnya
      const response = await api.get<TingkatanResponse>(`/users/${userId}/tingkatan-berikutnya`);
      console.log('Tingkatan response:', response.data);
      
      const data = response.data;
      
      // Set tingkatan berikutnya secara otomatis
      if (data.tingkatan_berikutnya) {
        setSelectedTingkatan(data.tingkatan_berikutnya.id);
        setInfoTingkatan({
          sekarang: data.tingkatan_sekarang?.nama_tingkatan || 'Belum ada',
          berikutnya: data.tingkatan_berikutnya.nama_tingkatan,
        });
      } else {
        // Jika tidak ada tingkatan berikutnya (sudah paling tinggi)
        Alert.alert(
          'Info',
          'Anggota ini sudah berada di tingkatan tertinggi',
          [{ text: 'OK' }]
        );
        setInfoTingkatan({
          sekarang: data.tingkatan_sekarang?.nama_tingkatan || 'Tidak diketahui',
          berikutnya: 'Sudah tertinggi',
        });
      }
    } catch (error: any) {
      console.error('Error fetching tingkatan:', error);
      
      // Fallback: coba gunakan data dari state users
      const selectedUserData = users.find(u => u.id === userId);
      if (selectedUserData) {
        let currentTingkatan = selectedUserData.tingkatan;
        
        // Jika tidak ada tingkatan langsung, cek dari kenaikan_tingkats
        if (!currentTingkatan && selectedUserData.kenaikan_tingkats?.length > 0) {
          const lastKenaikan = selectedUserData.kenaikan_tingkats[0];
          if (lastKenaikan.tingkatan) {
            currentTingkatan = lastKenaikan.tingkatan;
          }
        }
        
        if (currentTingkatan) {
          const nextTingkatan = tingkatans.find(t => t.urutan > currentTingkatan!.urutan);
          if (nextTingkatan) {
            setSelectedTingkatan(nextTingkatan.id);
            setInfoTingkatan({
              sekarang: currentTingkatan.nama_tingkatan,
              berikutnya: nextTingkatan.nama_tingkatan,
            });
          } else {
            setInfoTingkatan({
              sekarang: currentTingkatan.nama_tingkatan,
              berikutnya: 'Sudah tertinggi',
            });
          }
        } else {
          // Jika belum ada tingkatan, pilih yang pertama
          if (tingkatans.length > 0) {
            setSelectedTingkatan(tingkatans[0].id);
            setInfoTingkatan({
              sekarang: 'Belum ada',
              berikutnya: tingkatans[0].nama_tingkatan,
            });
          }
        }
      } else {
        Alert.alert('Error', 'Gagal memuat data tingkatan');
      }
    } finally {
      setLoadingTingkatan(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedTingkatan || !tanggal) {
      Alert.alert('Lengkapi data', 'Anggota, tingkatan, dan tanggal wajib diisi');
      return;
    }
    
    // Validasi nilai
    if (rataRata === null) {
      Alert.alert('Lengkapi data', 'Nilai wajib diisi minimal satu');
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
      Alert.alert(
        'Berhasil', 
        'Data kenaikan disimpan',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form setelah berhasil simpan
              resetForm();
              
              // Kembali ke halaman sebelumnya
              if (router.canGoBack()) {
                router.back();
              } else {
                router.replace('/');
              }
            }
          }
        ]
      );
    } catch (e: any) {
      Alert.alert('Gagal', e.response?.data?.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Handler untuk DateTimePicker
  const onDateChange = (event: any, selectedDate?: Date) => {
    // Untuk Android, date picker akan otomatis tertutup setelah memilih
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    
    if (event.type === 'set' && selectedDate) {
      const isoDate = selectedDate.toISOString().split('T')[0];
      setTanggal(isoDate);
    }
  };

  // Helper untuk mendapatkan label status
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

  // Helper untuk mendapatkan warna status
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
              onValueChange={handleUserChange}
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

          {/* Info Tingkatan */}
          {infoTingkatan && (
            <View className="mb-4 rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
              <Text className="text-xs text-amber-800 dark:text-amber-200">
                Tingkatan sekarang: <Text className="font-bold">{infoTingkatan.sekarang}</Text>
              </Text>
              <Text className="mt-1 text-xs text-amber-800 dark:text-amber-200">
                Akan naik ke: <Text className="font-bold">{infoTingkatan.berikutnya}</Text>
              </Text>
            </View>
          )}

          <FieldLabel text="TINGKATAN" />
          <View className="mb-4 overflow-hidden rounded-xl border border-stone-200 bg-stone-50 dark:border-stone-700 dark:bg-stone-800">
            {loadingTingkatan ? (
              <View className="h-12 items-center justify-center">
                <ActivityIndicator size="small" color={isDark ? '#fbbf24' : '#b45309'} />
              </View>
            ) : (
              <Picker
                selectedValue={selectedTingkatan}
                onValueChange={setSelectedTingkatan}
                enabled={!loadingTingkatan}
                style={{ color: isDark ? '#f5f5f4' : '#1c1917' }}
                dropdownIconColor={isDark ? '#d6d3d1' : '#78716c'}>
                <Picker.Item label="Pilih Tingkatan..." value={null} />
                {tingkatans.map((t) => (
                  <Picker.Item 
                    key={t.id} 
                    label={t.nama_tingkatan} 
                    value={t.id} 
                  />
                ))}
              </Picker>
            )}
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
          
          {/* DateTimePicker hanya dirender ketika showDatePicker true */}
          {showDatePicker && (
            <DateTimePicker
              value={tanggal ? new Date(tanggal) : new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={onDateChange}
            />
          )}
        </View>

        {/* Nilai */}
        <View className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <Text className="mb-3 text-sm font-bold text-stone-800 dark:text-stone-100">
            Penilaian
          </Text>
          
          {/* Info Rata-rata */}
          {rataRata !== null && (
            <View className={`mb-3 rounded-lg p-3 ${
              rataRata < 60 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30'
            }`}>
              <Text className={`text-sm font-bold ${
                rataRata < 60 ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'
              }`}>
                Rata-rata: {rataRata}
              </Text>
              <Text className={`text-xs mt-1 ${
                rataRata < 60 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
              }`}>
                Status: {getStatusLabel(status)}
              </Text>
            </View>
          )}
          
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

          {/* <FieldLabel text="STATUS" />
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
          </View> */}
          
          {/* Info status otomatis */}
          {rataRata !== null && (
            <Text className={`mt-2 text-xs ${getStatusColor(status)}`}>
              Status terisi otomatis berdasarkan rata-rata nilai (di bawah 60 = Tidak Lulus)
            </Text>
          )}
        </View>

        <Button
          className="mb-8 w-full bg-amber-700 active:opacity-90"
          size="lg"
          onPress={handleSubmit}
          disabled={loading || loadingTingkatan}>
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