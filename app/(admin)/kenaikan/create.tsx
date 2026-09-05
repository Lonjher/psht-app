import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  useColorScheme,
  ActivityIndicator,
  KeyboardAvoidingView,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import api from '@/services/api';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/Alert';

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

interface AlertState {
  show: boolean;
  variant: 'success' | 'error' | 'warning' | 'info';
  title: string;
  description?: string;
}

function getCurrentTingkatan(user: UserOption) {
  // Prioritas 1: Cek tingkatan langsung dari user
  if (user.tingkatan) {
    return user.tingkatan;
  }

  // Prioritas 2: Cek dari kenaikan_tingkats yang LULUS dan urutkan berdasarkan urutan
  if (user.kenaikan_tingkats && user.kenaikan_tingkats.length > 0) {
    // Filter yang lulus
    const lulusKenaikan = user.kenaikan_tingkats.filter(k => k.status === 'lulus');

    if (lulusKenaikan.length > 0) {
      // Urutkan berdasarkan urutan tingkatan (descending)
      const sortedKenaikan = [...lulusKenaikan].sort((a, b) => {
        const urutanA = a.tingkatan?.urutan ?? 0;
        const urutanB = b.tingkatan?.urutan ?? 0;
        return urutanB - urutanA;
      });

      return sortedKenaikan[0]?.tingkatan ?? null;
    }
  }

  return null;
}

