import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/utils/supabase-admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  
  if (!dateStr) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }

  // Tarihi güvenli bir şekilde oluşturup gününü buluyoruz (0: Pazar, 1-5: Hafta içi)
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayOfWeek = dateObj.getDay();
  
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const otoMolalar = ['10:00', '11:30', '12:30', '14:30', '16:30', '18:30'];
  
  // 10:00 to 20:00, 30 min intervals
  const slots: string[] = [];
  let currentHour = 10;
  let currentMin = 0;
  
  while (currentHour <= 20) {
    if (currentHour === 20 && currentMin === 30) break;

    const hh = String(currentHour).padStart(2, '0');
    const mm = String(currentMin).padStart(2, '0');
    
    slots.push(`${hh}:${mm}`);
    
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }
  
  // Sadece dolu olanları değil, patronun açtığı 'unblocked' istisnaları da çekiyoruz
  const { data: dbAppointments, error } = await supabase
    .from('appointments')
    .select('time, status')
    .eq('date', dateStr)
    .in('status', ['pending', 'confirmed', 'unblocked']);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Gerçekten dolu veya manuel kapatılmış saatler
  const bookedTimes = dbAppointments
    .filter(appt => appt.status === 'pending' || appt.status === 'confirmed')
    .map(appt => appt.time.substring(0, 5));

  // Patronun otomatik molayı kırmak için manuel "Geri Aç"tığı saatler
  const unblockedTimes = dbAppointments
    .filter(appt => appt.status === 'unblocked')
    .map(appt => appt.time.substring(0, 5));
  
  // Sihirli Filtreleme İşlemi
  const availableSlots = slots.filter(slot => {
    // 1. Veritabanında normal randevu veya manuel mola (confirmed/pending) varsa KAPALI
    if (bookedTimes.includes(slot)) return false;

    // 2. Hafta içi otomatik mola saatine denk geliyorsa
    if (isWeekday && otoMolalar.includes(slot)) {
      // Eğer patron bu saati "Geri Aç" (unblocked) yapmadıysa KAPALI
      if (!unblockedTimes.includes(slot)) {
        return false; 
      }
      // Geri açtıysa müsait kalmaya devam eder
    }

    // 3. Hiçbir engele takılmayanlar AÇIK olarak kalır
    return true;
  });
  
  return NextResponse.json({ available_slots: availableSlots });
}