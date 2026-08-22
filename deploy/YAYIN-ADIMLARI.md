# Yayına Alma Adımları — cPanel

Bu dosya, `npm run build` çalıştırıldıktan sonra izlenecek adımları içerir.
Her adımın sonunda **nasıl doğrulanacağı** yazıyor; doğrulamayı atlamayın.

---

## Klasör yapısı — uygulama kökü `public_html` DIŞINDA

```
/home/<CPANEL_USER>/
├── nakliye/              ← Application root (belge kökünün DIŞINDA)
│   ├── .output/          ← derleme çıktısı, her sürümde değişen tek şey
│   ├── scripts/
│   │   ├── yedekle.mjs
│   │   └── db-baglanti-testi.mjs
│   └── yuklemeler/       ← panelden yüklenen görseller (dağıtımda KORUNUR)
├── yedekler/             ← veritabanı yedekleri (cron yazar)
└── public_html/
    └── .htaccess         ← Passenger bloğu + bu paketteki kurallar
```

**Daha önce `public_html/app` kullanıyorduysanız artık gerekmiyor.** Sebebi:
statik dosyaları Apache'nin sunması gerektiği için uygulamayı belge köküne
koymak eski yöntemdi. Ölçtük — Nitro'nun node-server çıktısı `_nuxt`
altındaki varlıkları **kendisi** sıkıştırılmış olarak sunuyor
(`Content-Encoding: br`, 644 bayt / 1652 bayt) ve `max-age=31536000,
immutable` önbellek başlığını da kendisi veriyor. Yani `public_html`'e
kopyalanacak statik dosya yok; `public_html` içinde yalnızca `.htaccess`
kalıyor.

Uygulama kökünü belge kökünün dışına almanın iki faydası var:

1. **Sunucu kodu indirilebilir olmuyor.** `.output/server/` altındaki
   paketlenmiş kod belge kökünde dursaydı, sunucu yapılandırmasına bağlı
   olarak doğrudan indirilebilir hâle gelebilirdi. (Derlemede gizli bilgi
   yok — ölçüldü — ama arka uç mantığını, yönetim yolunu ve hız sınırı
   eşiklerini dışarı vermenin anlamı yok.)
2. **Dağıtım sadeleşiyor.** Yeni sürümde yalnızca `nakliye/.output`
   değişiyor; `public_html` ve `yuklemeler` hiç ellenmiyor.

> cPanel bazı kurulumlarda uygulama kökünü `public_html` içinde olmaya
> zorlar. Zorlarsa: uygulama klasörünün içine `Require all denied` içeren
> bir `.htaccess` koyup dışarıdan erişimi kapatın.

---

## 0) Dağıtım paketini üret  ← BU ADIMI ATLAMAYIN

```bash
npm run build
npm run dagitim-paketi
```

`.output` klasörünü **doğrudan yüklemeyin.** Nitro, `.output/server/node_modules`
içinde pnpm benzeri bir depo kuruyor: aynı paketin farklı sürümleri `.nitro/`
altında bir kez duruyor, kullanan paketlere SEMBOLİK BAĞLANTI konuyor. Bu
bağlantılar MUTLAK yol taşıyor:

```
.output/server/node_modules/@vue/compiler-core/node_modules/entities
  → C:/.../ege-esya/.output/server/node_modules/.nitro/entities@7.0.1
```

Sunucuda böyle bir yol olmadığı için bağlantı kopuyor ve uygulama şu hatayla
hiç açılmıyor:

```
Error: Cannot find module 'entities/decode'
Require stack: .../@vue/compiler-core/dist/compiler-core.cjs.prod.js
```

`npm run dagitim-paketi` bağlantıları çözerek `dagitim/` klasörünü üretiyor,
sonunda hiç bağlantı kalmadığını doğruluyor ve kalırsa hata verip duruyor.
Boyut değişmiyor (22 MB) — bağlantıların tamamı küçük bir pakete ait.

**Yükleyeceğiniz klasör `dagitim/`, `.output` değil.**

---

## 0b) Paketin içeriği

`.output` klasörünün **tek başına yeterli olduğu ölçülerek doğrulandı**:
proje kökünden bağımsız bir klasöre yalnızca `.output` kopyalanıp
çalıştırıldı; ana sayfa, veritabanı okuyan bölge sayfası, bcrypt ile giriş
ve sitemap sorunsuz çalıştı. Prisma istemcisi, mariadb sürücüsü ve bcrypt
paketin içine gömülü.

