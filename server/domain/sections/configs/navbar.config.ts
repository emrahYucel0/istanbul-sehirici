// server/domain/sections/configs/navbar.config.ts
//
// ÜST MENÜ — TEK CANLI ALAN: `logo`.
//
// ─────────────────────────────────────────────────────────────────────────
// ÇOCUK LİSTELERİ YAZMA YOLUNDAN ÇIKARILDI (M6)
//
// Burada `socialLinks` ve `contacts` çocuk listeleri vardı. ÖLÇÜLDÜ:
// `components/fixed/Navbar.vue` bu kayıttan yalnız `logo` okuyor. Sosyal
// hesaplar ve iletişim satırları hiçbir yerde basılmıyordu — üstelik ikisi
// de İKİNCİ KAYNAKTI, çünkü navbar'daki telefon/WhatsApp ve footer'daki
// sosyal bağlantılar Site Ayarları'ndan geliyor.
//
// Bölüm fabrikası çocukları her PUT'ta silip yeniden yarattığı için, panelin
// bu alanları göndermeyi bırakması kayıtları silerdi. Yazma yolundan
// tamamen çıkarılınca uç nokta onlara HİÇ dokunmuyor.
//
// `manualDeleteDelegates` de boşaltıldı: bölüm kaydı silinirse yabancı
// anahtar hatası verir — bu DOĞRU davranış, sessiz veri kaybından iyidir.
//
// TABLOLAR VE KAYITLAR DURUYOR (NavbarSocialLink: 0, NavbarContacts: 1).
import prisma from '../../../utils/prisma'
import { createSectionCrudService } from '../section-crud.factory'

export interface NavbarInput {
  sectionName?: string
  logo?: string
}

export const navbarCrudService = createSectionCrudService<any, NavbarInput>(prisma.navbar, {
  defaultSectionName: 'navbars',
  // Yanıt yalnız canlı alanı taşıyor.
  include: {},
  children: [],
  mapParentCreate: (b) => ({ logo: b.logo }),
  mapParentUpdate: (b) => ({ logo: b.logo }),
  deleteStrategy: 'manual',
  manualDeleteDelegates: [],
})
