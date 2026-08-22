-- ANA SAYFA KONTROLLÜ İÇERİĞİ
--
-- İki yeni tablo ve `ProcessStep` üzerinde beş yeni sütun. Hepsi eklemeli:
-- mevcut hiçbir satır güncellenmiyor, hiçbir sütun düşürülmüyor, hiçbir
-- varsayılan mevcut veriyi yeniden yazmıyor.
--
-- YAYIN DURUMU ALANI YOK. Ana sayfa bölümleri yayına alınmıyor: bölüm zaten
-- kodda ve her zaman render ediliyor. `isActive` eklemek, yöneticiye
-- tasarımın bir perdesini kapatma yetkisi vermek olurdu — M4'ün açıkça
-- dışında bıraktığı sayfa oluşturucu davranışı.

CREATE TABLE `HomeSection` (
  `id`          INTEGER NOT NULL AUTO_INCREMENT,
  `sectionKey`  VARCHAR(191) NOT NULL,
  `heading`     TEXT NULL,
  `lead`        TEXT NULL,
  `note`        TEXT NULL,
  `closing`     TEXT NULL,
  `closingNote` TEXT NULL,
  `ctaLabel`    VARCHAR(191) NULL,
  `imagePath`   VARCHAR(191) NULL,
  `imageAlt`    TEXT NULL,
  `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`   DATETIME(3) NOT NULL,

  UNIQUE INDEX `HomeSection_sectionKey_key`(`sectionKey`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `HomeSectionItem` (
  `id`        INTEGER NOT NULL AUTO_INCREMENT,
  `label`     VARCHAR(191) NULL,
  `subLabel`  VARCHAR(191) NULL,
  `title`     TEXT NULL,
  `body`      TEXT NULL,
  `imagePath` VARCHAR(191) NULL,
  `imageAlt`  TEXT NULL,
  `order`     INTEGER NOT NULL DEFAULT 0,
  `sectionId` INTEGER NOT NULL,

  INDEX `HomeSectionItem_sectionId_order_idx`(`sectionId`, `order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `HomeSectionItem`
  ADD CONSTRAINT `HomeSectionItem_sectionId_fkey`
  FOREIGN KEY (`sectionId`) REFERENCES `HomeSection`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;

-- V2 Süreç adımının V1 kart adımında karşılığı olmayan alanları.
-- Hepsi NULL: mevcut beş adım kaydı olduğu gibi kalıyor, backfill betiği
-- (prisma/anasayfa-icerik-tohum.mjs) V2 içeriğini ayrıca yazıyor.
ALTER TABLE `ProcessStep`
  ADD COLUMN `label`     VARCHAR(191) NULL,
  ADD COLUMN `imagePath` VARCHAR(191) NULL,
  ADD COLUMN `imageAlt`  TEXT NULL,
  ADD COLUMN `linkLabel` VARCHAR(191) NULL,
  ADD COLUMN `linkHref`  VARCHAR(191) NULL;
