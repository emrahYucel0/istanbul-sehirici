/**
 * SUNUCU HATASI KAYDI — üretimdeki hatalar bir yere yazılsın.
 *
 * NEDEN VAR
 * Sunucu hataları hiçbir yerde toplanmıyordu: `nuxt.config.ts`teki
 * `app:error` kancası 500/503'ü yutuyor, geri kalanı da yalnızca Nitro'nun
 * varsayılan çıktısına düşüyordu. 14 Ağustos 2026'daki 503'ü kullanıcı
 * fark etti, sistem değil.
 *
 * NE YAPIYOR
 * Nitro'nun `error` kancasına bağlanıp her sunucu hatasını TEK SATIR,
 * yapılandırılmış biçimde yazıyor. Tek satır olması bilinçli: cPanel'in
 * uygulama günlüğünde `grep` ile aranabilsin ve ileride bir günlük
 * toplayıcıya verilecekse ayrıştırılabilsin diye.
 *
 * NEDEN HARİCİ BİR SERVİS (Sentry vb.) DEĞİL
 * Sentry'nin tarayıcı SDK'sı istemci paketine ~35 KB ekliyor. Bu projede
 * istemci JS'ini 553 KB'dan 279 KB'a indirmek için epey emek harcandı;
 * ilk adımda o kazancın bir kısmını geri vermek doğru değil. Buradaki
 * kayıt sunucu tarafında ve BEDAVA. Gerçekten ihtiyaç duyulursa Sentry
 * sonradan, yalnızca sunucu tarafı yapılandırmasıyla eklenebilir.
 *
 * 404 KAYDEDİLMİYOR
 * Bilinmeyen adres bir uygulama hatası değil; botlar ve eski bağlantılar
 * yüzünden sürekli oluşuyor. Hepsini yazmak günlüğü gürültüye boğar ve
 * gerçek hatayı görünmez kılardı — kaçındığımız durumun aynısı.
 */
export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('error', (error: any, ctx: any) => {
    const kod = error?.statusCode ?? 500

    // İstemci kaynaklı durumlar (404, 400, 401 …) uygulama hatası değil.
    if (kod < 500) return

    const yol = ctx?.event?.path ?? '-'
    const yontem = ctx?.event?.node?.req?.method ?? '-'

    // Yığın izi ilk 3 satırla sınırlı: sebebi bulmaya yetiyor, günlüğü
    // sayfalarca doldurmuyor.
    const yigin = String(error?.stack ?? '')
      .split('\n')
      .slice(0, 3)
      .join(' | ')

    console.error(
      `[hata] ${new Date().toISOString()} ${kod} ${yontem} ${yol} :: ` +
        `${error?.message ?? 'bilinmeyen'} :: ${yigin}`
    )
  })
})
