# Hareket ve CSS Mühendisliği Sözleşmesi

Bu belge tercih listesi değil, **kabul kriteridir.** Maddelerin tamamı
`app/pages/prototip/surec.vue` prototipinde yaşanarak çıkarıldı — hiçbiri
teorik değil.

Referans uygulama: **`/prototip/surec`** (onaylanmış).

---

## 1. `animation` kısayolu YASAK

Scroll zaman çizelgesi kullanılan hiçbir yerde `animation` kısayolu
kullanılmaz. Uzun yazım zorunlu:

```css
/* YANLIŞ — timeline ve range sessizce sıfırlanır */
.parca { animation-timeline: --sahne; animation-range: contain 0% contain 100%; }
.parca { animation: yerles linear both; }

/* DOĞRU */
.parca {
  animation-name: yerles;
  animation-duration: auto;
  animation-timing-function: linear;
  animation-fill-mode: both;
  animation-timeline: --sahne;
  animation-range: contain 0% contain 100%;
}
```

**Neden:** `animation` kısayolu `animation-timeline` ve `animation-range`
değerlerini başlangıç değerlerine döndürür. Prototipte ölçüldü:

```
kısayolla   timeline=auto    range=normal/normal   dur=0s
uzun yazım  timeline=--sahne range=contain/contain dur=auto
```

`timeline: auto` + `duration: 0s` + `fill: both` birleşince animasyon sayfa
yüklenir yüklenmez biter ve **son kareye kilitlenir**. Ekranda hiçbir hata
görünmez — sadece koreografi hiç oynamaz. Bu hata prototipte bir tur
kaybettirdi ve gözle teşhis edilemedi; ancak hesaplanmış stil okunarak
bulundu.

**Denetim:** `grep -n "animation: [a-z]" app/**/*.vue` — çıktı yalnızca
`animation: none` içerebilir.

---

## 2. Şeffaflıkla hareket YASAK

`opacity: 0` ile başlayan hiçbir belirme animasyonu yazılmaz.

**Neden:** görünüm alanının altındaki şeffaf öğeler erişilebilirlik
denetiminde kalıcı "yetersiz kontrast" sayılıyor. Önceki projede
şeffaflık kaldırılıp hareket korununca erişilebilirlik **96 → 100**
çıktı.

Bunun doğal sonucu: **görünürlük sınırı kırpma ile kurulur**, solmayla
değil. Metin rayında iki metnin ara karede üst üste görünmesi de bu yolla
çözüldü (bkz. madde 5).

---

## 3. İyileştirme opt-in, gizleme opt-out değil

Varsayılan düzen **normal akış** olmalı. Sahne davranışı yalnızca şu iki
koşul birlikte sağlandığında devreye girer:

```css
@supports (animation-timeline: view()) {
  @media (prefers-reduced-motion: no-preference) { … }
}
```

Böylece üç durum aynı okunabilir çıktıyı alır:

```
tarayıcı desteklemiyor · kullanıcı hareket istemiyor · JS yok
```

Hiçbir içerik "önce gizlenip sonra gösterilmez". İçerik ilk HTML'de tam ve
sıralıdır; animasyon yalnızca görsel katmandır.

---

## 4. Sahne kompozisyonu: kadro sabit, yerleşim değişir

- Sahnedeki parçalar **%0'da DOM'da vardır**; hiçbiri dışarıdan gelmez.
- Değişen şey **ağırlığın nerede olduğudur**, parçaların varlığı değil.
- Ağırlık transferi **iki eksende** olmalı. Tek eksenli bölme çizgisi
  tanımı gereği bir before/after slider'dır ve metafor okunmaz —
  prototipte bir tur bu yüzden kaybedildi.
- Transferin okunması için **boşalan alanın görülmesi** şart. Zemin
  (ızgara/alan) görünür olmalı; boş hücre metaforun kalbidir.
- Yalnız pencere değil **içerik de hareket etmeli**. Sadece maske kayarsa
  fotoğraf yerinde duran bir duvar gibi görünür.
- Küçülen bir görselin son kırpımı **anlamını korumalı**; tanınmaz bir
  doku parçasına dönüşmemeli.
- Son %15'te büyük hareket kalmaz — kompozisyon oturur ve susar.

---

## 5. Kaydırılan kolonun kırpma sınırı

Kayan bir metin kolonunda yuva, pencereden **uzun** olmalı:

```
yuva %160 · pencere %100 · başlangıç ofseti -%30
```

**Neden:** yuva pencereyle aynı yükseklikteyken geçişin ortasında çıkan
metnin altı ile giren metnin üstü aynı anda görünür. Yuva uzatılıp metin
yuvanın ortasına yerleştirilince, geçiş ortasında her ikisi de pencerenin
dışında kalır.

Başlangıç ofseti taşan payın yarısıdır: `(160 − 100) / 2 = 30`.

---

## 6. Düzen animasyonu yerine kırpma ve dönüşüm

