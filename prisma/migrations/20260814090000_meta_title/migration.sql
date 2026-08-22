-- Bölge, hizmet ve blog sayfaları için elle girilebilen arama başlığı.
-- Boş bırakılırsa uygulama `başlık | marka` biçimini otomatik üretir,
-- yani bu sütun NULL kalabilir ve mevcut sayfalar etkilenmez.
ALTER TABLE `Region` ADD COLUMN `metaTitle` VARCHAR(191) NULL;
ALTER TABLE `Service` ADD COLUMN `metaTitle` VARCHAR(191) NULL;
ALTER TABLE `Post` ADD COLUMN `metaTitle` VARCHAR(191) NULL;
