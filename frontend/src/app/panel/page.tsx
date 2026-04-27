"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from 'next/link';

export default function PanelPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Date selection state (defaults to today in local timezone)
  const getLocalISODate = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getLocalISODate(new Date()));
  
  const supabase = createClient();

  // Generate 10:00 to 19:30 slots
  const timeSlots: string[] = [];
  for (let h = 10; h < 20; h++) {
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    timeSlots.push(`${String(h).padStart(2, '0')}:30`);
  }

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await fetch("/api/admin/appointments");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneForWA = (phone: string) => {
    let cleaned = phone.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '90' + cleaned.substring(1);
    } else if (cleaned.length === 10) {
      cleaned = '90' + cleaned;
    }
    return cleaned;
  };

  const openWhatsApp = (phone: string, status: string, firstName: string, date: string, time: string) => {
    const waPhone = formatPhoneForWA(phone);
    let message = "";
    if (status === 'confirmed') {
      message = `Merhaba ${firstName}, Yetman's Barbershop'tan ${date} saat ${time} için oluşturduğunuz randevunuz onaylanmıştır. Sizi bekliyoruz!`;
    } else {
      message = `Merhaba ${firstName}, Yetman's Barbershop'a göstermiş olduğunuz ilgiden dolayı teşekkür ederiz. Maalesef yoğunluk sebebiyle ${date} saat ${time} tarihindeki randevu talebinizi onaylayamıyoruz. Anlayışınız için teşekkür ederiz.`;
    }
    
    const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const updateStatus = async (id: number, status: string, phone: string, firstName: string, date: string, time: string) => {
    if (!confirm(`Bu randevuyu ${status === 'confirmed' ? 'Onaylamak' : 'Reddetmek'} istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`/api/admin/appointments`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchAppointments();
        openWhatsApp(phone, status, firstName, date, time);
      } else {
         const errorData = await res.json();
         alert("İşlem sırasında hata oluştu: " + (errorData.detail || "Bilinmeyen Hata"));
      }
    } catch (e) {
      alert("Güncelleme başarısız.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(getLocalISODate(d));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gold-500">Yükleniyor...</div>;
  }

  // Get appointments for the specifically selected date
  const appointmentsForDate = appointments.filter((a: any) => a.date === selectedDate && a.status !== 'rejected');
  
  // Format the date for display (e.g. 26 Nisan 2026 Cuma)
  const displayDate = new Date(selectedDate).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-4">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider text-gold-500">Berber Paneli</h1>
          <p className="text-gray-400 text-sm mt-1">Günlük randevu çizelgenizi buradan yönetin.</p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin" className="text-sm px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-sm transition-colors">Yönetici Paneli</Link>
          <button 
             onClick={handleLogout}
             className="text-sm px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-sm transition-colors"
          >Çıkış Yap</button>
        </div>
      </div>

      {/* Date Navigation Bar */}
      <div className="bg-dark-900 border border-gold-500/20 p-4 rounded-sm flex flex-col sm:flex-row justify-between items-center mb-8 shadow-md">
        <button 
          onClick={() => changeDate(-1)}
          className="px-4 py-2 text-gray-400 hover:text-gold-500 hover:bg-dark-950 rounded-sm transition-colors"
        >
          &larr; Önceki Gün
        </button>
        
        <div className="flex items-center gap-4 my-4 sm:my-0">
          <span className="font-bold text-lg text-white capitalize">{displayDate}</span>
          <input 
            type="date" 
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-dark-950 border border-gray-700 text-gray-300 text-sm rounded-sm p-2 focus:border-gold-500 focus:outline-none"
          />
        </div>

        <button 
          onClick={() => changeDate(1)}
          className="px-4 py-2 text-gray-400 hover:text-gold-500 hover:bg-dark-950 rounded-sm transition-colors"
        >
          Sonraki Gün &rarr;
        </button>
      </div>

      {/* Daily Schedule Grid */}
      <div className="bg-dark-950 border border-gray-800 rounded-sm overflow-hidden shadow-lg">
        {timeSlots.map((time, index) => {
          // Find if there's an appointment at this exact time (ignoring seconds)
          const appt = appointmentsForDate.find((a: any) => a.time.substring(0, 5) === time);
          
          return (
            <div key={time} className={`flex flex-col md:flex-row border-b border-gray-800/50 last:border-0 transition-colors hover:bg-dark-900/50 ${appt ? (appt.status === 'pending' ? 'bg-yellow-500/5' : 'bg-green-500/5') : ''}`}>
              {/* Time Column */}
              <div className="w-full md:w-32 py-4 px-6 flex items-center justify-center md:justify-start border-b md:border-b-0 md:border-r border-gray-800/50">
                <span className={`text-lg font-bold tracking-widest ${appt ? 'text-white' : 'text-gray-600'}`}>
                  {time}
                </span>
              </div>
              
              {/* Content Column */}
              <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {appt ? (
                  <>
                    <div>
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <h3 className="font-bold text-lg text-white capitalize">{appt.first_name} {appt.last_name}</h3>
                        {appt.status === 'pending' && <span className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Onay Bekliyor</span>}
                        {appt.status === 'confirmed' && <span className="bg-green-500/10 border border-green-500/50 text-green-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Onaylı</span>}
                      </div>
                      <div className="text-gray-400 text-sm flex flex-col sm:flex-row sm:gap-4 gap-1">
                        <span className="flex items-center gap-1">✂️ {appt.service?.name}</span>
                        <span className="flex items-center gap-1">📞 {appt.phone}</span>
                      </div>
                    </div>

                    {appt.status === 'pending' && (
                      <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                        <button 
                          onClick={() => updateStatus(appt.id, 'confirmed', appt.phone, appt.first_name, appt.date, appt.time)}
                          className="flex-1 md:flex-none px-4 py-2 bg-green-600/10 text-green-500 border border-green-600 hover:bg-green-600 hover:text-white transition-colors uppercase font-bold text-[11px] tracking-wider rounded-sm flex items-center justify-center"
                        >
                          Onayla
                        </button>
                        <button 
                          onClick={() => updateStatus(appt.id, 'rejected', appt.phone, appt.first_name, appt.date, appt.time)}
                          className="flex-1 md:flex-none px-4 py-2 bg-red-600/10 text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase font-bold text-[11px] tracking-wider rounded-sm flex items-center justify-center"
                        >
                          Reddet
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex items-center text-gray-600 h-full">
                    <span className="italic uppercase tracking-widest text-sm">Boş Seans</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
