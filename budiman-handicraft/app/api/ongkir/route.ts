import { NextResponse } from 'next/server';
import axios from 'axios';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://rajaongkir.komerce.id/api/v1';
// NOTE: Origin dikirim dari client (market page). Karena Raja Ongkir
// free tier hanya support tingkat kabupaten (bukan kecamatan/desa),
// origin di-hardcode ke ID kabupaten (45363 = Kab. Bandung), bukan
// lokasi toko aktual di Cileunyi.

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');

  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key tidak ditemukan' }, { status: 500 });
  }

  try {
    if (search && search.length >= 3) {
      const response = await axios.get(`${BASE_URL}/destination/domestic-destination?search=${search}`, {
        headers: { 'key': API_KEY, 'Accept': 'application/json' },
        timeout: 10000
      });
      return NextResponse.json(response.data.data);
    }
    return NextResponse.json([]);
  } catch (error: any) {
    console.error(">>> ERROR GET ALAMAT KOMERCE:", error.message);
    return NextResponse.json({ error: 'Gagal mencari alamat' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key tidak ditemukan' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { origin, destination, weight, courier } = body;

    if (!origin || !destination || !weight || !courier) {
      return NextResponse.json({ error: 'Parameter tidak lengkap (origin, destination, weight, courier)' }, { status: 400 });
    }

    const formData = new URLSearchParams({
      origin: String(origin),
      destination: String(destination),
      weight: String(weight),
      courier: String(courier)
    });

    const response = await axios.post(`${BASE_URL}/calculate/domestic-cost`, formData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'key': API_KEY
      },
      timeout: 10000
    });

    if (response.data?.status?.code !== 200) {
      const message = response.data?.status?.description || 'Gagal menghitung ongkos kirim';
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const ongkirData = response.data?.data || [];
    const hasil = ongkirData.flatMap((courierResult: any) => 
      (courierResult.costs || []).filter((opt: any) => opt.service !== 'JTR')
    );

    if (hasil.length === 0) {
      return NextResponse.json({ error: 'Tidak ada layanan pengiriman untuk rute ini' }, { status: 404 });
    }

    return NextResponse.json({ data: hasil });
  } catch (error: any) {
    console.error(">>> ERROR POST ONGKIR KOMERCE:", error.response?.data || error.message);
    return NextResponse.json({ error: 'Gagal menghitung ongkos kirim' }, { status: 500 });
  }
}