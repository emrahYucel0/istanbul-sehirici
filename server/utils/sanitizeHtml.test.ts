// HTML temizliğinin sözleşmesi.
//
// NEDEN VAR
// Temizlik istemciden SUNUCUYA taşındı (sebep: `sanitize-html` +
// `htmlparser2` her ziyaretçiye 234 KB olarak iniyordu). Taşıma sırasında
// bir dönüş noktası atlanırsa depolanmış XSS açığı oluşur ve bu sessizce
// olur — tarayıcıda artık ikinci bir savunma katmanı yok.
//
// Bu testler o katmanın yerinde olduğunu doğruluyor.
import { describe, it, expect } from 'vitest'
import { sanitizeHtml, sanitizeContentFields } from './sanitizeHtml'
import { satirSonlariniAyir, vurguyuBoya } from '../../app/utils/vurgulu-baslik'

describe('sanitizeHtml', () => {
  it('script etiketini atmalı', () => {
    expect(sanitizeHtml('<p>merhaba</p><script>alert(1)</script>')).toBe('<p>merhaba</p>')
  })

  it('olay niteliklerini atmalı', () => {
    expect(sanitizeHtml('<p onclick="alert(1)">x</p>')).toBe('<p>x</p>')
  })

  it('javascript: adresini atmalı', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">x</a>')).not.toContain('javascript:')
  })

  it('iframe atmalı', () => {
    expect(sanitizeHtml('<iframe src="https://kotu.example"></iframe>')).toBe('')
  })

  it('meşru zengin metni KORUMALI', () => {
    const girdi = '<h2>Başlık</h2><p><strong>kalın</strong> ve <a href="/kadikoy">bağlantı</a></p>'
    expect(sanitizeHtml(girdi)).toBe(girdi)
  })
})

describe('sanitizeContentFields', () => {
  it('tekil kaydın content alanını temizlemeli', () => {
    const c = sanitizeContentFields({ id: 1, content: '<p>a</p><script>x()</script>' })
    expect(c.content).toBe('<p>a</p>')
  })

  it('diziyi temizlemeli', () => {
    const c = sanitizeContentFields([{ content: '<script>x()</script><p>b</p>' }])
    expect(c[0].content).toBe('<p>b</p>')
  })

  it('sayfalı liste zarfına inmeli', () => {
    const c = sanitizeContentFields({ total: 1, items: [{ content: '<script>x()</script>' }] })
    expect(c.items[0].content).toBe('')
  })

  it('İÇ İÇE çocuk listelere inmeli (hizmet bölümü şekli)', () => {
    const c = sanitizeContentFields({
      sectionName: 'services',
      services: [{ title: 'x', content: '<p>ok</p><script>x()</script>' }],
    })
    expect(c.services[0].content).toBe('<p>ok</p>')
  })

  it('content dışındaki alanlara dokunmamalı', () => {
    const c = sanitizeContentFields({ title: '<b>bozulmasın</b>', content: '<p>a</p>' })
    expect(c.title).toBe('<b>bozulmasın</b>')
  })
})

// İstemci tarafında kalan tek HTML üretimi. Ayrıştırıcı YOK; metin kaçırılıp
// üstüne yalnızca bizim etiketimiz konuyor.
describe('başlık vurgusu (istemci, kütüphanesiz)', () => {
  it('satır sonunu br yapmalı', () => {
    expect(satirSonlariniAyir('a\nb')).toBe('a<br class="block lg:hidden" />b')
  })

  it('satır sonu yoksa boş dönmeli', () => {
    expect(satirSonlariniAyir('tek satır')).toBe('')
  })

  it('başlıktaki script METİN olarak kalmalı, etiket olmamalı', () => {
    const c = satirSonlariniAyir('<script>alert(1)</script>\nikinci')
    expect(c).not.toContain('<script>')
    expect(c).toContain('&lt;script&gt;')
  })

  it('**kalın** vurgusunu boyamalı', () => {
    expect(vurguyuBoya('bizim **farkımız**')).toBe(
      'bizim <span class="text-brand-600">farkımız</span>'
    )
  })

  it('span işaretlemesini boyamalı ama gerçek etiket geçirmemeli', () => {
    const c = vurguyuBoya('bizim <span>farkımız</span>')
    expect(c).toBe('bizim <span class="text-brand-600">farkımız</span>')
  })

  it('vurgu içindeki tehlikeli metni kaçırmalı', () => {
    const c = vurguyuBoya('**<img src=x onerror=alert(1)>**')
    // `onerror` metni çıktıda GEÇEBİLİR ve bu zararsızdır; önemli olan
    // `<` karakterinin kaçırılmış olması — tarayıcı bir etiket görmediği
    // sürece `onerror` bir nitelik hâline gelemez, düz metin kalır.
    expect(c).toContain('&lt;img src=x onerror=alert(1)&gt;')
    // Bizim eklediğimiz span dışında AÇILMIŞ hiçbir etiket olmamalı.
    expect(c.replaceAll('<span class="text-brand-600">', '').replaceAll('</span>', ''))
      .not.toMatch(/[<>]/)
  })
})
