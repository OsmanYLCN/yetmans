import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/utils/supabase-admin';

// YENİ EKLENEN SATIR: Next.js'in bu listeyi önbelleğe (cache) almasını kesin olarak yasaklar.
export const dynamic = 'force-dynamic';

export async function GET() {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .gt('price', 0) // Fiyatı 0'dan büyük olanları getirir
    .order('id', { ascending: true });
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json(data);
}