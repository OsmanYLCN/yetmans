'use client';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('Gönderiliyor...');
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      // Maildeki linke tıklayınca adamı nereye atalım? (Bunu birazdan yapacağız)
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setMessage('Bir hata oluştu: ' + error.message);
    } else {
      setMessage('Şifre sıfırlama linki e-posta adresinize gönderildi! (Gelen ve Spam kutusunu kontrol ediniz)');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 px-4">
      <div className="w-full max-w-md bg-dark-900 p-8 rounded-lg border border-gold-500/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-white text-center mb-6">Şifremi Unuttum</h2>
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">E-posta Adresiniz</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-dark-950 border border-dark-800 text-white px-4 py-2 rounded-md focus:outline-none focus:border-gold-500"
              required 
            />
          </div>
          <button type="submit" className="w-full bg-gold-500 text-dark-950 font-bold py-2 rounded-md hover:bg-gold-400 transition-colors">
            Sıfırlama Linki Gönder
          </button>
        </form>
        {message && <p className="mt-4 text-center text-sm text-gold-500">{message}</p>}
        <div className="mt-6 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors">Giriş Ekranına Dön</Link>
        </div>
      </div>
    </div>
  );
}