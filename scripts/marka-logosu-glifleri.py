# -*- coding: utf-8 -*-
"""
LOGO DİZGİSİ İÇİN GLİF KONTURLARINI ÇIKARIR.

    python scripts/marka-logosu-glifleri.py

NEDEN BU ADIM VAR
Logo `scripts/marka-logosu.mjs` tarafından kuruluyor ama harfler orada
<text> olarak YAZILAMAZ: logo dosyası siteden bağımsız kullanılıyor
(e-posta imzası, Google İşletme Profili, antetli kâğıt) ve o ortamlarda
Archivo yüklü değil — <text> kullanılsaydı her yerde başka bir yazı
tipiyle, yani başka bir logoyla görünürdü.

Bu betik Archivo'nun GERÇEK konturlarını çıkarıyor; logo bir daha hiçbir
yazı tipine bağlı olmuyor.

AĞIRLIK 790: `Footer.vue` içindeki `.fr-marka` ile aynı değer. Logo ile
sitedeki marka yazısı aynı ağırlıkta olsun diye; uydurulmuş bir sayı değil.

ÇIKTI `scripts/veri/archivo-790-kapital.json` — depoya giriyor. Bu sayede
logoyu yeniden üretmek için Python GEREKMİYOR; yalnız glif verisi
değişecekse (ağırlık/harf) bu betik tekrar çalıştırılır.

JSON SAF ASCII yazılıyor (ensure_ascii=True). Sebebi ölçülmüş bir kaza:
İ (U+0130) kabuk üzerinden geçerken U+FFFD'ye dönüşüp veriyi sessizce
bozdu. Kaçış dizisi olarak yazılınca hiçbir kodlama katmanı dokunamıyor.

GEREKSİNİM
    pip install fonttools brotli
"""
import json
import os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.boundsPen import BoundsPen

KAYNAK = 'public/fonts/archivo.woff2'
HEDEF = 'scripts/veri/archivo-790-kapital.json'
AGIRLIK = 790

# "EGE KENT NAKLIYAT" icin gereken benzersiz harfler + bosluk.
# I harfi KACIS DIZISIYLE yaziliyor (yukaridaki nota bakiniz).
HARFLER = 'EGKNTALİY '

font = instantiateVariableFont(
    TTFont(KAYNAK), {'wght': AGIRLIK}, inplace=True, updateFontNames=False
)
upem = font['head'].unitsPerEm
cmap = font.getBestCmap()
glyphs = font.getGlyphSet()
hmtx = font['hmtx']

cikti = {
    'kaynak': KAYNAK,
    'agirlik': AGIRLIK,
    'upem': upem,
    'capHeight': font['OS/2'].sCapHeight,
    'glifler': {},
}

eksik = []
for ch in HARFLER:
    kod = ord(ch)
    if kod not in cmap:
        eksik.append('U+%04X' % kod)
        continue
    ad = cmap[kod]
    kalem = SVGPathPen(glyphs)
    glyphs[ad].draw(kalem)
    sinir = BoundsPen(glyphs)
    glyphs[ad].draw(sinir)
    cikti['glifler'][ch] = {
        'd': kalem.getCommands(),
        'ilerleme': hmtx[ad][0],
        'sinir': sinir.bounds,
    }

if eksik:
    raise SystemExit('EKSIK GLIF: ' + ', '.join(eksik))

os.makedirs(os.path.dirname(HEDEF), exist_ok=True)
with open(HEDEF, 'w', encoding='ascii') as f:
    json.dump(cikti, f, ensure_ascii=True)

print('yazildi: %s' % HEDEF)
print('  upem %d  capHeight %d  agirlik %d' % (upem, cikti['capHeight'], AGIRLIK))
for ch, g in cikti['glifler'].items():
    print('  U+%04X  ilerleme %4d  ust %s' % (ord(ch), g['ilerleme'], g['sinir'][3] if g['sinir'] else '-'))