**Bunun pratik sonucu:** sunucuda `npm install` YAPILMAYACAK, `node_modules`
ve `prisma/` klasörleri YÜKLENMEYECEK.

| Ne | Nereye | Not |
|---|---|---|
| `dagitim/.output/` | `/home/<CPANEL_USER>/nakliye/.output` | 22 MB · bağlantısız |
| `deploy/.htaccess` | `public_html/.htaccess` | Passenger bloğunun ALTINA eklenecek |
| `yuklemeler/` | `/home/<CPANEL_USER>/nakliye/yuklemeler` | **uygulama kökünün İÇİNDE** — bkz. aşağıdaki not |
| `dagitim/scripts/` | `/home/<CPANEL_USER>/nakliye/scripts/` | yedek cron'u için, pakete dahil |
| `deploy/app.mjs` | `/home/<CPANEL_USER>/nakliye/` | **yalnızca gerekirse** — bkz. adım 2 |

**Yüklenmeyecekler:** `.env`, `node_modules/`, `prisma/`, `app/`, `server/`,
`yedekler/`, `.nuxt/`, `gorsel-kaynak/`.

> `.env` özellikle yüklenmemeli. İçindeki aktif `DATABASE_URL` **local**
> adresi (`root@localhost`). Sunucuya giderse uygulama yanlış veritabanına
> bağlanmayı deneyip hata verir ve sebebini bulmak zaman alır. Ortam
> değişkenleri adım 3'te panelden girilecek.

---

## 1) Veritabanı

1. cPanel → MySQL Databases → veritabanı ve kullanıcı oluştur, kullanıcıyı
   veritabanına **ALL PRIVILEGES** ile ekle.
2. phpMyAdmin → Import → `yedekler/` klasöründeki **en güncel** `.sql`
   dosyasını yükle.

**Doğrulama:** phpMyAdmin'de `Region` tablosunda kayıt sayısı, local'deki
sayıyla aynı olmalı. Local sayıyı öğrenmek için:
`node --env-file=.env scripts/kirik-gorsel-tara.mjs` çalıştırmadan önce
panelden bakabilirsiniz.

---

## 2) Node uygulaması

cPanel → **Setup Node.js App** → Create Application

| Alan | Değer |
|---|---|
| Node.js version | 20 veya üzeri |
| Application mode | Production |
| Application root | `nakliye`  (yani `/home/<CPANEL_USER>/nakliye` — public_html DIŞINDA) |
| Application URL | istanbulevenakliyat.com |
| Application startup file | `.output/server/index.mjs` |

Startup file alanı alt klasör yolunu kabul etmezse: `deploy/app.mjs`
dosyasını uygulama kökine kopyalayıp startup file olarak `app.mjs` verin.

---

## 3) Ortam değişkenleri

Aynı ekranda "Environment variables" bölümüne:

```
DATABASE_URL              mysql://<CPANEL_USER>_KULLANICI:PAROLA@localhost:3306/<CPANEL_USER>_VERITABANI
NUXT_AUTH_SECRET          (.env'deki AUTH_SECRET değeri)
NODE_ENV                  production

MAIL_HOST                 SMTP sunucusu
MAIL_PORT                 587
MAIL_SECURE               false
MAIL_USER                 SMTP hesabı
MAIL_PASSWORD             SMTP parolası
MAIL_FROM                 gönderen adresi
MAIL_TO                   bildirimlerin gideceği adres
```

> **DEĞİŞTİ — mail değişkenleri.** Eskiden yalnız `NUXT_MAIL_SMTP_AUTH_PASS`
> giriliyordu ve diğer alanlar derlemeye gömülü varsayılanlardan geliyordu.
> O varsayılanlar kaldırıldı: gerçek SMTP parolası derleme çıktısının içine
> düz metin olarak yazılıyordu (`.output/server/chunks/_/nitro.mjs`), yani
> çıktıyı paylaşan parolayı da paylaşıyordu. Mail ayarı artık istek anında
> ortamdan okunuyor (`server/mail/config.ts`).
>
> Sonuçları:
> * `NUXT_MAIL_SMTP_*` adları **artık okunmuyor**; yukarıdaki `MAIL_*`
>   adları kullanılmalı (bunlar `.env` ve `npm run hazir-mi` ile aynı adlar).
> * Yedi alanın **tamamı** girilmeli — gömülü varsayılan kalmadı.
> * Eksik alan varsa uygulama çökmez: talep yine veri tabanına yazılır,
>   panelde `mailStatus` "basarisiz" görünür ve hangi değişkenin eksik
>   olduğu yazar.
> * Mail ayarını değiştirmek için **yeniden derleme gerekmez**; ortam
>   değişkenini güncelleyip süreci yeniden başlatmak yeterli.

