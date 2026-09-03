// test/hata-yuzeyi.test.ts
//
// 404 / HATA YÜZEYİ — TASARIM VE METİN SÖZLEŞMESİ.
//
// ─────────────────────────────────────────────────────────────────────────
// NEDEN BU DOSYA VAR
//
// `app/error.vue` uzun süre sitenin son Tailwind adasıydı ve kimse fark
// etmedi: hata sayfası günlük gezinmede görünmüyor. Yarışma sürümünde
// coğrafi ağ kapatılınca (bkz. test/bolge-gorunurlugu.test.ts) 513 adres
// buraya iniyor — yani yüzey artık birinci sınıf ve sessizce eskimemeli.
//
// İKİ ŞEY KORUNUYOR
//   1. DİL. Kart/gölge/yarıçap/eski palet geri gelmesin; renk ve tipografi
//      token'lardan okunsun.
//   2. METİN DOĞRULUĞU. Coğrafi sayfalar SİLİNMEDİ, TAŞINMADI. Eski cümle
//      ("kaldırılmış veya taşınmış olabilir") bunu yanlış anlatıyordu.
//      Sayfa aynı zamanda kapatmanın SEBEBİNİ de anlatmamalı.
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const kok = process.cwd()
const kaynak = readFileSync(join(kok, 'app', 'error.vue'), 'utf8')
/** Yorumları atar: iddialar KOD için, gerekçe metni için değil. */
const kodu = (k: string) =>
  k.replace(/<!--[\s\S]*?-->/g, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/^\s*\/\/.*$/gm, ' ')
const k = kodu(kaynak)

/** `<style>` bloğu — biçim iddiaları yalnız burayı ilgilendiriyor. */
const stil = (k.match(/<style[^>]*>([\s\S]*?)<\/style>/) || ['', ''])[1]
/** `<template>` bloğu — metin ve yapı iddiaları burada. */
const sablon = (k.match(/<template>([\s\S]*?)<\/template>/) || ['', ''])[1]

// ═══════════════════════════════════════════ TASARIM DİLİ

describe('yeni tasarım dili', () => {
  it('eski Tailwind kart dili kalmadı', () => {
    // Kaldırılanların hepsi tek ekrandaydı: yuvarlak kutu, iki kademe
    // gölge, eski yeşil zemin ve hover'da büyüyen ikon.
    for (const iz of [
      'rounded-',
      'shadow-',
      'bg-primary',
      'text-dark',
      'bg-background',
      'hover:scale-',
      'transform',
    ]) {
      expect(k).not.toContain(iz)
    }
  })

  it('kart / gölge / yarıçap / cam yok', () => {
    expect(stil).not.toMatch(/box-shadow/)
    expect(stil).not.toMatch(/border-radius/)
    expect(stil).not.toMatch(/backdrop-filter/)
  })

  it('renkler token üzerinden — sabit hex yok', () => {
    expect(stil).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(stil).toContain('rgb(var(--c-paper))')
    expect(stil).toContain('rgb(var(--c-ink))')
  })

  it('tipografi kütükten okunuyor — kendi punto ölçeğini icat etmiyor', () => {
    // Archivo başlıkta (`tip-baslik`), mono yalnız gerçek metadata'da
    // (`op-kunye` + kayıt fişi). İkisi de `--f-*` token'ından.
    expect(sablon).toContain('tip-baslik')
    expect(sablon).toContain('op-kunye')
    expect(stil).toContain('var(--f-mono)')
    expect(stil).not.toMatch(/font-family:(?![ \t]*var\()/)
  })

  it('eylem ağırlıkları kütükten — ikinci kez tanımlanmıyor', () => {
    expect(sablon).toContain('op-eylem')
    expect(sablon).toContain('op-bag--sakin')
  })

  it('JS animasyonu ve GSAP yok', () => {
    expect(k).not.toMatch(/gsap|ScrollTrigger|requestAnimationFrame/i)
  })
})

// ═══════════════════════════════════════════ METİN

describe('metin doğru ve nötr', () => {
  it('"kaldırılmış veya taşınmış" iddiası kalmadı', () => {
    // Coğrafi sayfalar duruyor; yalnız public görünürlük kapalı.
    expect(k).not.toMatch(/kaldırılmış/i)
    expect(k).not.toMatch(/taşınmış/i)
  })

  it('kapatmanın sebebini ziyaretçiye anlatmıyor', () => {
    // "Yarışma", "geçici", "sonra açılacak" — hiçbiri ekrana yazılmıyor.
    // Yorumlar hariç tutuluyor: gerekçe kodda YAZILI OLMALI.
    for (const sizinti of [/yarışma/i, /geçici/i, /sonra açıl/i, /gizlen/i]) {
      expect(sablon).not.toMatch(sizinti)
    }
  })

  it('404 ve diğer hatalar ayrı konuşuyor', () => {
    // Tek metin ikisine birden yazılırsa 500 hatasında "bu adres açık
    // değil" denir ve kullanıcı olmayan bir sayfayı arar.
    expect(k).toMatch(/is404/)
    expect(k).toContain('Bu adres şu anda açık değil.')
  })
})

// ═══════════════════════════════════════════ YAPI

describe('yüzeyin yapısı', () => {
  it('semantik main ve tek h1', () => {
    expect((sablon.match(/<main\b/g) || []).length).toBe(1)
    expect((sablon.match(/<h1\b/g) || []).length).toBe(1)
  })

  it('iki çıkış var, üçüncü iletişim düğmesi yok', () => {
    const hedefler = [...sablon.matchAll(/href="(\/[a-z-]*)"/g)].map((m) => m[1])
    expect(hedefler).toEqual(['/', '/hizmetlerimiz'])
  })

  it('hata durumu temizlenerek gidiliyor', () => {
    // `NuxtLink` hata durumunu düşürmüyor; `clearError` düşürüyor. Yine de
    // gerçek `href` yazılı — bağlantı klavyeyle odaklanabiliyor.
    expect(k).toContain('clearError')
    expect(sablon).not.toContain('<NuxtLink')
  })

  it('noindex var; canonical ve yapısal veri YOK', () => {
    expect(k).toContain('noindex, nofollow')
    expect(k).not.toMatch(/rel:\s*['"]canonical/)
    expect(k).not.toMatch(/application\/ld\+json/)
  })

  it('ortak kapanış imzası bu yüzeyde yok', () => {
    // Kapanış bir SAYFA sonu imzası; hata yüzeyinin sonu değil.
    // (Aynı kural test/kapanis-imzasi.test.ts içinde de var.)
    expect(k).not.toContain('base-kapanis')
  })
})
