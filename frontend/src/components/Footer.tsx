export default function Footer() {
  return (
    <footer className="bg-dark-950 border-t border-gold-500/10 mt-auto py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-center md:text-left mb-6 md:mb-0">
            <h2 className="text-2xl font-bold tracking-widest text-gold-500 uppercase">Yetman's</h2>
            <p className="mt-2 text-sm text-gray-500">Klasik ve Lüks Berber Deneyimi.</p>
          </div>
          <div className="text-center md:text-right text-gray-400 text-sm">
            <p>10:00 - 20:00 Hizmet Saatleri</p>
            <p className="mt-1">&copy; {new Date().getFullYear()} Yetmans Barbershop. Tüm Hakları Saklıdır.</p>
            <div className="mt-4 opacity-50 hover:opacity-100 transition-opacity flex justify-center md:justify-end gap-2">
              <a href="/panel" className="text-xs uppercase tracking-widest border border-gray-700 px-3 py-1 rounded-sm hover:border-gold-500 hover:text-gold-500 transition-colors">
                Berber Paneli
              </a>
              <a href="/admin" className="text-xs uppercase tracking-widest border border-gray-700 px-3 py-1 rounded-sm hover:border-gold-500 hover:text-gold-500 transition-colors">
                Yönetici Paneli
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
