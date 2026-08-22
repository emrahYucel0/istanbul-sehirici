<script setup>
/**
 * PANELİN CANLI OLUP OLMADIĞINI SÖYLEYEN ŞERİT.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * NEDEN GEREKLİ
 *
 * Yönetim panelinde bugün hiçbir herkese açık sayfada render EDİLMEYEN
 * bölümlerin ekranları duruyor (Neden Bizi Seçmelisiniz, Biz Yardımcı
 * Oluyoruz, Müşteri Yorumları bölümü, Güven Bandı, Fiyat Planları).
 * Yönetici bunları düzenleyip kaydediyor, kayıt gerçekten yazılıyor ve
 * sitede hiçbir şey değişmiyor. Panelin kendisi yanlış bir şey söylemiyor —
 * hiçbir şey söylemiyor, sorun da bu.
 *
 * Şerit tam bir panel temizliği DEĞİL: ekranlar kaldırılmadı, veriler
 * silinmedi. Yalnız "bu ekran şu anda neyi etkiliyor" sorusu her ekranda
 * cevaplanıyor.
 */
defineProps({
  /**
   * 'canli'  — kayıt herkese açık bir sayfada görünüyor
   * 'kismi'  — kaydın yalnız bir kısmı kullanılıyor
   * 'olu'    — bugün hiçbir herkese açık sayfa bu kaydı okumuyor
   */
  durum: { type: String, required: true },
  /** Nerede göründüğü ya da neden görünmediği — tek cümle. */
  nerede: { type: String, required: true },
})

const BICIM = {
  canli: { etiket: 'CANLI', sinif: 'border-green-300 bg-green-50 text-green-900' },
  kismi: { etiket: 'KISMEN CANLI', sinif: 'border-amber-300 bg-amber-50 text-amber-900' },
  olu: { etiket: 'YAYINDA DEĞİL', sinif: 'border-gray-300 bg-gray-100 text-gray-700' },
}
</script>

<template>
  <div :class="['mb-6 flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded border p-3 text-sm', BICIM[durum].sinif]">
    <span class="text-xs font-bold uppercase tracking-wider">{{ BICIM[durum].etiket }}</span>
    <span>{{ nerede }}</span>
  </div>
</template>
