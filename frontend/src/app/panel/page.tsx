"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from 'next/link';

export default function PanelPage() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const getLocalISODate = (date: Date) => {
    const offset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - offset).toISOString().split('T')[0];
  };
  const [selectedDate, setSelectedDate] = useState(getLocalISODate(new Date()));
  
  const supabase = createClient();

  const timeSlots: string[] = [];
  for (let h = 10; h <= 20; h++) { 
    timeSlots.push(`${String(h).padStart(2, '0')}:00`);
    if (h !== 20) { 
      timeSlots.push(`${String(h).padStart(2, '0')}:30`);
    }
  }

  useEffect(() => {
    fetchAppointments();
  }, [selectedDate]);

  const fetchAppointments = async () => {
    try {
      const timestamp = new Date().getTime();
      const res = await fetch(`/api/admin/appointments?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Veri çekme hatası:", err);
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
    window.location.href = url;
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

  const cancelAppointment = async (id: number, phone: string, firstName: string, date: string, time: string) => {
    if (!confirm(`DİKKAT: ${firstName} adlı müşterinin onaylı randevusunu iptal etmek istediğinize emin misiniz? Bu işlem saati geri açacaktır.`)) return;
    
    try {
      const res = await fetch(`/api/admin/appointments?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        fetchAppointments(); 
        const waPhone = formatPhoneForWA(phone);
        const message = `Merhaba ${firstName}, Yetman's Barbershop'tan ${date} saat ${time} için oluşturduğunuz randevunuz elimizde olmayan sebeplerden dolayı iptal edilmek zorunda kalınmıştır. Anlayışınız için teşekkür ederiz.`;
        
        const url = `https://wa.me/${waPhone}?text=${encodeURIComponent(message)}`;
        window.location.href = url; 
      } else {
        alert("İptal işlemi sırasında bir hata oluştu.");
      }
    } catch (error) {
      alert("Randevu iptal edilemedi.");
    }
  };

  const handleBlockSlot = async (time: string, dbApptId?: number) => {
    if (!confirm(`${time} saatini dışarıya kapatmak istediğinize emin misiniz?`)) return;
    try {
      if (dbApptId) {
        await fetch(`/api/admin/appointments?id=${dbApptId}`, { method: "DELETE" });
      } else {
        const { data: services } = await supabase.from('services').select('id').limit(1);
        const validServiceId = services && services.length > 0 ? services[0].id : null;

        if (!validServiceId) {
          alert("Hata: Sistemde hiç hizmet (saç kesimi vb.) bulunamadı. Lütfen önce hizmet ekleyin.");
          return;
        }

        const { error } = await supabase
          .from('appointments')
          .insert([{
            service_id: validServiceId, 
            first_name: '🔴 MOLA',
            last_name: 'KAPALI',
            phone: '0000000000',
            date: selectedDate,
            time: `${time}:00`, 
            status: 'confirmed' 
          }]);

        if (error) throw error;
      }
      fetchAppointments(); 
    } catch (error: any) { 
      console.error("Saat kapatma detayı:", error);
      alert("Hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  };

  const handleUnblockSlot = async (id: number | null, time: string, isOtoMola: boolean) => {
    if (!confirm("Bu molayı kaldırıp saati geri açmak istediğinize emin misiniz?")) return;
    try {
      if (isOtoMola) {
        const { data: services } = await supabase.from('services').select('id').limit(1);
        // Senin orijinal kodundaki gibi garanti olsun diye 4'ü de yedek (fallback) olarak koyduk
        const validServiceId = services && services.length > 0 ? services[0].id : 4; 

        const { error } = await supabase.from('appointments').insert([{
          service_id: validServiceId,
          first_name: '🟢 AÇIK',
          last_name: 'MOLA İPTALİ',
          phone: '0000000000',
          date: selectedDate,
          time: `${time}:00`,
          status: 'unblocked'
        }]);

        // EĞER HATA VARSA ARTIK GİZLENMEYECEK, YÜZÜMÜZE ÇARPILACAK
        if (error) {
          alert("Supabase Veritabanı Hatası: " + error.message);
          return;
        }
      } else if (id) {
        const res = await fetch(`/api/admin/appointments?id=${id}`, {
          method: "DELETE",
        });
        if (!res.ok) throw new Error("Hata oluştu.");
      }
      fetchAppointments();
    } catch (error) {
      alert("Beklenmeyen bir hata oluştu.");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  const changeDate = (days: number) => {
    const d = new Date(`${selectedDate}T12:00:00`);
    d.setDate(d.getDate() + days);
    
    if (d.getDay() === 0) {
      d.setDate(d.getDate() + (days > 0 ? 1 : -1));
    }
    
    setSelectedDate(getLocalISODate(d));
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gold-500">Yükleniyor...</div>;
  }

  const appointmentsForDate = appointments.filter((a: any) => a.date === selectedDate && a.status !== 'rejected');
  
  const [displayYil, displayAy, displayGun] = selectedDate.split('-').map(Number);
  const displayDate = new Date(displayYil, displayAy - 1, displayGun).toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // GÜVENLİ GÜN HESAPLAMASI (Öğlen 12:00 baz alınır)
  const dateObjForDay = new Date(`${selectedDate}T12:00:00`);
  const dayOfWeek = dateObjForDay.getDay();
  const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
  const otoMolalar = ['10:00', '11:30', '12:30', '14:30', '16:30', '18:30'];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
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
            onChange={(e) => {
              const selectedObj = new Date(`${e.target.value}T12:00:00`);
              if (selectedObj.getDay() === 0) {
                alert("Pazar günleri randevuya ve işleme kapalıdır.");
                return;
              }
              setSelectedDate(e.target.value);
            }}
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

      <div className="bg-dark-950 border border-gray-800 rounded-sm overflow-hidden shadow-lg">
        {timeSlots.map((time) => {
          
          // ZEKİ FİLTRE: Gerçek randevular ve İstisnaları birbirine karıştırmadan ayırıyoruz
          const realAppts = appointmentsForDate.filter((a: any) => a.time.substring(0, 5) === time && a.status !== 'unblocked' && a.first_name !== '🔴 MOLA' && a.first_name !== '🟢 AÇIK');
          const activeAppt = realAppts.length > 0 ? realAppts[0] : null;

          const markerAppts = appointmentsForDate.filter((a: any) => a.time.substring(0, 5) === time && (a.status === 'unblocked' || a.first_name === '🔴 MOLA' || a.first_name === '🟢 AÇIK'));
          const markerAppt = markerAppts.length > 0 ? markerAppts[0] : null;

          let isUnblockedMola = markerAppt?.status === 'unblocked' || markerAppt?.first_name === '🟢 AÇIK';
          let isManualMola = markerAppt?.first_name === '🔴 MOLA';
          let isOtoMola = false;

          // Eğer o saatte gerçek randevu veya patronun koyduğu bir engel/istisna yoksa otomatiği çalıştır
          if (!activeAppt && !markerAppt && isWeekday && otoMolalar.includes(time)) {
            isOtoMola = true;
          }

          const showAsMola = isManualMola || isOtoMola;
          
          return (
            <div key={time} className={`flex flex-col md:flex-row border-b border-gray-800/50 last:border-0 transition-colors hover:bg-dark-900/50 ${activeAppt ? (activeAppt.status === 'pending' ? 'bg-yellow-500/5' : 'bg-green-500/5') : showAsMola ? 'bg-red-900/10' : ''}`}>
              
              <div className="w-full md:w-32 py-4 px-6 flex items-center justify-center md:justify-start border-b md:border-b-0 md:border-r border-gray-800/50">
                <span className={`text-lg font-bold tracking-widest ${showAsMola ? 'text-red-500' : activeAppt ? 'text-white' : 'text-gray-600'}`}>
                  {time}
                </span>
              </div>
              
              <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                {showAsMola ? (
                  <div className="flex justify-between items-center w-full bg-red-900/20 border border-red-500/30 p-3 rounded-sm">
                    <span className="text-red-400 font-bold uppercase tracking-widest text-sm">
                      {isOtoMola ? '🔴 OTOMATİK MOLA (KAPALI)' : '🔴 BU SAAT RANDEVUYA KAPATILDI'}
                    </span>
                    <button 
                      onClick={() => handleUnblockSlot(markerAppt?.id || null, time, isOtoMola)}
                      className="px-3 py-1 bg-red-600/20 text-red-400 border border-red-500 hover:bg-red-500 hover:text-white transition-colors text-xs uppercase font-bold rounded-sm ml-4"
                    >
                      Geri Aç
                    </button>
                  </div>
                ) : activeAppt ? (
                    <>
                      <div>
                        <div className="flex flex-wrap items-center gap-3 mb-2">
                          <h3 className="font-bold text-lg text-white capitalize">{activeAppt.first_name} {activeAppt.last_name}</h3>
                          {activeAppt.status === 'pending' && <span className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Onay Bekliyor</span>}
                          {activeAppt.status === 'confirmed' && (
                            <div className="flex items-center gap-3">
                              <span className="bg-green-500/10 border border-green-500/50 text-green-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Onaylı</span>
                              <button 
                                onClick={() => cancelAppointment(activeAppt.id, activeAppt.phone, activeAppt.first_name, activeAppt.date, activeAppt.time)}
                                className="px-3 py-1 bg-red-600/10 text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase font-bold text-[10px] tracking-wider rounded-sm flex items-center justify-center"
                              >
                                İptal Et
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="text-gray-400 text-sm flex flex-col sm:flex-row sm:gap-4 gap-1">
                          <span className="flex items-center gap-1">✂️ {activeAppt.service?.name}</span>
                          <span className="flex items-center gap-1">📞 {activeAppt.phone}</span>
                        </div>
                      </div>

                      {activeAppt.status === 'pending' && (
                        <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0">
                          <button 
                            onClick={() => updateStatus(activeAppt.id, 'confirmed', activeAppt.phone, activeAppt.first_name, activeAppt.date, activeAppt.time)}
                            className="flex-1 md:flex-none px-4 py-2 bg-green-600/10 text-green-500 border border-green-600 hover:bg-green-600 hover:text-white transition-colors uppercase font-bold text-[11px] tracking-wider rounded-sm flex items-center justify-center"
                          >
                            Onayla
                          </button>
                          <button 
                            onClick={() => updateStatus(activeAppt.id, 'rejected', activeAppt.phone, activeAppt.first_name, activeAppt.date, activeAppt.time)}
                            className="flex-1 md:flex-none px-4 py-2 bg-red-600/10 text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase font-bold text-[11px] tracking-wider rounded-sm flex items-center justify-center"
                          >
                            Reddet
                          </button>
                        </div>
                      )}
                    </>
                ) : (
                  <div className="flex items-center justify-between w-full h-full text-gray-600">
                    <span className="italic uppercase tracking-widest text-sm">
                      {isUnblockedMola ? '🟢 İSTİSNA (GERİ AÇILDI) - BOŞ SEANS' : 'BOŞ SEANS'}
                    </span>
                    <button 
                      onClick={() => handleBlockSlot(time, isUnblockedMola ? markerAppt?.id : undefined)}
                      className="px-3 py-1 border border-gray-700 hover:border-gray-500 hover:text-white transition-colors text-xs uppercase font-bold rounded-sm ml-4"
                    >
                      Saati Kapat
                    </button>
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