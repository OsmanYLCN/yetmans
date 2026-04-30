'use client';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Güncelleniyor...');

    // Supabase şifreyi arka planda günceller
    const { error } = await supabase.auth.updateUser({
      password: password
    });

    if (error) {
      setMessage('Bir hata oluştu: ' + error.message);
    } else {
      setMessage('Şifreniz başarıyla güncellendi! Panele yönlendiriliyorsunuz...');
      setTimeout(() => {
        router.push('/panel'); // Başarılıysa direkt panele at
      }, 2000);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md bg-dark-900 p-8 rounded-lg border border-gold-500/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Yeni Şifre Belirle</h2>
        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Yeni Şifreniz (En az 6 karakter)</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-dark-950 border border-dark-800 text-white px-4 py-2 rounded-md focus:outline-none focus:border-gold-500"
              required 
              minLength={6}
            />
          </div>
          <button type="submit" className="w-full bg-green-600 text-white font-bold py-2 rounded-md hover:bg-green-500 transition-colors">
            Şifreyi Kaydet ve Giriş Yap
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gold-500">{message}</p>}
      </div>
    </div>
  );
}