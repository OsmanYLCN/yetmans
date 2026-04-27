-- RBAC (Rol Bazlı Yetkilendirme) Şeması

-- 1. user_roles Tablosunun Oluşturulması
CREATE TABLE user_roles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Row Level Security (RLS) Ayarları
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Kullanıcı sadece KENDİ rolünü okuyabilir
CREATE POLICY "Users can read own role" 
ON user_roles 
FOR SELECT 
USING (auth.uid() = id);

-- Sadece auth.users tablosuna kayıt eklendiğinde otomatik veri girecek trigger (aşağıda)
-- O yüzden dışarıdan INSERT yetkisine gerek yok. Update yetkisine de arayüzden gerek yok (Sadece Supabase panelinden elle veya service_role ile değişir).

-- 3. Otomatik Rol Atama Fonksiyonu (Trigger Function)
-- Bir kullanıcı kayıt olduğunda (veya davet edildiğinde) otomatik olarak 'staff' (çırak) rolüyle user_roles tablosuna ekler.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (id, role)
  VALUES (new.id, 'staff');
  RETURN new;
END;
$$;

-- 4. Trigger'ın auth.users tablosuna bağlanması
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
