// Canlı site SEO + erişilebilirlik denetimi.
//   node denetim.mjs https://istanbulevenakliyat.com
const TEMEL = (process.argv[2] || 'https://istanbulevenakliyat.com').replace(/\/$/, '')
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36'

const SAYFALAR = ['/', '/bolgelerimiz', '/kadikoy', '/hizmetlerimiz', '/evden-eve-nakliyat', '/blog', '/iletisim', '/hakkimizda']

const getir = async (yol) => {
  const c = await fetch(TEMEL + yol, { headers: { 'User-Agent': UA } })
  return { durum: c.status, basliklar: c.headers, html: await c.text() }
}

const tek = (html, re) => (html.match(re) || [])[1]
const hepsi = (html, re) => [...html.matchAll(re)]

console.log(`hedef: ${TEMEL}\n`)

// ── Güvenlik ve yanıt başlıkları (bir kez) ────────────────────────────────
{
  const { basliklar } = await getir('/')
  const bak = [
    'content-security-policy',
    'strict-transport-security',
    'x-content-type-options',
    'x-frame-options',
    'referrer-policy',
    'permissions-policy',
    'content-encoding',
  ]
  console.log('GÜVENLİK ve YANIT BAŞLIKLARI')
  for (const b of bak) {
    const d = basliklar.get(b)
    console.log(`  ${b.padEnd(28)} ${d ? d.slice(0, 60) : '— YOK'}`)
  }
  console.log()
}

// ── Sayfa bazlı ───────────────────────────────────────────────────────────
const sorunlar = []
console.log('SAYFA DENETİMİ')
console.log(
  '  ' +
    'sayfa'.padEnd(22) +
    'title'.padEnd(7) +
    'desc'.padEnd(7) +
    'h1'.padEnd(4) +
    'canon'.padEnd(7) +
    'og'.padEnd(4) +
    'JSON-LD'.padEnd(9) +
    'altsız görsel'
)

for (const yol of SAYFALAR) {
  const { durum, html } = await getir(yol)
  if (durum !== 200) {
    sorunlar.push(`${yol}: HTTP ${durum}`)
    continue
  }

  const title = tek(html, /<title[^>]*>([\s\S]*?)<\/title>/i) || ''
  const desc = tek(html, /<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || ''
  const h1ler = hepsi(html, /<h1[\s>]/gi)
  const canonical = /rel="canonical"/i.test(html)
  const ogCount = hepsi(html, /property="og:[a-z:]+"/gi).length
  const jsonld = hepsi(html, /type="application\/ld\+json"/gi).length

  // <img ...> etiketlerinde alt yokluğu. Vue SSR alt="" değerini çıplak
  // `alt` olarak basabiliyor; ikisi de "alt var" sayılıyor.
  const imgler = hepsi(html, /<img\b[^>]*>/gi).map((m) => m[0])
  const altsiz = imgler.filter((t) => !/\salt(=|[\s/>])/i.test(t))

  const s = (v, alt, ust) => (v.length === 0 ? 'YOK' : v.length < alt || v.length > ust ? `${v.length}!` : `${v.length}`)

  console.log(
    '  ' +
      yol.padEnd(22) +
      s(title, 30, 60).padEnd(7) +
      s(desc, 70, 160).padEnd(7) +
      String(h1ler.length).padEnd(4) +
      (canonical ? 'var' : 'YOK').padEnd(7) +
      String(ogCount).padEnd(4) +
      String(jsonld).padEnd(9) +
      `${altsiz.length}/${imgler.length}`
  )

  if (!title) sorunlar.push(`${yol}: title yok`)
  else if (title.length > 60) sorunlar.push(`${yol}: title ${title.length} karakter (60 üstü kesilir)`)
  if (!desc) sorunlar.push(`${yol}: meta description yok`)
  else if (desc.length > 160) sorunlar.push(`${yol}: description ${desc.length} karakter (160 üstü kesilir)`)
  if (h1ler.length !== 1) sorunlar.push(`${yol}: h1 sayısı ${h1ler.length} (1 olmalı)`)
  if (!canonical) sorunlar.push(`${yol}: canonical yok`)
  if (jsonld === 0) sorunlar.push(`${yol}: yapısal veri (JSON-LD) yok`)
  if (altsiz.length) sorunlar.push(`${yol}: ${altsiz.length} görselde alt yok`)
}

console.log('\n  ! işareti: uzunluk önerilen aralığın dışında')
console.log('  altsız görsel: alt niteliği HİÇ olmayan / toplam <img>')

// ── Başlık hiyerarşisi ────────────────────────────────────────────────────
console.log('\nBAŞLIK HİYERARŞİSİ (atlanan seviye var mı)')
for (const yol of ['/', '/kadikoy', '/hizmetlerimiz']) {
  const { html } = await getir(yol)
  const seviyeler = hepsi(html, /<h([1-6])[\s>]/gi).map((m) => Number(m[1]))
  const atlanan = []
  for (let i = 1; i < seviyeler.length; i++) {
    if (seviyeler[i] - seviyeler[i - 1] > 1) atlanan.push(`h${seviyeler[i - 1]}→h${seviyeler[i]}`)
  }
  console.log(`  ${yol.padEnd(16)} ${seviyeler.map((s) => 'h' + s).join(' ')}`)
  if (atlanan.length) {
    console.log(`  ${' '.padEnd(16)} ATLAMA: ${atlanan.join(', ')}`)
    sorunlar.push(`${yol}: başlık seviyesi atlanmış (${atlanan.join(', ')})`)
  }
}

// ── Yapısal veri türleri ──────────────────────────────────────────────────
console.log('\nYAPISAL VERİ (@type)')
for (const yol of ['/', '/kadikoy', '/evden-eve-nakliyat', '/blog']) {
  const { html } = await getir(yol)
  const bloklar = hepsi(html, /type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)
  const tipler = new Set()
  for (const b of bloklar) {
    for (const t of b[1].matchAll(/"@type"\s*:\s*"([^"]+)"/g)) tipler.add(t[1])
  }
  console.log(`  ${yol.padEnd(22)} ${[...tipler].join(', ') || '— yok'}`)
}

// ── lang ve viewport ──────────────────────────────────────────────────────
{
  const { html } = await getir('/')
  console.log('\nTEMEL ERİŞİLEBİLİRLİK')
  console.log(`  html lang               ${tek(html, /<html[^>]*\slang="([^"]*)"/i) || '— YOK'}`)
  console.log(`  viewport meta           ${/name="viewport"/i.test(html) ? 'var' : '— YOK'}`)
  console.log(`  skip link               ${/skip|atla/i.test(tek(html, /(<a[^>]*href="#[^"]*"[^>]*>[^<]*<\/a>)/i) || '') ? 'var' : 'yok/belirsiz'}`)
  const inputlar = hepsi(html, /<input\b[^>]*>/gi).map((m) => m[0]).filter((t) => !/type="(hidden|submit|button)"/i.test(t))
  const etiketsiz = inputlar.filter((t) => !/aria-label|aria-labelledby|\sid="/i.test(t))
  console.log(`  etiketsiz input         ${etiketsiz.length}/${inputlar.length}`)
}

console.log('\n' + '─'.repeat(60))
if (sorunlar.length === 0) {
  console.log('SORUN BULUNAMADI')
} else {
  console.log(`BULGULAR (${sorunlar.length})`)
  for (const s of sorunlar) console.log(`  · ${s}`)
}
