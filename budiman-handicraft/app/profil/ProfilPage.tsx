'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

export default function ProfilPage() {
  const router = useRouter();
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pesanSukses, setPesanSukses] = useState('');
  const [pesanError, setPesanError] = useState('');

  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [namaLengkap, setNamaLengkap] = useState('');
  const [nomorHp, setNomorHp] = useState('');
  const [alamatDefault, setAlamatDefault] = useState('');

  useEffect(() => {
    const fetchProfil = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.user) {
        router.push('/login');
        return;
      }

      setUserId(session.user.id);
      setEmail(session.user.email || '');

      const { data: profil } = await supabase
        .from('profil_pelanggan')
        .select('nama_lengkap, nomor_hp, alamat_default')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profil) {
        setNamaLengkap(profil.nama_lengkap || '');
        setNomorHp(profil.nomor_hp || '');
        setAlamatDefault(profil.alamat_default || '');
      }

      setIsLoading(false);
    };

    fetchProfil();
  }, [router, supabase]);

  const handleSimpan = async (e: React.FormEvent) => {
    e.preventDefault();
    setPesanSukses('');
    setPesanError('');
    setIsSaving(true);

    try {
      if (!userId) throw new Error('Sesi tidak valid');

      const { error } = await supabase
        .from('profil_pelanggan')
        .upsert({
          id: userId,
          nama_lengkap: namaLengkap,
          nomor_hp: nomorHp,
          alamat_default: alamatDefault,
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (error) throw error;

      setPesanSukses('Profil berhasil diperbarui!');
    } catch (error: any) {
      setPesanError(error.message || 'Gagal menyimpan profil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    const konfirmasi = confirm('Apakah Anda yakin ingin keluar?');
    if (!konfirmasi) return;
    localStorage.removeItem('keranjang_umkm');
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-[#faf9f5] flex items-center justify-center font-sans">
        <span className="text-gray-500 animate-pulse">Memuat profil...</span>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf9f5] pt-28 pb-20 px-4 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Heading */}
        <div className="mb-10 text-center">
          <span className="text-[#df9e3d] font-bold text-xs tracking-[0.2em] uppercase">Akun Anda</span>
          <h1 className="text-3xl font-serif font-bold text-gray-900 mt-2">Pengaturan Profil</h1>
        </div>

        {/* Card */}
        <div className="bg-white shadow-lg rounded-sm overflow-hidden border border-gray-100">
          {/* Header strip */}
          <div className="bg-[#161616] p-6 text-white flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">Email Terdaftar</p>
              <p className="font-bold text-lg">{email}</p>
            </div>
            <div className="w-10 h-10 bg-[#d77723] rounded-full flex items-center justify-center text-white font-bold text-sm">
              {namaLengkap ? namaLengkap.charAt(0).toUpperCase() : '?'}
            </div>
          </div>

          <form onSubmit={handleSimpan} className="p-8 space-y-6">
            {pesanSukses && (
              <div className="px-4 py-3 bg-green-50 border border-green-200 rounded-sm text-green-700 text-sm font-medium">
                {pesanSukses}
              </div>
            )}
            {pesanError && (
              <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-sm text-red-700 text-sm font-medium">
                {pesanError}
              </div>
            )}

            {/* Nama Lengkap */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Nama Lengkap</label>
              <input
                type="text"
                value={namaLengkap}
                onChange={(e) => setNamaLengkap(e.target.value)}
                placeholder="Nama sesuai KTP / penerima"
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            {/* Nomor HP */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Nomor WhatsApp / HP</label>
              <input
                type="tel"
                value={nomorHp}
                onChange={(e) => setNomorHp(e.target.value)}
                placeholder="0812xxxxxx"
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition"
              />
            </div>

            {/* Alamat Default */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2 italic">Alamat Pengiriman Default</label>
              <textarea
                rows={3}
                value={alamatDefault}
                onChange={(e) => setAlamatDefault(e.target.value)}
                placeholder="Jl. Contoh No. 123, Kelurahan, Kecamatan, Kota"
                className="text-black w-full bg-[#f0f0f0] p-3 text-sm outline-none rounded-sm border border-transparent focus:border-gray-300 transition resize-none"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#d77723] hover:bg-[#c2662b] text-white font-bold py-3.5 rounded-sm uppercase tracking-widest text-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
          </form>

          {/* Divider */}
          <div className="border-t border-gray-100 px-8 py-6 space-y-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Keamanan Akun</h3>
            <Link
              href="/login/ganti-password"
              className="block w-full text-center py-3 border-2 border-gray-900 text-gray-900 font-bold text-xs uppercase tracking-widest hover:bg-gray-900 hover:text-white transition rounded-sm"
            >
              Ganti Password
            </Link>
          </div>

          {/* Logout */}
          <div className="border-t border-gray-100 px-8 py-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 border-2 border-red-500 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500 hover:text-white transition rounded-sm cursor-pointer"
            >
              Keluar (Logout)
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
