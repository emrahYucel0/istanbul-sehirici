-- M6 — GENEL ÇAĞRI ALANLARININ SAHİBİ DEĞİŞİYOR.
--
-- `HeroPage.primaryButton` / `primaryLink`, İstanbul dışı legacy bölge
-- sayfalarının kapanış bandını besliyordu. HeroPage'in kalan 10 alanının
-- herkese açık tüketicisi yok; iki canlı alan için 12 alanlık bir panel
-- canlıymış gibi duruyordu.
--
-- Bu göç YALNIZCA EKLİYOR: yeni iki sütun açılıyor ve mevcut değerler
-- birebir kopyalanıyor. HeroPage tablosu ve içindeki veri OLDUĞU GİBİ
-- duruyor (geri alınabilirlik için). Görünen metin ve adres değişmiyor.
ALTER TABLE `SiteSettings` ADD COLUMN `ctaLabel` VARCHAR(191) NULL;
ALTER TABLE `SiteSettings` ADD COLUMN `ctaLink` VARCHAR(191) NULL;

-- BİREBİR KOPYA. Varsayılan yazılmıyor: HeroPage'de ne varsa o taşınıyor.
-- Zaten dolu bir değer varsa (tekrar çalıştırma) üzerine YAZILMIYOR.
UPDATE `SiteSettings` s
  JOIN `HeroPage` h ON h.`sectionName` = 'heros'
SET s.`ctaLabel` = COALESCE(s.`ctaLabel`, h.`primaryButton`),
    s.`ctaLink`  = COALESCE(s.`ctaLink`,  h.`primaryLink`)
WHERE s.`sectionName` = 'site-settings';
