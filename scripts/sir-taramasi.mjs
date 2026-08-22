// scripts/sir-taramasi.mjs
//
//     npm run sir-tara
//
// SIR SIZINTI TARAMASI — derleme çıktısında ve depo kaynağında gerçek
// gizli değer var mı?
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN VAR
//
// `nuxt.config.ts` içindeki `runtimeConfig` alanları DERLEME ANINDA
// `process.env`'den okunuyordu. Bu, `.env` dosyasındaki gerçek SMTP
// parolasının `.output/server/chunks/_/nitro.mjs` içine LİTERAL olarak
// yazılması demekti: derleme çıktısını paylaşan, parolayı da paylaşıyordu.
//
// Ayrıca çalışma zamanında `MAIL_PASSWORD` değiştirmek hiçbir işe
// yaramıyordu — değer artık ortamdan değil, gömülü metinden okunuyordu.
// Bu, bir QA turunda kazara gerçek bir e-posta gönderilmesine yol açtı.
//
// ─────────────────────────────────────────────────────────────────────────
// BU BETİK SIRRI ASLA YAZDIRMAZ
//
// Yalnızca "var / yok" ve eşleşme SAYISI basılıyor. Değerin kendisi,
// kırpılmış hâli, karması ya da ilk harfleri hiçbir yerde görünmüyor.
// Çıkış kodu 1 ise sızıntı var demektir (CI'da kapı olarak kullanılabilir).
//
// TARANAN YERLER
//   .output/server   → sunucu paketi   (sır burada OLMAMALI)
//   .output/public   → istemci paketi  (sır burada ASLA olmamalı)
//   depo kaynağı     → izlenen dosyalar (.env hariç; o zaten .gitignore'da)
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// `fileURLToPath` şart: proje yolu boşluk içeriyor ("FurniEveNakliye - Kopya")
// ve `URL.pathname` onu `%20` olarak bırakıyor — dosya okumaları sessizce
// başarısız olup taramayı "temiz" gösterirdi.
const KOK = dirname(dirname(fileURLToPath(import.meta.url)))

/** `.env` dosyasından gizli değerleri okur — yalnız karşılaştırma için. */
const sirlariOku = () => {
  const yol = join(KOK, '.env')
  if (!existsSync(yol)) return []
  const metin = readFileSync(yol, 'utf8')
  // Gizli sayılan anahtarlar. Ad değil DEĞER aranıyor: `process.env.MAIL_PASSWORD`
  // ifadesinin çıktıda geçmesi sorun değil, gerçek parolanın geçmesi sorun.
  const ANAHTARLAR = ['MAIL_PASSWORD', 'AUTH_SECRET', 'DATABASE_URL']
  return ANAHTARLAR.map((ad) => {
    const eslesme = metin.match(new RegExp(`^${ad}=(.*)$`, 'm'))
    const deger = eslesme ? eslesme[1].replace(/^["']|["']$/g, '').trim() : ''
    return { ad, deger }
  }).filter((s) => s.deger.length >= 8) // çok kısa değer yanlış eşleşme üretir
}

/**
 * DATABASE_URL bir bağlantı dizesi; içindeki parolayı ayrıca arıyoruz ki
 * tam dize değişse bile parola yakalansın.
 */
const parcalaraAyir = (sirlar) => {
  const liste = []
  for (const s of sirlar) {
    liste.push(s)
    if (s.ad === 'DATABASE_URL') {
      const p = s.deger.match(/:\/\/[^:]+:([^@]+)@/)
      if (p && p[1].length >= 8) liste.push({ ad: 'DATABASE_URL parolası', deger: p[1] })
    }
  }
  return liste
}

const ATLANAN_DIZIN = new Set(['node_modules', '.git', '.nuxt', '.nitro', '.cache', 'yedekler', 'prisma/generated'])

function* dosyalar(dizin, taban = dizin) {
  let girdiler
  try {
    girdiler = readdirSync(dizin, { withFileTypes: true })
  } catch {
    return
  }
  for (const g of girdiler) {
    const tam = join(dizin, g.name)
    const goreli = relative(taban, tam).replace(/\\/g, '/')
    if (g.isDirectory()) {
      if (ATLANAN_DIZIN.has(g.name) || ATLANAN_DIZIN.has(goreli)) continue
      yield* dosyalar(tam, taban)
    } else if (g.isFile()) {
      if (statSync(tam).size > 20 * 1024 * 1024) continue
      yield tam
    }
  }
}

/** Bir ağaçta kaç dosyada eşleşme var — dosya ADLARI döner, değer DÖNMEZ. */
const tara = (kokDizin, sirlar, suzgec = () => true) => {
  const sonuc = new Map(sirlar.map((s) => [s.ad, []]))
  if (!existsSync(kokDizin)) return { yok: true, sonuc }
  for (const dosya of dosyalar(kokDizin)) {
    if (!suzgec(dosya)) continue
    let icerik
    try {
      icerik = readFileSync(dosya, 'latin1') // ikili dosyalarda da metin araması yapabilmek için
    } catch {
      continue
    }
    for (const s of sirlar) {
      if (icerik.includes(s.deger)) sonuc.get(s.ad).push(relative(KOK, dosya).replace(/\\/g, '/'))
    }
  }
  return { yok: false, sonuc }
}

// --- çalıştır -------------------------------------------------------------
const sirlar = parcalaraAyir(sirlariOku())

if (!sirlar.length) {
  console.log('.env içinde taranacak gizli değer bulunamadı — tarama atlandı.')
  process.exit(0)
}

console.log(`taranan gizli değer sayısı: ${sirlar.length}  (değerler YAZDIRILMIYOR)\n`)

const hedefler = [
  { ad: 'SUNUCU PAKETİ   .output/server', dizin: join(KOK, '.output', 'server') },
  { ad: 'İSTEMCİ PAKETİ  .output/public', dizin: join(KOK, '.output', 'public') },
  {
    ad: 'DEPO KAYNAĞI    (izlenen dosyalar)',
    dizin: KOK,
    // `.env` ve derleme çıktısı hariç: ikisi de `.gitignore` içinde,
    // depoya girmiyorlar.
    suzgec: (d) => {
      const g = relative(KOK, d).replace(/\\/g, '/')
      return !g.startsWith('.output/') && !g.startsWith('.env') && !g.startsWith('dagitim/') && !g.startsWith('.tmp/')
    },
  },
]

let sizinti = 0

for (const hedef of hedefler) {
  const { yok, sonuc } = tara(hedef.dizin, sirlar, hedef.suzgec)
  console.log(hedef.ad)
  if (yok) {
    console.log('  (dizin yok — derleme yapılmamış)\n')
    continue
  }
  for (const [ad, dosyaListesi] of sonuc) {
    const n = dosyaListesi.length
    if (n) sizinti += n
    console.log(`  ${ad.padEnd(22)} gömülü: ${n ? 'EVET' : 'hayır'}   eşleşen dosya: ${n}`)
    dosyaListesi.slice(0, 5).forEach((d) => console.log(`      ${d}`))
  }
  console.log()
}

console.log(sizinti === 0 ? 'SONUÇ: sızıntı yok.' : `SONUÇ: ${sizinti} dosyada gizli değer bulundu.`)
process.exit(sizinti === 0 ? 0 : 1)
