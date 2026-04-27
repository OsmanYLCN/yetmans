import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Fetch appointments and related service prices
  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      status,
      date,
      services ( price )
    `)
    
  // Calculate Statistics
  let totalRevenue = 0;
  let totalCount = 0;
  let pendingCount = 0;
  let todayCount = 0;
  
  const todayDateStr = new Date().toISOString().split('T')[0];

  if (appointments) {
    totalCount = appointments.length;
    
    appointments.forEach((appt: any) => {
      // Calculate revenue from confirmed appointments
      if (appt.status === 'confirmed' && appt.services && appt.services.price) {
        totalRevenue += Number(appt.services.price);
      }
      
      // Count pending
      if (appt.status === 'pending') {
        pendingCount++;
      }
      
      // Count today's
      if (appt.date === todayDateStr) {
        todayCount++;
      }
    });
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-white">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 border-b border-gray-800 pb-6">
        <div className="mb-4 md:mb-0">
          <h1 className="text-3xl font-bold uppercase tracking-widest text-gold-500">Yönetici Paneli</h1>
          <p className="text-gray-400 text-sm mt-1">İşletme istatistikleri ve genel yönetim ekranı.</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{user.email}</span>
          <form action={async () => {
            'use server';
            const supabaseServer = await createClient();
            await supabaseServer.auth.signOut();
            redirect('/login');
          }}>
            <button className="text-xs uppercase tracking-widest px-4 py-2 border border-red-500/50 text-red-500 hover:bg-red-500 hover:text-white rounded-sm transition-colors">
              Çıkış Yap
            </button>
          </form>
        </div>
      </div>
      
      {/* Statistics Grid */}
      <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">İstatistikler</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-dark-900 border border-gold-500/30 p-6 rounded-sm shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-gold-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Toplam Kazanç</p>
          <h3 className="text-3xl font-bold text-gold-500">₺{totalRevenue.toLocaleString('tr-TR')}</h3>
          <p className="text-xs text-gray-500 mt-2">Onaylanmış randevular</p>
        </div>
        
        <div className="bg-dark-900 border border-gray-800 p-6 rounded-sm shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Toplam Randevu</p>
          <h3 className="text-3xl font-bold text-white">{totalCount}</h3>
          <p className="text-xs text-gray-500 mt-2">Tüm zamanlar</p>
        </div>
        
        <div className="bg-dark-900 border border-gray-800 p-6 rounded-sm shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-yellow-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Bekleyen İstek</p>
          <h3 className="text-3xl font-bold text-yellow-500">{pendingCount}</h3>
          <p className="text-xs text-gray-500 mt-2">Onaylanmayı bekliyor</p>
        </div>
        
        <div className="bg-dark-900 border border-gray-800 p-6 rounded-sm shadow relative overflow-hidden group">
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-green-500/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider mb-2">Bugünkü Randevu</p>
          <h3 className="text-3xl font-bold text-green-500">{todayCount}</h3>
          <p className="text-xs text-gray-500 mt-2">{todayDateStr}</p>
        </div>
      </div>

      {/* Quick Navigation Grid */}
      <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-wider">Hızlı İşlemler</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/panel" className="block p-6 bg-dark-950 border border-gray-800 hover:border-gold-500/50 rounded-sm transition-all group">
          <h3 className="text-lg font-bold text-white mb-2 group-hover:text-gold-500 transition-colors">✂️ Berber Paneli</h3>
          <p className="text-sm text-gray-500">Müşteri randevularını onaylamak, reddetmek ve yönetmek için berber paneline geçiş yapın.</p>
        </Link>
        
        <div className="block p-6 bg-dark-950 border border-gray-800 rounded-sm opacity-50 cursor-not-allowed">
          <h3 className="text-lg font-bold text-white mb-2">👥 Personel Yönetimi</h3>
          <p className="text-sm text-gray-500">Çırak hesapları oluşturma ve yetkilendirme işlemleri. (Yakında)</p>
        </div>
        
        <div className="block p-6 bg-dark-950 border border-gray-800 rounded-sm opacity-50 cursor-not-allowed">
          <h3 className="text-lg font-bold text-white mb-2">⚙️ İşletme Ayarları</h3>
          <p className="text-sm text-gray-500">Çalışma saatleri ve dükkan temel ayarları. (Yakında)</p>
        </div>
      </div>
    </div>
  )
}
