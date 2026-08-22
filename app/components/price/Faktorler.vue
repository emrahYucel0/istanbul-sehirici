<script setup>
/**
 * 02 / HESABA NE GİRİYOR — ve 03 / HESABIN DIŞINDA NE KALIYOR.
 *
 * İKİ LİSTE, İKİ AYRI ŞEY. Ayrım bilinçli ve bu sayfanın en güven veren
 * yeri: birincisi formülün GERÇEKTEN kullandığı altı girdi, ikincisi
 * formülün hiç görmediği ama sahada tutarı değiştiren koşullar.
 *
 * Eski sayfa dört yuvarlak köşeli kart basıyordu ("Eşya miktarı", "Kat ve
 * asansör", "Mesafe", "Ek hizmetler") ve hepsini aynı kefeye koyuyordu —
 * hangisinin hesaba girdiği, hangisinin girmediği belli değildi.
 *
 * SOLDAKİ LİSTE HESAPLA AYNI KAYNAKTAN DEĞİL, AMA AYNI ALANLARI ANLATIYOR;
 * yeni bir girdi eklenirse burası da elle güncellenmeli. Bunu veriye
 * bağlamak için `app/utils/fiyat.ts` içindeki alan adlarını okumak
 * gerekirdi ve açıklama metinleri yine elle yazılacaktı — kazancı yok.
 */
/**
 * İÇERİK KAYNAĞI — `InternalPageSection('fiyat', 'girenler')` ve
 * `('fiyat', 'disarida')`.
 *
 * "HESABIN DIŞINDA KALANLAR" listesi bir TİCARİ KARAR: neyin fiyata dahil
 * olmadığını işletme belirliyor ve değiştiğinde bu listenin de değişmesi
 * gerekiyor. Kodda kalması, her değişiklikte sürüm çıkmak demekti.
 *
 * HESAPLAMA KATSAYILARI BURAYA TAŞINMADI: onların tek sahibi
 * `PriceEstimator` ve bu bileşen onları hiç okumuyor.
 */
const props = defineProps({
  girenler: { type: Object, default: () => ({}) },
  disarida: { type: Object, default: () => ({}) },
})

const girenlerListesi = computed(() => props.girenler.items || [])
const disaridaListesi = computed(() => props.disarida.items || [])
</script>

<template>
  <section class="ff-kap" aria-labelledby="faktor-baslik">
    <div class="ff sahne-alan">
      <p class="ff-kunye op-kunye">02 / HESABA NE GİRİYOR</p>
      <h2 id="faktor-baslik" class="ff-h2 tip-anlati">{{ girenler.heading }}</h2>

      <p v-if="girenler.lead" class="ff-giris tip-giris">{{ girenler.lead }}</p>

      <dl class="ff-liste">
        <div v-for="(g, i) in girenlerListesi" :key="i" class="ff-oge">
          <dt class="ff-etiket op-kunye">{{ g.label }}</dt>
          <dd class="ff-metin tip-not">{{ g.body }}</dd>
        </div>
      </dl>

      <div class="ff-disarida">
        <p class="ff-alt-kunye op-kunye">03 / HESABIN DIŞINDA KALANLAR</p>
        <h3 class="ff-h3 tip-alt">{{ disarida.heading }}</h3>
        <p v-if="disarida.lead" class="ff-alt-giris tip-not">{{ disarida.lead }}</p>

        <dl class="ff-liste ff-liste--alt">
          <div v-for="(d, i) in disaridaListesi" :key="i" class="ff-oge">
            <dt class="ff-etiket op-kunye">{{ d.label }}</dt>
            <dd class="ff-metin tip-not">{{ d.body }}</dd>
          </div>
        </dl>
      </div>
    </div>
  </section>
</template>

<style scoped>
.ff-kap {
  background: rgb(var(--c-paper));
  color: rgb(var(--c-ink));
  border-top: 1px solid rgb(var(--c-rule));
}
.ff {
  padding-block: var(--sahne-dikey);
}
.ff-kunye {
  margin-bottom: clamp(0.75rem, 0.5rem + 0.8vw, 1.25rem);
}
.ff-h2 {
  max-width: 18ch;
}
.ff-giris {
  margin: clamp(1rem, 0.85rem + 0.6vw, 1.5rem) 0 0;
}

.ff-liste {
  margin: clamp(1.75rem, 1.5rem + 1vw, 2.75rem) 0 0;
  padding: 0;
  /* Alt çizgi kapsayıcıda: ızgara boşlukları çizgiyi bölmesin. */
  border-bottom: 1px solid rgb(var(--c-rule));
}
.ff-oge {
  border-top: 1px solid rgb(var(--c-rule));
  padding-block: clamp(0.75rem, 0.65rem + 0.4vw, 1rem);
}
.ff-etiket {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ff-metin {
  margin: 0.25rem 0 0;
  max-width: var(--olcu-govde);
}

.ff-disarida {
  margin-top: clamp(2.5rem, 2rem + 2vw, 4rem);
  padding-top: clamp(1.5rem, 1.25rem + 1vw, 2.25rem);
  border-top: 2px solid rgb(var(--c-ink));
}
.ff-alt-kunye {
  margin: 0;
  color: rgb(var(--c-ink-soft));
}
.ff-h3 {
  margin: clamp(0.5rem, 0.4rem + 0.4vw, 0.875rem) 0 0;
  max-width: 22ch;
}
.ff-alt-giris {
  margin: clamp(0.75rem, 0.65rem + 0.4vw, 1rem) 0 0;
  max-width: var(--olcu-govde);
}
.ff-liste--alt {
  margin-top: clamp(1.25rem, 1rem + 0.8vw, 1.75rem);
}

@media (min-width: 1024px) {
  .ff {
    display: grid;
    grid-template-columns: repeat(12, minmax(0, 1fr));
    column-gap: var(--sahne-kolon-arasi);
  }
  .ff-kunye {
    grid-column: 1 / 8;
  }
  .ff-h2 {
    grid-column: 2 / 7;
  }
  .ff-giris {
    grid-column: 8 / 13;
    align-self: end;
    margin: 0;
  }
  /* Kütük 11'de bitiyor: metin 58ch'te durduğu için 13'e uzatılsaydı çizgi
     boşlukta devam ederdi. */
  .ff-liste {
    grid-column: 2 / 11;
  }
  .ff-oge {
    display: grid;
    grid-template-columns: minmax(0, 22ch) minmax(0, 1fr);
    column-gap: var(--sahne-kolon-arasi);
    align-items: baseline;
  }
  .ff-metin {
    margin-top: 0;
  }
  .ff-disarida {
    grid-column: 1 / 13;
  }
  .ff-alt-kunye,
  .ff-h3,
  .ff-alt-giris {
    max-width: 46ch;
  }
  .ff-liste--alt {
    grid-column: auto;
  }
}
</style>
