import { NextResponse } from 'next/server';
import axios from 'axios';
import https from 'https';

export const dynamic = 'force-dynamic';

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://api.rajaongkir.com/starter';
const httpsAgent = new https.Agent({ family: 4 });

const axiosConfig = {
  headers: {
    'key': API_KEY as string,
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    'Accept': 'application/json'
  },
  timeout: 15000,
  httpsAgent: httpsAgent
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const province = searchParams.get('province');

  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key tidak ditemukan' }, { status: 500 });
  }

  try {
    if (type === 'province') {
      const response = await axios.get(`${BASE_URL}/province`, axiosConfig);
      return NextResponse.json(response.data.rajaongkir.results);
    }

    if (type === 'city') {
      const response = await axios.get(`${BASE_URL}/city?province=${province}`, axiosConfig);
      return NextResponse.json(response.data.rajaongkir.results);
    }

    return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
  } catch (error: any) {
    console.error(">>> ERROR AXIOS GET:", error.message);
    return NextResponse.json({ error: error.message || 'Koneksi Axios Gagal' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!API_KEY) {
    return NextResponse.json({ error: 'API Key tidak ditemukan' }, { status: 500 });
  }

  try {
    const body = await request.json();
    const { origin, destination, weight, courier } = body;

    const response = await axios.post(
      `${BASE_URL}/cost`,
      new URLSearchParams({
        origin: origin.toString(),
        destination: destination.toString(),
        weight: weight.toString(),
        courier: courier
      }),
      {
        ...axiosConfig,
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          ...axiosConfig.headers
        }
      }
    );

    return NextResponse.json(response.data.rajaongkir.results[0].costs);
  } catch (error: any) {
    console.error(">>> ERROR AXIOS POST:", error.message);
    return NextResponse.json({ error: 'Gagal menghitung ongkos kirim' }, { status: 500 });
  }
}