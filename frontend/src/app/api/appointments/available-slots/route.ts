import { NextResponse } from 'next/server';
import { supabaseAdmin as supabase } from '@/utils/supabase-admin';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dateStr = searchParams.get('date');
  
  if (!dateStr) {
    return NextResponse.json({ error: "Date parameter is required" }, { status: 400 });
  }
  
  // 10:00 to 20:00, 30 min intervals
  const slots: string[] = [];
  let currentHour = 10;
  let currentMin = 0;
  
  while (currentHour < 20 || (currentHour === 20 && currentMin === 0)) {
    const hh = String(currentHour).padStart(2, '0');
    const mm = String(currentMin).padStart(2, '0');
    
    // We stop at 19:30 as the last slot just like Django's logic
    if (currentHour === 20 && currentMin === 0) break;
    
    slots.push(`${hh}:${mm}`);
    
    currentMin += 30;
    if (currentMin >= 60) {
      currentMin -= 60;
      currentHour += 1;
    }
  }
  
  // Fetch booked appointments for the date
  const { data: bookedAppointments, error } = await supabase
    .from('appointments')
    .select('time')
    .eq('date', dateStr)
    .in('status', ['pending', 'confirmed']);
    
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  // Supabase 'time' type returns "HH:MM:SS" string
  const bookedTimes = bookedAppointments.map(appt => appt.time.substring(0, 5));
  
  const availableSlots = slots.filter(slot => !bookedTimes.includes(slot));
  
  return NextResponse.json({ available_slots: availableSlots });
}
