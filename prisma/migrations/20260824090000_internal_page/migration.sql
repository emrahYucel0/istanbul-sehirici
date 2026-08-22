-- M7 — İÇ SAYFA EDİTORYAL İÇERİĞİ.
--
-- SALT EKLEME. Var olan hiçbir tabloya, sütuna veya kayda dokunulmuyor.
-- İçerik ayrı bir tohum betiğiyle (prisma/ic-sayfa-tohum.mjs) BUGÜN CANLIDA
-- olan V2 metinlerinden dolduruluyor; yani göç sonrası sayfalar birebir aynı
-- görünüyor, değişen tek şey metnin NEREDEN geldiği.
CREATE TABLE `InternalPageSection` (
  `id`         INTEGER NOT NULL AUTO_INCREMENT,
  `pageKey`    VARCHAR(191) NOT NULL,
  `sectionKey` VARCHAR(191) NOT NULL,
  `heading`    TEXT NULL,
  `lead`       TEXT NULL,
  `note`       TEXT NULL,
  `closing`    TEXT NULL,
  `imagePath`  VARCHAR(191) NULL,
  `imageAlt`   TEXT NULL,
  `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt`  DATETIME(3) NOT NULL,
  UNIQUE INDEX `InternalPageSection_pageKey_sectionKey_key`(`pageKey`, `sectionKey`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `InternalPageItem` (
  `id`        INTEGER NOT NULL AUTO_INCREMENT,
  `label`     TEXT NULL,
  `title`     TEXT NULL,
  `body`      TEXT NULL,
  `imagePath` VARCHAR(191) NULL,
  `imageAlt`  TEXT NULL,
  `order`     INTEGER NOT NULL DEFAULT 0,
  `sectionId` INTEGER NOT NULL,
  INDEX `InternalPageItem_sectionId_order_idx`(`sectionId`, `order`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

ALTER TABLE `InternalPageItem`
  ADD CONSTRAINT `InternalPageItem_sectionId_fkey`
  FOREIGN KEY (`sectionId`) REFERENCES `InternalPageSection`(`id`)
  ON DELETE CASCADE ON UPDATE CASCADE;
