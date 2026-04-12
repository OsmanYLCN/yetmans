"use client";
import { useState, useEffect } from "react";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    if (localStorage.getItem("adminAuth") === "true") {
      setIsAuthenticated(true);
      fetchAppointments();
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "yetman123") {
      localStorage.setItem("adminAuth", "true");
      setIsAuthenticated(true);
      fetchAppointments();
    } else {
      alert("Hatalı şifre");
    }
  };

  const fetchAppointments = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/api/appointments/?admin=true");
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const updateStatus = async (id: number, status: string, phone: string, firstName: string, date: string, time: string) => {
    if (!confirm(`Bu randevuyu ${status === 'confirmed' ? 'Onaylamak' : 'Reddetmek'} istediğinize emin misiniz?`)) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/appointments/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchAppointments();
        // WhatsApp messages are now handled automatically by the backend via Cloud API
        alert(`Randevu başarıyla ${status === 'confirmed' ? 'onaylandı' : 'reddedildi'} ve müşteriye otomatik WhatsApp mesajı gönderildi.`);
      } else {
         const errorData = await res.json();
         alert("İşlem sırasında hata oluştu: " + (errorData.detail || "Bilinmeyen Hata"));
      }
    } catch (e) {
      alert("Güncelleme başarısız.");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <form onSubmit={handleLogin} className="bg-dark-900 p-8 border border-gold-500/20 max-w-sm w-full rounded-sm shadow-xl">
          <h1 className="text-2xl font-bold text-center text-gold-500 mb-6 uppercase tracking-wider">Yönetim Girişi</h1>
          <input 
            type="password" 
            placeholder="Şifre" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-dark-950 border border-gray-700 text-white p-3 mb-6 rounded-sm focus:border-gold-500 focus:outline-none text-center tracking-widest"
          />
          <button type="submit" className="w-full bg-gold-500 text-dark-950 py-3 font-bold uppercase tracking-widest hover:bg-gold-400 transition-colors">Giriş Yap</button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8 border-b border-gray-800 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider">Randevular</h1>
          <p className="text-gray-400 text-sm mt-1">Müşteri taleplerini buradan yönetin.</p>
        </div>
        <button 
           onClick={() => { localStorage.removeItem("adminAuth"); setIsAuthenticated(false); }}
           className="text-sm px-4 py-2 border border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 rounded-sm transition-colors"
        >Çıkış Yap</button>
      </div>

      <div className="grid gap-4">
        {appointments.map((appt: any) => (
          <div key={appt.id} className={`p-4 md:p-6 border rounded-sm transition-colors ${appt.status === 'pending' ? 'bg-dark-900 border-gold-500/30 hover:border-gold-500/60' : 'bg-dark-950 border-gray-800'}`}>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg text-white capitalize">{appt.first_name} {appt.last_name}</h3>
                  {appt.status === 'pending' && <span className="bg-yellow-500/10 border border-yellow-500/50 text-yellow-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Yeni Talep</span>}
                  {appt.status === 'confirmed' && <span className="bg-green-500/10 border border-green-500/50 text-green-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Onaylandı</span>}
                  {appt.status === 'rejected' && <span className="bg-red-500/10 border border-red-500/50 text-red-500 text-[10px] px-2 py-0.5 uppercase font-bold tracking-widest rounded-full">Reddedildi</span>}
                </div>
                <div className="text-gray-400 text-sm flex flex-col md:flex-row md:gap-4 gap-1">
                  <span className="flex items-center gap-1">⏱ {appt.date} | {appt.time}</span>
                  <span className="flex items-center gap-1">✂️ {appt.service_name}</span>
                  <span className="flex items-center gap-1">📞 {appt.phone}</span>
                </div>
              </div>

              {appt.status === 'pending' && (
                <div className="flex md:flex-col lg:flex-row gap-2 mt-4 md:mt-0">
                  <button 
                    onClick={() => updateStatus(appt.id, 'confirmed', appt.phone, appt.first_name, appt.date, appt.time)}
                    className="flex-1 px-4 py-2 bg-green-600/10 text-green-500 border border-green-600 hover:bg-green-600 hover:text-white transition-colors uppercase font-bold text-[11px] tracking-wider rounded-sm flex items-center justify-center gap-2"
                  >
                    <span>Onayla</span>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.115.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.601.725 4.914 2.038 1.314 1.314 2.036 3.06 2.036 4.914-.004 3.824-3.116 6.928-6.95 6.928z"/></svg>
                  </button>
                  <button 
                    onClick={() => updateStatus(appt.id, 'rejected', appt.phone, appt.first_name, appt.date, appt.time)}
                    className="flex-1 px-4 py-2 bg-red-600/10 text-red-500 border border-red-600 hover:bg-red-600 hover:text-white transition-colors uppercase font-bold text-[11px] tracking-wider rounded-sm flex items-center justify-center gap-2"
                  >
                     <span>Reddet</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && (
          <div className="text-center py-16 bg-dark-900 border border-gold-500/10 rounded-sm">
            <p className="text-gray-500">Şu anda bekleyen randevu bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}