`grid-template-*`, `width`, `height`, `top/left` animasyonlanmaz.
Hücre değişimi görsel sonuç olarak tanımlanır; teknik yöntem (kırpma,
dönüşüm vb.) **prototipte profiling ile** seçilir.

Hiçbir tekniğin "compositor'da çalıştığı, dolayısıyla bedava olduğu"
varsayılmaz — ölçülür.

---

## 7. Mobil ayrı bir kompozisyon problemi

- Mobilde **pin kullanılmaz.** Bölüm normal akar.
- Sahne, masaüstündeki hareketin **sadeleştirilmiş karşılığı** olmalı —
  ayrı bir fikir değil. Dört perde üçe iner, şekil korunur.
- Metin kolonu mobilde kaymaz; küçük ekranda kayan metin okuma yüküdür.

---

## 8. Kütüphane kararı ölçümle verilir

Popüler olduğu için GSAP alınmaz; bağımlılık olmasın diye karmaşık motor
yazılmaz. Aynı sahne iki yolla kurulup **TBT ve INP** ile karşılaştırılır.

Ölçüm gerçek orta seviye Android'de yapılır; emülasyon bu soruyu
cevaplamaz.

Prototipte native CSS koreografisi **0 bayt JS** ile kuruldu — ama bu
"native kazandı" demek değil, yalnız bayt tarafında kazandı demektir.

---

## 9. Teşhis yöntemi

Bir koreografi gözle "çalışmıyor" göründüğünde sıra şudur:

1. **Üç kanonik durumu scroll'dan bağımsız sabitle** (`?durum=`) ve ekran
   görüntüsüyle doğrula. Sabit durumlar doğruysa sorun zaman eksenindedir.
2. **Hesaplanmış stili tarayıcıya okut** —
   `getComputedStyle(el).animationTimeline / animationRange /
   animationDuration`. Sessiz sıfırlanmalar ancak burada görünür.
3. `clip-path` **düzen geometrisini değiştirmez**; `getBoundingClientRect`
   ile ölçmek işe yaramaz. Doğrulama ekran görüntüsüyle yapılır.

---

## 10. Derleme tuzağı: `/yuklemeler/` yolları

Çalışma anında sunulan görsel yolları şablona **düz metin `src` olarak
yazılmaz**; değişkende tutulup `:src` ile bağlanır.

```
src="/yuklemeler/…"   →  UNRESOLVED_IMPORT, derleme kırılır
:src="FOTO_A"         →  doğru
```

**Neden:** `/yuklemeler/` derleme zamanında var olan bir klasör değil,
dosyalar bir Nitro rotasıyla sunuluyor. Vite düz `src`'yi statik varlık
sanıp çözmeye çalışıyor.

---

## 11. Yapışkan chrome altında pin ofseti

Pinlenen bir kompozisyon kalıcı bir yapışkan chrome'un (navbar, duyuru
şeridi) altında çalışıyorsa **block-start ofseti o chrome'un yüksekliğini
hesaba katmalıdır**. Aksi hâlde sahnenin üst şeridi kalıcı olarak
chrome'un altında kalır.

```
top: 0;   height: 100vh;                       →  üst şerit görünmez
top: H;   height: calc(100vh - H);             →  doğru
```

**Nasıl ortaya çıktı:** prototip `layout: false` ile, yani navbar olmadan
çalışıyordu. Aynı sahne ana sayfaya taşınınca navbar (`sticky; top: 0`,
masaüstünde 64px) üst şeridi örttü. Prototip bağlamında görünmesi mümkün
olmayan bir sınıf hata.

**H mümkün olduğunda ortak bir kaynaktan/token'dan yönetilmelidir.**
Bugün `Surec.vue` içindeki `--sh-navbar: 64px` ile `Navbar.vue`'daki
`min-height` elle eşleşiyor; ikisi ayrı ayrı değiştirilebildiği için bu
bir borçtur.

---

## 12. `kadraj` değerleri hesaplanır, göz kararı verilmez

Bir fotoğrafın penceresi küçülürken içeriğinin nereye kayacağı **tahmin
edilmez**. Her kanonik durumda anlam taşıyan semantik odak noktası
korunmalı ve sonuç ekran görüntüsüyle doğrulanmalıdır.

Görünen nokta, ölçek `S` ve öteleme `T` için:

```
f = 0,5 + S · (p + T − 0,5)

p : kaynaktaki nokta (kutu koordinatında)
f : kutudaki hedef konum
```

`object-fit: cover` varsa `p` önce kırpmaya göre kutu koordinatına
çevrilir. Çözülen `T` için ayrıca **kapsama kontrolü** yapılır: görselin
kenarları ötelemeden sonra pencereyi hâlâ tamamen doldurmalı, yoksa boş
kenar açılır.

**Odak noktası öznenin geometrik merkezi olmak zorunda değildir.** Stage
entegrasyonunda ambalajlı koltuğun merkezine nişan alınan sürümde son
küçük karede yalnız ambalaj dokusu kaldı; operasyondan insan çıkmadı.
Doğru nokta işçi ile koltuğun birleştiği yerdi. Odak, kadrajın *anlamını*
taşıyan detaydır.
