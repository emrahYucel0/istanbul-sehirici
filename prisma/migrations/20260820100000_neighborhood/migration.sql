-- MAHALLE TABLOSU.
--
-- Mahalleler bugüne kadar `Region.neighborhoods` JSON alanında yalnız AD
-- olarak duruyordu. Gezinme için yetiyordu, içerik üretimi için yetmiyor:
-- mahalle başına başlık, gövde, arama açıklaması, SSS ve yayın durumu
-- gerekiyor.
--
-- `Region.neighborhoods` BU GÖÇTE SİLİNMİYOR — 473 adın kaynağı orası ve
-- import betiği oradan besleniyor. Geçiş tamamlanana kadar ikisi birlikte.
--
-- `canonicalPath` UNIQUE: adres çakışma politikası (bkz.
-- shared/utils/mahalle.ts) böylece bir veri tabanı kısıtına dönüşüyor,
-- iki mahalle aynı adresi asla alamıyor.
CREATE TABLE `Neighborhood` (
  `id`              INTEGER      NOT NULL AUTO_INCREMENT,
  `districtId`      INTEGER      NOT NULL,
  `name`            VARCHAR(191) NOT NULL,
  `slug`            VARCHAR(191) NOT NULL,
  `canonicalPath`   VARCHAR(191) NOT NULL,
  `isActive`        BOOLEAN      NOT NULL DEFAULT false,
  `title`           VARCHAR(191) NULL,
  `excerpt`         TEXT         NULL,
  `content`         TEXT         NULL,
  `metaTitle`       VARCHAR(191) NULL,
  `metaDescription` TEXT         NULL,
  `faqs`            JSON         NULL,
  `facts`           JSON         NULL,
  `imagePath`       VARCHAR(191) NULL,
  `imageAlt`        VARCHAR(191) NULL,
  `createdAt`       DATETIME(3)  NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`       DATETIME(3)  NULL,

  UNIQUE INDEX `Neighborhood_canonicalPath_key`(`canonicalPath`),
  UNIQUE INDEX `Neighborhood_districtId_slug_key`(`districtId`, `slug`),
  INDEX `Neighborhood_districtId_idx`(`districtId`),
  INDEX `Neighborhood_isActive_idx`(`isActive`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- İlçe silinirse mahalleleri de gider: başka bir ilçeye yetim bağlanmaları
-- anlamsız olurdu.
ALTER TABLE `Neighborhood`
  ADD CONSTRAINT `Neighborhood_districtId_fkey`
  FOREIGN KEY (`districtId`) REFERENCES `Region`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
