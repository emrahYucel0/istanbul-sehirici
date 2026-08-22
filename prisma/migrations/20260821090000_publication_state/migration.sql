-- YAYIN DURUMU: Post ve Service.
--
-- ─────────────────────────────────────────────────────────────────────────
-- NEDEN ELLE YAZILDI
--
-- Prisma'nın ürettiği göç, yeni bir `BOOLEAN NOT NULL DEFAULT false`
-- sütununu MEVCUT SATIRLARA DA `false` olarak yazar. Bu tabloda o davranış
-- şu demek olurdu: on blog yazısı ve yedi hizmet sayfası, göç uygulandığı
-- anda yayından düşer — kök adresleri 404, dizinleri boş, sitemap'leri
-- eksik. Yani sessiz bir içerik kaybı.
--
-- Bu yüzden sütunlar önce eklenip ARDINDAN mevcut satırlar açıkça
-- yayına yazılıyor. Varsayılan `false` yalnız BUNDAN SONRA oluşturulacak
-- kayıtlar için geçerli — istenen davranış tam olarak bu.
--
-- ─────────────────────────────────────────────────────────────────────────
-- ÖLÇÜM (göç öncesi, yerel nakliyeDB)
--   Post     10 kayıt · 10'unun da slug/title/content'i dolu · 10'u da canlı
--   Service   7 kayıt ·  7'sinin de slug'ı var · 7'si de canlı
-- Yani "bugün public olan" kümesi ile "tüm kayıtlar" kümesi aynı; koşulsuz
-- güncelleme doğru sonucu veriyor.

-- --- Post ----------------------------------------------------------------
ALTER TABLE `Post`
  ADD COLUMN `isActive`    BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- Mevcut yazıların TAMAMI bugün yayında; göç sonrası da yayında kalıyor.
UPDATE `Post` SET `isActive` = true;

-- `publishedAt` = `createdAt`.
--
-- Bu bir tahmin değil, mevcut davranışın kaydı: `/blog` kart tarihini
-- `createdAt`'tan basıyor (bkz. app/pages/blog.vue) ve BlogPosting yapısal
-- verisi de aynı alanı kullanıyor. Yayın tarihi anlamı böylece
-- DEĞİŞMİYOR — ekranda görünen tarihler göç öncesi ve sonrası birebir aynı.
UPDATE `Post` SET `publishedAt` = `createdAt` WHERE `createdAt` IS NOT NULL;

-- Herkese açık her okuma bu sütunu süzüyor.
CREATE INDEX `Post_isActive_idx` ON `Post`(`isActive`);

-- --- Service -------------------------------------------------------------
ALTER TABLE `Service`
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT false;

-- Mevcut yedi hizmetin tamamı bugün yayında.
UPDATE `Service` SET `isActive` = true;
