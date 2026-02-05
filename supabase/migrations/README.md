GeckoPress Versiyonlama Sistemi - Gelistirici Rehberi

Dosya Yapisi

gecko-press/
├── version.txt                           ← Uygulama versiyonu (UI, bugfix, genel release)
├── db_version.txt                        ← Veritabani schema versiyonu
├── scripts/database/initial_schema.sql   ← Yeni deploylar icin tam schema
└── supabase/migrations/
    ├── v1.0.0_to_v1.0.1_add_reactions.sql
    ├── v1.0.1_to_v1.0.2_add_test_column.sql
    └── v1.0.2_to_v1.0.3_add_new_feature.sql

1. Iki Farkli Versiyon Dosyasi

version.txt (Uygulama Versiyonu)
- Repo kokunde, uygulamanin genel versiyonunu tutar
- UI degisiklikleri, bugfix'ler, yeni ozellikler dahil HER degisiklikte artar
- Semantic versioning: MAJOR.MINOR.PATCH
- Ornek: 1.0.7

db_version.txt (Veritabani Schema Versiyonu)
- Repo kokunde, veritabani schema versiyonunu tutar
- SADECE veritabani degisikligi oldugunda artar
- Migration dosyalari bu versiyona gore isimlendirilir
- Ornek: 1.0.2

Neden Ayri?
- Uygulama versiyonu hizli ilerleyebilir (UI degisiklikleri, bugfix'ler)
- Veritabani degisiklikleri daha seyrek olur
- Migration zinciri kopmuyor, ardisiklik bozulmuyor

2. Migration Dosyalari
Konum: supabase/migrations/

Dosya Adi Formati: v{DB_FROM}_to_v{DB_TO}_{aciklama}.sql

Ornekler:
v1.0.0_to_v1.0.1_add_post_reactions.sql
v1.0.1_to_v1.0.2_add_test_column.sql
v1.0.2_to_v1.0.3_add_user_preferences.sql

Onemli Kurallar:
- Migration dosyalari db_version'a gore isimlendirilir (version.txt'e gore DEGIL)
- Her migration dosyasi ardisik DB versiyonlari arasinda olmali
- DB versiyon atlamamali (1.0.1 -> 1.0.3 YANLIS)
- initial_schema.sql her zaman guncel tutulmali

3. Migration SQL Ornegi

-- v1.0.1_to_v1.0.2_add_comments.sql

-- Add comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read all comments"
  ON comments FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create own comments"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

4. Sistem Nasil Calisiyor?

Yeni Deploy:
1. initial_schema.sql calistirilir
2. Edge function'lar deploy edilir
3. Kullanicinin app_settings tablosuna geckopress_db_version = {db_version.txt} yazilir

Update (Ornek: DB 1.0.0 -> 1.0.3):
1. Kullanicinin mevcut DB versiyonu okunur: 1.0.0
2. Repo'dan guncel DB versiyon okunur: 1.0.3
3. Migration path hesaplanir:
   - v1.0.0_to_v1.0.1_add_reactions.sql
   - v1.0.1_to_v1.0.2_add_test_column.sql
   - v1.0.2_to_v1.0.3_add_new_feature.sql
4. Migration'lar sirayla calistirilir
5. Edge function'lar yeniden deploy edilir
6. DB versiyon 1.0.3 olarak guncellenir

5. Checklist - Yeni Versiyon Cikarken

Sadece UI/Bugfix Degisikligi:
- [ ] version.txt guncelle (ornek: 1.0.7 -> 1.0.8)
- [ ] Kod degisikliklerini yap
- [ ] Test et

Veritabani Degisikligi Iceren Release:
- [ ] version.txt guncelle (ornek: 1.0.7 -> 1.0.8)
- [ ] db_version.txt guncelle (ornek: 1.0.2 -> 1.0.3)
- [ ] Migration dosyasi olustur: v{ESKi_DB}_to_v{YENi_DB}_aciklama.sql
- [ ] initial_schema.sql guncelle (yeni tablolar/kolonlar ekle)
- [ ] Edge function degisiklikleri varsa supabase/functions/ guncelle
- [ ] Test et: Hem yeni deploy hem update senaryosu

6. Dikkat Edilecekler
- Veri kaybina yol acmayin - DROP TABLE, DROP COLUMN kullanmayin
- IF EXISTS/IF NOT EXISTS kullanin - Idempotent SQL yazin
- RLS politikalarini unutmayin - Her yeni tabloda enable edin
- DB versiyonlari ardisik olmali - Atlama yapmadan sirayla ilerleyin
- version.txt ve db_version.txt FARKLI dosyalar - Karistirmayin!

7. Ornek Senaryo

Mevcut durum:
- version.txt = 1.0.7
- db_version.txt = 1.0.2

Yeni ozellik ekleniyor (DB degisikligi gerekli):
1. version.txt -> 1.0.8
2. db_version.txt -> 1.0.3
3. Migration: v1.0.2_to_v1.0.3_add_new_feature.sql

Sonraki UI bugfix (DB degisikligi YOK):
1. version.txt -> 1.0.9
2. db_version.txt -> 1.0.3 (degismiyor!)
3. Migration dosyasi YOK
