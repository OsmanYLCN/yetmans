import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 bg-dark-950/80 backdrop-blur-md border-b border-gold-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          <div className="flex-shrink-0 flex items-center">
            <Link href="/" className="text-2xl font-bold tracking-widest text-gold-500 uppercase">
              Yetman's
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors">Ana Sayfa</Link>
            <Link href="/galeri" className="text-sm font-medium text-gray-300 hover:text-gold-500 transition-colors">Galeri</Link>
            <Link href="/randevu" className="px-5 py-2 text-sm font-medium text-dark-950 bg-gold-500 hover:bg-gold-400 transition-colors rounded-sm uppercase tracking-wider">
              Randevu Al
            </Link>
          </div>
          {/* Mobile menu button could go here */}
          <div className="md:hidden">
             <Link href="/randevu" className="text-sm font-medium text-gold-500 border border-gold-500 px-3 py-1 rounded-sm">
                Randevu
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
