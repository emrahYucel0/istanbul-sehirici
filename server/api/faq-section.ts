import * as yup from 'yup';
import { faqSectionCrudService, type FaqSectionInput } from '../domain/sections/configs/faq-section.config';

const faqItemSchema = yup.object({
  question: yup.string().trim().notRequired(),
  answer: yup.string().notRequired(),
  order: yup.number().notRequired(),
  isActive: yup.boolean().notRequired(),
});

// ÖLÜ ALANLAR ŞEMADAN ÇIKARILDI (M6): description, ctaTitle, ctaButtonText,
// ctaButtonLink, statsCards, images ve soru içindeki `details`. Hepsinin
// herkese açık tüketicisi sıfırdı; gerekçe faq-section.config.ts içinde.
// `stripUnknown: true` olduğu için gövdeye elle eklenseler bile düşerler.
const faqSectionSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
  mainTitle: yup.string().trim().notRequired(),
  faqs: yup.array().of(faqItemSchema).notRequired(),
});

const faqSectionDeleteSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method !== 'GET') {
    requireAdmin(event);
  }

  if (method === 'GET') {
    return faqSectionCrudService.get();
  }

  if (method === 'POST') {
    const validation = await validateOrError<FaqSectionInput>(faqSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return faqSectionCrudService.create(validation.data);
  }

  if (method === 'PUT') {
    const validation = await validateOrError<FaqSectionInput>(faqSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return faqSectionCrudService.update(validation.data);
  }

  if (method === 'DELETE') {
    const validation = await validateOrError<{ sectionName?: string }>(faqSectionDeleteSchema, await readBody(event));
    if (!validation.success) return validation;
    return faqSectionCrudService.remove(validation.data.sectionName);
  }

  return { success: false, error: `HTTP ${method} metodu desteklenmemektedir.` };
});
