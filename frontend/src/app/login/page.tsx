import { login } from './actions'
import Link from 'next/link'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { message: string }
}) {
  return (
    <div className="flex-1 flex flex-col w-full px-8 sm:max-w-md justify-center gap-2 mx-auto mt-20">
      <div className="bg-dark-900 border border-gold-500/20 p-8 rounded-sm shadow-xl animate-in fade-in zoom-in duration-300">
        <form className="flex-1 flex flex-col w-full justify-center gap-2 text-foreground">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white uppercase tracking-widest">Giriş Yap</h1>
            <div className="w-12 h-1 bg-gold-500 mx-auto mt-4"></div>
            <p className="text-gray-400 text-sm mt-4">Lütfen yetkili hesabınızla giriş yapın.</p>
          </div>
          
          <label className="text-sm uppercase tracking-wider text-gray-400 mb-1" htmlFor="email">
            E-Posta Adresi
          </label>
          <input
            className="rounded-sm px-4 py-3 bg-dark-950 border border-gray-800 mb-6 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors"
            name="email"
            type="email"
            required
          />
          
          <label className="text-sm uppercase tracking-wider text-gray-400 mb-1" htmlFor="password">
            Şifre
          </label>
          <input
            className="rounded-sm px-4 py-3 bg-dark-950 border border-gray-800 mb-8 text-white focus:border-gold-500 focus:ring-1 focus:ring-gold-500 focus:outline-none transition-colors"
            type="password"
            name="password"
            required
          />
          <div className="mt-4 text-center text-sm">
            <Link href="/forgot-password" className="text-gray-400 hover:text-white underline">
              Şifremi Unuttum
            </Link>
          </div>

          <button
            formAction={login}
            className="bg-gold-500 text-dark-950 font-bold tracking-widest uppercase rounded-sm px-4 py-3 mb-2 hover:bg-gold-400 transition-colors"
          >
            Sisteme Gir
          </button>
          
          {searchParams?.message && (
            <p className="mt-4 p-4 bg-red-900/30 border border-red-500/50 text-red-400 text-center rounded-sm text-sm">
              {searchParams.message}
            </p>
          )}
        </form>
      </div>
      
      <div className="text-center mt-6">
        <Link href="/" className="text-gray-500 hover:text-gold-500 text-sm transition-colors uppercase tracking-widest">
          &larr; Ana Sayfaya Dön
        </Link>
      </div>
    </div>
  )
}