export default function CreateKenaikan() {
  const [users, setUsers] = useState<UserOption[]>([]);
  const [tingkatans, setTingkatans] = useState<TingkatanOption[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [selectedTingkatan, setSelectedTingkatan] = useState<number | null>(null);
  const [selectedTingkatanLabel, setSelectedTingkatanLabel] = useState<string>('');
  const [tanggal, setTanggal] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [status, setStatus] = useState('proses');
  const [nilai, setNilai] = useState({
    tes_tulis: '',
    tes_senam_jurus: '',
    tes_mental: '',
    kehadiran: '',
  });
  const [customAlert, setCustomAlert] = useState<AlertState>({
    show: false,
    variant: 'info',
    title: '',
    description: '',
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
  const showAlert = (
    variant: 'success' | 'error' | 'warning' | 'info',
    title: string,
    description?: string
  ) => {
    console.log('showAlert called:', { variant, title, description });
    setCustomAlert({ show: true, variant, title, description });
  };

  // Reset form function
  const resetForm = useCallback(() => {
    setSelectedUser(null);
    setSelectedTingkatan(null);
    setSelectedTingkatanLabel('');
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
    setCustomAlert({ show: false, variant: 'info', title: '', description: '' });
  }, []);

  // Load initial data
  const loadInitialData = useCallback(async () => {
    try {
      const [usersRes, tingkatanRes] = await Promise.all([
        api.get('/users?status=aktif'),
        api.get('/tingkatan'),
      ]);


      // Sort tingkatan berdasarkan urutan (ascending)
      const sortedTingkatan = [...tingkatanRes.data].sort((a, b) => a.urutan - b.urutan);
      setTingkatans(sortedTingkatan);


      // Filter user yang belum mencapai tingkatan tertinggi (Putih)
      const eligibleUsers = usersRes.data.filter((user: UserOption) => {
        const currentTingkatan = getCurrentTingkatan(user);

        // Jika tidak ada tingkatan, tetap tampilkan (belum ada tingkatan)
        if (!currentTingkatan) return true;

        // Jika tingkatan tertinggi adalah Putih (urutan 5), jangan tampilkan
        return currentTingkatan.nama_tingkatan?.trim().toLowerCase() !== 'putih';
      });

      setUsers(eligibleUsers);
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
    const validNilai = nilaiArray.filter((n) => n > 0);

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
    setSelectedTingkatanLabel('');
    setInfoTingkatan(null);

    if (!userId) return;

    setLoadingTingkatan(true);
    try {
      // Cari user yang dipilih
      const selectedUserData = users.find((u) => u.id === userId);

      if (!selectedUserData) {
        showAlert('error', 'Gagal', 'Data user tidak ditemukan');
        return;
      }

      // Dapatkan tingkatan saat ini dari data user
      const currentTingkatan = getCurrentTingkatan(selectedUserData);


      // Tentukan tingkatan berikutnya
      let nextTingkatan = null;

      if (!currentTingkatan) {
        // Jika belum ada tingkatan, pilih yang pertama (Polos)
        nextTingkatan = tingkatans.length > 0 ? tingkatans[0] : null;
      } else {
        // Cari tingkatan berikutnya berdasarkan urutan
        nextTingkatan = tingkatans.find((t) => t.urutan > currentTingkatan.urutan) || null;
      }


      if (nextTingkatan) {
        setSelectedTingkatan(nextTingkatan.id);
        setSelectedTingkatanLabel(nextTingkatan.nama_tingkatan);
        setInfoTingkatan({
          sekarang: currentTingkatan?.nama_tingkatan || 'Belum ada',
          berikutnya: nextTingkatan.nama_tingkatan,
        });
      } else {
        // Jika tidak ada tingkatan berikutnya (sudah paling tinggi)
        showAlert('info', 'Info', 'Anggota ini sudah berada di tingkatan tertinggi');
        setInfoTingkatan({
          sekarang: currentTingkatan?.nama_tingkatan || 'Tidak diketahui',
          berikutnya: 'Sudah tertinggi',
        });
      }
    } catch (error: any) {
      console.error('Error handling user change:', error);
      showAlert('error', 'Gagal', 'Gagal memuat data tingkatan');
    } finally {
      setLoadingTingkatan(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedUser || !selectedTingkatan || !tanggal) {
      showAlert('warning', 'Data Belum Lengkap', 'Anggota, tingkatan, dan tanggal wajib diisi');
      return;
    }

    // Validasi nilai
    if (rataRata === null) {
      showAlert('warning', 'Data Belum Lengkap', 'Nilai wajib diisi minimal satu');
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
      showAlert('success', 'Berhasil', 'Data kenaikan berhasil disimpan');
      setTimeout(() => {
        resetForm();
        router.replace('/kenaikan');
      }, 1500);
    } catch (e: any) {
      showAlert('error', 'Gagal', e.response?.data?.message ?? 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  // Handler khusus untuk onValueChange
  const onValueChange = (event: any) => {

    let dateToUse: Date | undefined;

    // Cek jika event adalah Date object langsung
    if (event instanceof Date) {
      dateToUse = event;
    }
    // Cek jika event memiliki nativeEvent.timestamp
    else if (event?.nativeEvent?.timestamp) {
      dateToUse = new Date(event.nativeEvent.timestamp);
    }
    // Cek jika event memiliki timestamp langsung
    else if (event?.timestamp) {
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

      setTanggal(formattedDate);
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
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}>
      <ScrollView
        className="flex-1 bg-stone-50 dark:bg-stone-950"
        contentContainerClassName="flex-grow"
        keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View className="bg-stone-800 px-5 pb-8 pt-14 dark:bg-stone-900">
          <TouchableOpacity
            onPress={() => router.replace('/kenaikan')}
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
          {customAlert.show && (
            <View className="mb-4 mt-3">
              <Alert
                variant={customAlert.variant}
                title={customAlert.title}
                description={customAlert.description}
                onClose={() => setCustomAlert((prev) => ({ ...prev, show: false }))}
              />
            </View>
          )}

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
                {users.map((u) => {
                  const currentTingkatan = getCurrentTingkatan(u);
                  const tingkatanLabel = currentTingkatan?.nama_tingkatan || 'Belum ada';
                  return (
                    <Picker.Item
                      key={u.id}
                      label={
                        u.nomor_anggota
                          ? `${u.nomor_anggota} - ${u.name} [${tingkatanLabel}]`
                          : `${u.name} [${tingkatanLabel}]`
                      }
                      value={u.id}
                    />
                  );
                })}
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

            <FieldLabel text="TINGKATAN TUJUAN" />
            <View className="mb-4 flex-row items-center rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800">
              {loadingTingkatan ? (
                <ActivityIndicator size="small" color={isDark ? '#fbbf24' : '#b45309'} />
              ) : (
                <>
                  <Ionicons
                    name="ribbon-outline"
                    size={16}
                    color={isDark ? '#a8a29e' : '#78716c'}
                  />
                  <Text
                    className={`ml-2 flex-1 text-sm ${selectedTingkatanLabel
                      ? 'font-semibold text-stone-800 dark:text-stone-100'
                      : 'text-stone-400'
                      }`}>
                    {selectedTingkatanLabel || 'Pilih anggota terlebih dahulu'}
                  </Text>
                </>
              )}
            </View>

            <FieldLabel text="TANGGAL KENAIKAN" />
            <TouchableOpacity
              className="mb-1 rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 dark:border-stone-700 dark:bg-stone-800"
              onPress={() => {
                setShowDatePicker(true);
              }}>
              <View className="flex-row items-center justify-between">
                <Text
                  className={`text-sm ${tanggal ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
                    }`}>
                  {tanggal || 'Pilih tanggal kenaikan'}
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
                  value={tanggal ? new Date(tanggal + 'T00:00:00') : new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onValueChange={onValueChange}
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
          </View>

          {/* Nilai */}
          <View className="mt-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
            <Text className="mb-3 text-sm font-bold text-stone-800 dark:text-stone-100">
              Penilaian
            </Text>

            {/* Info Rata-rata */}
            {rataRata !== null && (
              <View
                className={`mb-3 rounded-lg p-3 ${rataRata < 60 ? 'bg-red-50 dark:bg-red-950/30' : 'bg-green-50 dark:bg-green-950/30'
                  }`}>
                <Text
                  className={`text-sm font-bold ${rataRata < 60
                    ? 'text-red-700 dark:text-red-400'
                    : 'text-green-700 dark:text-green-400'
                    }`}>
                  Rata-rata: {rataRata}
                </Text>
                <Text
                  className={`mt-1 text-xs ${rataRata < 60
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-green-600 dark:text-green-400'
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
    </KeyboardAvoidingView>
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