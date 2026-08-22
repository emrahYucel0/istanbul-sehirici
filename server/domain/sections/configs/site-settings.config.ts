// server/domain/sections/configs/site-settings.config.ts
import prisma from '../../../utils/prisma'
import { createSectionCrudService } from '../section-crud.factory'

export interface SiteSettingsInput {
  sectionName?: string
  brandName?: string
  siteName?: string
  siteDescription?: string
  logo?: string
  favicon?: string
  ogImage?: string
  phone?: string
  mobilePhone?: string
  whatsAppNumber?: string
  email?: string
  address?: string
  facebookUrl?: string
  instagramUrl?: string
  twitterUrl?: string
  linkedinUrl?: string
  youtubeUrl?: string
  githubUrl?: string
  // ANALİTİK ALANLARI YAZMA SÖZLEŞMESİNDEN ÇIKARILDI (M6).
  // Herkese açık tüketicileri ölçüldü: sıfır. Projede gtag/GTM/dataLayer
  // yükleyen kod ve rıza altyapısı yok. Sütunlar şemada duruyor (veri
  // kaybı yok) ama panelden yazılamıyorlar — "doldur ama hiçbir şey olmuyor"
  // durumu bu turda kapatıldı.
  /** Genel çağrı — M6'da HeroPage'den devralındı. */
  ctaLabel?: string
  ctaLink?: string
  footerText?: string
  workingHours?: string
  googleMapsEmbed?: string
  latitude?: number | null
  longitude?: number | null
  priceRange?: string
  metaTitle?: string
  metaDescription?: string
  metaKeywords?: string
}

const mapScalarFields = (b: SiteSettingsInput) => ({
  brandName: b.brandName,
  siteName: b.siteName,
  siteDescription: b.siteDescription,
  logo: b.logo,
  favicon: b.favicon,
  ogImage: b.ogImage,
  phone: b.phone,
  mobilePhone: b.mobilePhone,
  whatsAppNumber: b.whatsAppNumber,
  email: b.email,
  address: b.address,
  facebookUrl: b.facebookUrl,
  instagramUrl: b.instagramUrl,
  twitterUrl: b.twitterUrl,
  linkedinUrl: b.linkedinUrl,
  youtubeUrl: b.youtubeUrl,
  githubUrl: b.githubUrl,
  ctaLabel: b.ctaLabel,
  ctaLink: b.ctaLink,
  footerText: b.footerText,
  workingHours: b.workingHours,
  googleMapsEmbed: b.googleMapsEmbed,
  latitude: b.latitude,
  longitude: b.longitude,
  priceRange: b.priceRange,
  metaTitle: b.metaTitle,
  metaDescription: b.metaDescription,
  metaKeywords: b.metaKeywords,
})

export const siteSettingsCrudService = createSectionCrudService<any, SiteSettingsInput>(prisma.siteSettings, {
  defaultSectionName: 'site-settings',
  mapParentCreate: mapScalarFields,
  mapParentUpdate: mapScalarFields,
  deleteStrategy: 'cascade',
  // Bu bölüm için GET'te kayıt yoksa varsayılan değerlerle otomatik oluşturuluyor
  // (diğer bölümlerden farklı, bilinçli olarak korunan davranış).
  createDefaultsOnMissingGet: () => ({
    brandName: 'Marka Adı',
    siteName: 'Sitem',
    siteDescription: 'Site açıklaması',
    copyrightText: '© Tüm hakları saklıdır.',
  }),
})
