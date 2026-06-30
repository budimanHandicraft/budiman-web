import { NextResponse } from 'next/server';

const API_KEY = process.env.RAJAONGKIR_API_KEY;
const BASE_URL = 'https://api.rajaongkir.com/starter';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const province = searchParams.get('province');

  try {
    if (type === 'province') {
      const res = await fetch(`${BASE_URL}/province`, {
        headers: { key: API_KEY as string }
      });
      const data = await res.json();
      return NextResponse.json(data.rajaongkir.results);
    }

    if (type === 'city') {
      const res = await fetch(`${BASE_URL}/city?province=${province}`, {
        headers: { key: API_KEY as string }
      });
      const data = await res.json();
      return NextResponse.json(data.rajaongkir.results);
    }

    return NextResponse.json({ error: 'Parameter tidak valid' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data dari RajaOngkir' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { origin, destination, weight, courier } = body;

    const res = await fetch(`${BASE_URL}/cost`, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        key: API_KEY as string
      },
      
      body: new URLSearchParams({
        origin: origin.toString(),
        destination: destination.toString(),
        weight: weight.toString(),
        courier: courier
      }).toString()
    });

    const data = await res.json();
    
    return NextResponse.json(data.rajaongkir.results[0].costs);
  } catch (error) {
    return NextResponse.json({ error: 'Gagal menghitung ongkos kirim' }, { status: 500 });
  }
}