**Host neden `localhost`:** uygulama veritabanıyla aynı makinede çalışıyor.
`.env`'deki yorum satırında yazan dış adres (`cp66.servername.co`) hem daha
yavaş hem de cPanel → Remote MySQL bölümünden IP izni gerektirir; izin
verilmemişse bağlantı hiç kurulmaz.

`NUXT_SITE_URL` ve `NUXT_SITE_NAME` **gerekmiyor** — derlemedeki
varsayılanlar zaten doğru. Mail alanları için bu artık geçerli DEĞİL
(yukarıdaki nota bakın): yedisi de dışarıdan veriliyor.

**Doğrulama:** `NUXT_AUTH_SECRET` girilmezse panele giriş **500** verip
"AUTH_SECRET tanımlı değil" der. Sessiz bir hata değildir; giriş
deneyerek test edin.

---

## 4) .htaccess

`deploy/.htaccess` içeriğini `public_html/.htaccess` dosyasına, cPanel'in
otomatik yazdığı Passenger bloğunun **altına** ekleyin.

Dosyada hesap adına bağlı hiçbir yol kalmadı; olduğu gibi kopyalanabilir.

### Panelden yüklenen görseller nereye gidiyor

`yuklemeler/` klasörü **uygulama kökünün İÇİNE** konur:
`/home/<CPANEL_USER>/nakliye/yuklemeler`

Sebebi: dosyaları Apache değil, uygulamanın kendi rotası servis ediyor
(`server/routes/yuklemeler/[...ad].get.ts`) ve o rota klasörü
`process.cwd() + /yuklemeler` olarak arıyor.

Bu belgede önceden klasörün `/home/<CPANEL_USER>/yuklemeler` yoluna, yani
uygulama kökünün DIŞINA konması yazıyordu ve `.htaccess`'e bir `Alias`
kuralı eklenmişti. **O yaklaşım hatalıydı:** `Alias` ve `<Directory>`
direktifleri `.htaccess` içinde kullanılamaz (yalnızca sunucu/sanal host
yapılandırmasında geçerlidirler). Sonuç: görseller 404 dönüyordu.

Klasör `.output` dışında olduğu için yeni sürüm atarken silinmiyor.

---

## 5) IP kısıtlaması (test için)

`.htaccess` içindeki **0) YAYIN ÖNCESİ IP KISITLAMASI** bloğunun başındaki
`#` işaretlerini kaldırın ve kendi IP'nizi yazın (https://ifconfig.me).

- Mobil IP'nizi de ikinci satır olarak ekleyin — ev IP'niz değişirse
  kendinizi kilitlemeyin.
- cPanel Dosya Yöneticisi'nden bu dosyayı düzenleyebildiğinizi önceden
  teyit edin.

**Doğrulama:** kendi bağlantınızdan site açılmalı; telefondan mobil veriyle
(o IP listede yoksa) **403** gelmeli.

---

## 6) Search Console — site kapalıyken

Doğrulamayı **DNS TXT kaydı** yöntemiyle yapın. Bu yöntem siteye erişim
gerektirmez, IP kısıtlaması açıkken de çalışır. Böylece siteyi açtığınız an
sitemap'i gönderebilirsiniz.

---

## 7) Aç ve doğrula

1. `.htaccess`'teki IP bloğunu **tekrar yoruma alın**.
2. Cloudflare kullanıyorsanız önbelleği temizleyin (403 önbelleğe alınmış
   olabilir).
3. Şu üç kontrolü **gözünüzle** yapın:

```
https://istanbulevenakliyat.com/robots.txt
   → "Disallow:" satırının KARŞISI BOŞ olmalı.
     "Disallow: /" görürseniz site indekslenmez — durun ve haber verin.

https://istanbulevenakliyat.com/sitemap.xml
   → <loc> satırları görünmeli.

https://istanbulevenakliyat.com/
   → 200 ve içerik dolu.
```

4. Tam duman testini canlıya karşı çalıştırın:

```bash
node scripts/duman-testi.mjs https://istanbulevenakliyat.com
```

30'dan fazla kontrol yapar; sayfaların yalnızca 200 dönmesine değil,
veriden gelmesi gereken metnin gerçekten basıldığına bakar. Örnek bölgeyi
canlıdaki aktif kayıtlardan kendisi seçer.

5. Search Console'a sitemap'i gönderin.

---

## 8) Yayın sonrası

### Yedekleme cron'u

