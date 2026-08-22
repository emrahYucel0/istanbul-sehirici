import * as yup from 'yup';
import { siteSettingsCrudService, type SiteSettingsInput } from '../domain/sections/configs/site-settings.config';

const siteSettingsSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
  brandName: yup.string().trim().notRequired(),
  siteName: yup.string().trim().notRequired(),
  siteDescription: yup.string().notRequired(),
  logo: yup.string().trim().notRequired(),
  favicon: yup.string().trim().notRequired(),
  ogImage: yup.string().trim().notRequired(),
  phone: yup.string().trim().notRequired(),
  mobilePhone: yup.string().trim().notRequired(),
  whatsAppNumber: yup.string().trim().notRequired(),
  email: yup.string().trim().notRequired(),
  address: yup.string().trim().notRequired(),
  facebookUrl: yup.string().trim().notRequired(),
  instagramUrl: yup.string().trim().notRequired(),
  twitterUrl: yup.string().trim().notRequired(),
  linkedinUrl: yup.string().trim().notRequired(),
  youtubeUrl: yup.string().trim().notRequired(),
  githubUrl: yup.string().trim().notRequired(),
  // Analitik kimlikleri şemadan ÇIKARILDI (M6). `stripUnknown: true`
  // olduğu için gövdeye elle eklenseler bile düşerler — panelden
  // yazılamayan bir alanın API'de kabul edilmesi, yeniden aynı yanılgıyı
  // kurardı. Sütunlar veri tabanında duruyor.
  ctaLabel: yup.string().trim().max(60).notRequired(),
  ctaLink: yup.string().trim().max(191).notRequired(),
  footerText: yup.string().notRequired(),
  // `copyrightText` ŞEMADAN ÇIKARILDI (M7): alt bilgi telif satırını
  // `© {yıl} {marka}` olarak kendisi üretiyor ve bu alanı hiç okumuyor.
  // Sütun veri tabanında duruyor.
  workingHours: yup.string().trim().notRequired(),
  googleMapsEmbed: yup.string().notRequired(),
  // Yapısal veri (MovingCompany) alanları. Boş string geldiğinde null'a
  // çevriliyor: yup sayı alanına boş string verilince NaN üretir ve o da
  // veritabanına yazılamaz.
  latitude: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? null : v))
    .min(-90)
    .max(90)
    .nullable()
    .notRequired(),
  longitude: yup
    .number()
    .transform((v, o) => (o === '' || o === null ? null : v))
    .min(-180)
    .max(180)
    .nullable()
    .notRequired(),
  priceRange: yup.string().trim().notRequired(),
  metaTitle: yup.string().trim().notRequired(),
  metaDescription: yup.string().notRequired(),
  metaKeywords: yup.string().trim().notRequired(),
});

const siteSettingsDeleteSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method !== 'GET') {
    requireAdmin(event);
  }

  if (method === 'GET') {
    return siteSettingsCrudService.get();
  }

  if (method === 'POST') {
    const validation = await validateOrError<SiteSettingsInput>(siteSettingsSchema, await readBody(event));
    if (!validation.success) return validation;
    return siteSettingsCrudService.create(validation.data);
  }

  if (method === 'PUT') {
    const validation = await validateOrError<SiteSettingsInput>(siteSettingsSchema, await readBody(event));
    if (!validation.success) return validation;
    return siteSettingsCrudService.update(validation.data);
  }

  if (method === 'DELETE') {
    const validation = await validateOrError<{ sectionName?: string }>(siteSettingsDeleteSchema, await readBody(event));
    if (!validation.success) return validation;
    return siteSettingsCrudService.remove(validation.data.sectionName);
  }

  return { success: false, error: `HTTP ${method} metodu desteklenmemektedir.` };
});
