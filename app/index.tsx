import { View, Text, ScrollView, Image } from 'react-native';
import { Link } from 'expo-router';
import { Button } from '~/components/ui/button';

export default function Welcome() {
  return (
    <ScrollView
      className="flex-1 bg-stone-50 dark:bg-stone-950"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="pb-10">
      {/* ===== HERO SECTION ===== */}
      <View className="relative overflow-hidden bg-stone-800 px-6 pb-14 pt-16 dark:bg-stone-900">
        {/* Dekorasi */}
        <View className="absolute -right-14 -top-10 h-48 w-48 rounded-full bg-amber-700/20" />
        <View className="absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-stone-700/30 dark:bg-stone-800/40" />

        <View className="items-center">
          <View className="mb-5 h-20 w-20 items-center justify-center rounded-2xl border border-white/15 bg-white/10 p-2">
            <Image className="h-full w-full" source={require('../assets/images/logo.png')} />
          </View>

          <Text className="text-xs font-medium tracking-widest text-amber-500">
            SELAMAT DATANG DI
          </Text>
          <Text className="mt-2 text-center text-2xl font-bold text-white">
            PSHT Ranting{'\n'}Guluk-Guluk
          </Text>
          <Text className="mt-3 text-center text-sm leading-5 text-stone-300">
            Persaudaraan Setia Hati Terate{'\n'}Sistem Informasi Anggota & Kenaikan Kelas
          </Text>

          <View className="mt-7 w-full gap-3">
            <Link href="/login" asChild>
              <Button className="w-full bg-amber-700 active:opacity-90" size="lg">
                <Text className="font-semibold text-white">Masuk</Text>
              </Button>
            </Link>
            <Link href="/register" asChild>
              <Button
                variant="outline"
                className="w-full border-stone-500 bg-transparent"
                size="lg">
                <Text className="font-medium text-stone-100">Daftar Anggota</Text>
              </Button>
            </Link>
          </View>
        </View>
      </View>

      {/* ===== STATS SECTION ===== */}
      <View className="-mt-7 flex-row justify-center px-6">
        <View className="w-full flex-row justify-between rounded-2xl border border-stone-200 bg-white px-4 py-5 shadow-sm shadow-stone-300 dark:border-stone-800 dark:bg-stone-900 dark:shadow-none">
          <StatItem label="Anggota" value="240+" />
          <Divider />
          <StatItem label="Tingkat" value="4" />
          <Divider />
          <StatItem label="Berdiri" value="1990" />
        </View>
      </View>

      {/* ===== TENTANG SECTION ===== */}
      <View className="mt-10 px-6">
        <SectionTitle title="Tentang Kami" subtitle="Sekilas mengenai ranting kami" />
        <Text className="text-sm leading-6 text-stone-600 dark:text-stone-400">
          PSHT Ranting Guluk-Guluk adalah bagian dari Persaudaraan Setia Hati Terate yang membina
          generasi muda melalui latihan pencak silat, pendidikan budi pekerti, dan persaudaraan.
          Aplikasi ini hadir untuk memudahkan pengelolaan data keanggotaan dan pemantauan riwayat
          kenaikan tingkat secara digital.
        </Text>
      </View>

      {/* ===== VISI MISI SECTION ===== */}
      <View className="mt-10 px-6">
        <SectionTitle title="Visi & Misi" subtitle="Landasan gerak organisasi" />

        <View className="mb-3 flex-row gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Text>🎯</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-stone-800 dark:text-stone-100">
              Visi
            </Text>
            <Text className="text-sm leading-5 text-stone-500 dark:text-stone-400">
              Menjadi wadah pembinaan pesilat yang berbudi luhur, tangguh, dan berakhlak mulia.
            </Text>
          </View>
        </View>

        <View className="flex-row gap-3 rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
          <View className="h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
            <Text>🤝</Text>
          </View>
          <View className="flex-1">
            <Text className="mb-1 text-sm font-semibold text-stone-800 dark:text-stone-100">
              Misi
            </Text>
            <Text className="text-sm leading-5 text-stone-500 dark:text-stone-400">
              Melatih, mendidik, dan mempersatukan anggota dalam semangat persaudaraan sejati.
            </Text>
          </View>
        </View>
      </View>

      {/* ===== FITUR SECTION ===== */}
      <View className="mt-10 px-6">
        <SectionTitle title="Fitur Aplikasi" subtitle="Layanan yang tersedia untuk anggota" />

        <View className="flex-row flex-wrap justify-between">
          <FeatureCard icon="📋" title="Data Anggota" desc="Kelola profil & biodata" />
          <FeatureCard icon="📈" title="Kenaikan Tingkat" desc="Riwayat & jadwal ujian" />
          <FeatureCard icon="🏆" title="Sertifikat" desc="Riwayat kelulusan tingkat" />
          <FeatureCard icon="🔍" title="Cek Anggota" desc="Verifikasi status anggota" />
        </View>
      </View>

      {/* ===== CTA SECTION ===== */}
      <View className="mx-6 mt-10 items-center rounded-2xl border border-stone-800 bg-stone-800 px-6 py-8 dark:border-stone-800 dark:bg-stone-900">
        <Text className="mb-1 text-center text-base font-bold text-white">
          Belum Terdaftar Sebagai Anggota?
        </Text>
        <Text className="mb-5 text-center text-xs leading-5 text-stone-300">
          Daftarkan diri Anda dan mulai perjalanan sebagai anggota{'\n'}PSHT Ranting Guluk-Guluk
        </Text>
        <Link href="/register" asChild>
          <Button className="bg-amber-700 px-8 active:opacity-90" size="lg">
            <Text className="font-semibold text-white">Daftar Sekarang</Text>
          </Button>
        </Link>
      </View>

      {/* ===== CEK ANGGOTA LINK ===== */}
      <View className="mt-8 items-center">
        <Link href="/cek-anggota">
          <Text className="text-sm font-medium text-stone-500 underline underline-offset-2 dark:text-stone-400">
            Cek Data Keanggotaan
          </Text>
        </Link>
      </View>

      {/* ===== FOOTER ===== */}
      <View className="mt-10 items-center px-6">
        <View className="mb-2 h-px w-16 bg-stone-300 dark:bg-stone-800" />
        <Text className="text-xs text-stone-400 dark:text-stone-600">
          © 2026 PSHT Ranting Guluk-Guluk
        </Text>
      </View>
    </ScrollView>
  );
}

/* ===== Sub Components ===== */

function SectionTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <View className="mb-4">
      <Text className="text-lg font-bold text-stone-800 dark:text-stone-100">{title}</Text>
      <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{subtitle}</Text>
    </View>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="text-lg font-bold text-stone-800 dark:text-stone-100">{value}</Text>
      <Text className="mt-0.5 text-xs text-stone-500 dark:text-stone-400">{label}</Text>
    </View>
  );
}

function Divider() {
  return <View className="w-px bg-stone-200 dark:bg-stone-800" />;
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <View className="mb-3 w-[48%] rounded-2xl border border-stone-200 bg-white p-4 dark:border-stone-800 dark:bg-stone-900">
      <View className="mb-2 h-9 w-9 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
        <Text>{icon}</Text>
      </View>
      <Text className="mb-0.5 text-sm font-semibold text-stone-800 dark:text-stone-100">
        {title}
      </Text>
      <Text className="text-xs leading-4 text-stone-500 dark:text-stone-400">{desc}</Text>
    </View>
  );
}
