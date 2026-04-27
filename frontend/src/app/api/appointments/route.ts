import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { service, date, time, first_name, last_name, phone } = body;
    
    if (!service || !date || !time || !first_name || !last_name || !phone) {
        return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    const { error } = await supabase.from('appointments').insert([
      {
        service_id: service,
        date: date,
        time: time,
        first_name: first_name,
        last_name: last_name,
        phone: phone,
        status: 'pending'
      }
    ]);

    if (error) {
        console.error("Supabase insert error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
    }
    
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (err: any) {
    console.error("API route catch error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
