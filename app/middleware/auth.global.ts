// middleware/auth.global.ts
import { defineNuxtRouteMiddleware, navigateTo, useRequestFetch } from 'nuxt/app';

/**
 * YÖNETİM GİRİŞİ ARTIK AYRI BİR KÖK ROTADA.
 *
 * Giriş sayfası `/evdeneveyonetim` (dizin index'i) iken `/sehiriciyonetim`
 * kök sayfasına taşındı. Bunun iki sonucu var:
 *
 *   1. `/evdeneveyonetim` artık 404 — eski adresi bilen biri giriş formunu
 *      göremiyor. Bilerek YÖNLENDİRME KOYULMADI: bir yönlendirme yeni
 *      adresi herkese açık biçimde ifşa ederdi.
 *   2. Bu koruyucunun "giriş sayfasını hariç tut" istisnası gereksizleşti;
 *      `/evdeneveyonetim` altındaki HER yol artık kimlik istiyor.
 *
 * `/sehiriciyonetim` korumanın DIŞINDA kalmalı — kendisi giriş sayfası.
 * Güvenlik rota gizliliğine değil, bu kontrole ve `/api/session`e dayanıyor.
 *
 * KORUMA ALT YOLLARLA SINIRLI — ölçülen sebep. Koşul `startsWith('/evdeneveyonetim')`
 * iken ÇIPLAK `/evdeneveyonetim` de eşleşiyordu: sayfa dosyası artık olmadığı
 * hâlde istek 404'e ulaşamadan `302 → /sehiriciyonetim` dönüyordu, yani eski
 * adresi deneyen herkese yeni adres söyleniyordu. Alt yol öneki (`/` ile)
 * kullanılınca çıplak adres — sondaki eğik çizgili biçimi dahil — koruyucudan
 * geçip 404'e düşüyor.
 */
const GIRIS_YOLU = '/sehiriciyonetim';
const YONETIM_ONEKI = '/evdeneveyonetim/';

export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith(YONETIM_ONEKI) || to.path === YONETIM_ONEKI) {
    return;
  }

  // useRequestFetch: SSR sırasında gelen isteğin cookie'lerini /api/session'a taşır.
  // Düz $fetch bunu yapmaz, imzalı cookie olsa bile session'ı görünmez sayar.
  const requestFetch = useRequestFetch();
  const { authenticated } = await requestFetch('/api/session');

  if (!authenticated) {
    return navigateTo(GIRIS_YOLU);
  }
});
