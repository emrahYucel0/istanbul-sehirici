import * as yup from 'yup';
import { processSectionService, type ProcessSectionInput } from '../domain/sections/configs/process.config';

// DİKKAT: bu bölüm `deleteStrategy: 'manual'` ile çalışıyor — her PUT tüm
// adım satırlarını silip yeniden yaratıyor. Bir alan burada eksikse
// `stripUnknown: true` onu sessizce düşürür ve bir sonraki kayıtta o alanın
// içeriği tamamen kaybolur. Yeni alan eklerken hem burayı hem
// process.config.ts'teki `mapCreate`'i güncelleyin.
const processStepSchema = yup.object({
  title: yup.string().trim().notRequired(),
  description: yup.string().trim().notRequired(),
  iconPath: yup.string().trim().notRequired(),
  order: yup.number().notRequired(),
  label: yup.string().trim().notRequired(),
  imagePath: yup.string().trim().notRequired(),
  imageAlt: yup.string().trim().notRequired(),
  linkLabel: yup.string().trim().notRequired(),
  linkHref: yup.string().trim().notRequired(),
});

const processSectionSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
  mainTitle: yup.string().trim().notRequired(),
  description: yup.string().trim().notRequired(),
  steps: yup.array().of(processStepSchema).notRequired(),
});

const processDeleteSchema = yup.object({
  sectionName: yup.string().trim().notRequired(),
});

export default defineEventHandler(async (event) => {
  const method = event.node.req.method;

  if (method !== 'GET') {
    requireAdmin(event);
  }

  if (method === 'GET') {
    return processSectionService.get();
  }

  if (method === 'POST') {
    const validation = await validateOrError<ProcessSectionInput>(processSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return processSectionService.create(validation.data);
  }

  if (method === 'PUT') {
    const validation = await validateOrError<ProcessSectionInput>(processSectionSchema, await readBody(event));
    if (!validation.success) return validation;
    return processSectionService.update(validation.data);
  }

  if (method === 'DELETE') {
    const validation = await validateOrError<{ sectionName?: string }>(processDeleteSchema, await readBody(event));
    if (!validation.success) return validation;
    return processSectionService.remove(validation.data.sectionName);
  }

  return { error: `HTTP ${method} metodu desteklenmemektedir.` };
});
