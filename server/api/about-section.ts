import * as yup from 'yup';
import { aboutSectionService, type AboutSectionInput } from '../domain/sections/about-section.service';

// ÖLÜ ALANLAR ŞEMADAN ÇIKARILDI (M6).
//
// `hakkimizda.vue` okuduğu alanları AÇIK BİR BEYAZ LİSTEYLE seçiyor
// (`const ALANLAR = [...]`, sekiz alan). Beyaz listede olmayan her şey
// sayfaya hiç gitmiyor:
//
//   seoTitle / seoDescription  Sayfanın SEO sahibi Meta("about");
//                              ikinci bir düzenleme yüzeyi, yöneticinin
//                              hangi panelin kazandığını bilememesi demek.
//   teamImage / teamImageAlt   Görsel sentetik ve "gerçek ekibimiz" diye
//                              sunuluyordu; sayfadan çıkarılmıştı.
//   services / stats           Altı hizmet ve dört istatistik kaydı;
//                              hiçbiri basılmıyor.
//
// Sütunlar, tablolar ve içindeki veriler DURUYOR.
const aboutSectionSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
  mainTitle: yup.string().trim().notRequired(),
  description1: yup.string().trim().notRequired(),
  description2: yup.string().trim().notRequired(),
  description3: yup.string().trim().notRequired(),
  historyTitle: yup.string().trim().notRequired(),
  historyText1: yup.string().trim().notRequired(),
  historyText2: yup.string().trim().notRequired(),
  historyText3: yup.string().trim().notRequired(),
});

const aboutSectionDeleteSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method !== 'GET') {
    requireAdmin(event);
  }

  if (method === 'GET') {
    return aboutSectionService.get();
  }

  if (method === 'POST') {
    const validation = await validateOrError<AboutSectionInput>(aboutSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return aboutSectionService.create(validation.data);
  }

  if (method === 'PUT') {
    const validation = await validateOrError<AboutSectionInput>(aboutSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return aboutSectionService.update(validation.data);
  }

  if (method === 'PATCH') {
    const validation = await validateOrError<Partial<AboutSectionInput>>(aboutSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return aboutSectionService.partialUpdate(validation.data);
  }

  if (method === 'DELETE') {
    const validation = await validateOrError<{ sectionName?: string }>(aboutSectionDeleteSchema, await readBody(event));
    if (!validation.success) return validation;
    return aboutSectionService.remove(validation.data.sectionName);
  }

  return {
    success: false,
    error: `HTTP ${method} metodu desteklenmemektedir. Desteklenen metodlar: GET, POST, PUT, PATCH, DELETE`,
  };
});