Dört adım. `scripts/yedek-cron.sh` node'u kendisi buluyor, klasörleri kendisi
açıyor ve bildirimi doğru yapıyor. Yerelde hem başarı hem iki hata yolu test
edildi.

**Bildirim mantığı.** cron e-postayı çıkış koduna göre değil, **çıktıya** göre
gönderir. Betik bunu şöyle kullanıyor:

| Durum | Ekrana çıktı | Sonuç |
|---|---|---|
| Yedek alındı | yok | e-posta gelmez |
| Herhangi bir hata | sebep + günlüğün son 15 satırı | **e-posta gelir** |

Başarıda da e-posta atılsaydı her gün bir bildirim gelir, birkaç hafta sonra
okunmadan silinmeye başlar ve gerçek hata o yığının içinde kaybolurdu.

cPanel > Cron Jobs sayfasının en üstündeki **"Cron E-postası"** alanına gerçek
adresinizi yazın — bildirim oraya gider.

**1. Parola dosyasını oluşturun.** cPanel > Dosya Yöneticisi ile ana dizinde
(`/home/<CPANEL_USER>/`, `public_html`in içinde DEĞİL) `.env.yedek` adında bir
dosya açın, tek satır yazın:

```
DATABASE_URL="mysql://KULLANICI:PAROLA@localhost:3306/VERITABANI"
```

Sunucudaki Node uygulamasının kullandığı değerin AYNISI. Host `localhost`
olmalı, dışarıdaki `cp66.servername.co` değil.

Sonra dosyaya sağ tıklayıp **İzinleri Değiştir → 600** yapın (yalnızca sahibi
okusun). Parola cron satırına YAZILMIYOR; yazılsaydı hem crontab'da hem `ps`
çıktısında açıkta dururdu.

**2. Betiği çalıştırılabilir yapın.** Dosya Yöneticisi'nde
`nakliye/scripts/yedek-cron.sh` → sağ tık → İzinleri Değiştir → **755**.

**3. Cron'u ekleyin.** cPanel > **Cron Jobs** > Ortak Ayarlar: *Bir kez
günde*. Komut:

```
/home/<CPANEL_USER>/nakliye/scripts/yedek-cron.sh
```

Saati gece 3'e alın (`0 3 * * *`) — trafik en düşükken.

**4. Beklemeden test edin.** Cron'u geçici olarak "Her dakika" (`* * * * *`)
yapın, bir dakika bekleyin, sonra Dosya Yöneticisi'nde şunlara bakın:

```
/home/<CPANEL_USER>/yedek.log        → "✔ Yedek alındı" satırı
/home/<CPANEL_USER>/yedekler/        → .sql dosyası, ~1,5 MB
```

Görünce cron'u tekrar günlüğe çevirin. Bu adımı atlamayın: yedeklemenin en
sinsi hatası, ihtiyaç duyulan güne kadar hiç çalışmadığının fark edilmemesidir.

**Ayarlanabilirler** (gerekirse cron satırında `DEGISKEN=deger` ile öne
yazılır): `YEDEK_KLASORU`, `ENV_DOSYASI`, `GUNLUK`, `UYGULAMA_KOKU`.

Yedekler 30 gün tutulup eskiler otomatik siliniyor (`SAKLAMA_GUN`,
`scripts/yedekle.mjs`).

**Yedekler uygulama kökünün DIŞINDA** (`/home/<CPANEL_USER>/yedekler`) tutuluyor.
İçeride olsalardı müşteri taleplerini içeren dump'lar web'den indirilebilir
hâle gelebilirdi.

**Ayda bir sunucudan dışarı indirin.** Sunucu çökerse yedek de onunla gider;
sunucudaki yedek yalnızca "yanlışlıkla sildim" senaryosunu kurtarır.

**Yeni sürüm atarken:** yalnızca `.output` değişir. `yuklemeler/` klasörüne
DOKUNMAYIN — panelden yüklenen tüm görseller orada.

**Bekleyen uyarılar** (`npm run hazir-mi` ile görülebilir): logo, Google
Analytics kimliği, konum koordinatı, fiyat aralığı. Hiçbiri yayını
engellemiyor, ilk hafta içinde panelden doldurulabilir.

**Bölge açma:** 375 bölgenin 45'i aktif, 330'u pasif. Panelden il filtresiyle
seçip kademeli açın. Aktif ettiğiniz sayfa anında yayına girer; sitemap'e
girmesi **10 dakika** sürer (sitemap önbelleği `cacheMaxAgeSeconds: 600`).
Bu bir hata değildir.
