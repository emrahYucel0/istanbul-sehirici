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
npm run test          # 1030 test
npm run build
npm run sir-tara      # derlemede sır var mı
npm run dagitim-paketi
npm run surum-yedegi  # ← TAZE veritabanı + görsel paketi (bkz. adım 1)
```

Sıra önemli: `surum-yedegi` **en sonda** çalışır, çünkü üretime gidecek
döküm kesme anındaki veriyi taşımalı. Klasörde duran eski bir döküm
kullanılmaz.

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
| `yedekler/surum-<damga>/veritabani.sql` | phpMyAdmin → Import | kesme anında alınmış TAZE döküm |
| `yedekler/surum-<damga>/yuklemeler.tar.gz` | `/home/<CPANEL_USER>/nakliye/` içinde açılır | `yuklemeler/` klasörünü üretir |

**Yüklenmeyecekler:** `.env`, `.env.example`, `node_modules/`, `prisma/`,
`app/`, `server/`, `yedekler/`, `.nuxt/`, `gorsel-kaynak/`.

> `prisma/` yüklenmediği için üretimde `prisma migrate deploy`
> **çalıştırılamaz.** Şema değişikliği döküm yoluyla taşınıyor — gerekçesi
> ve tam yordamı adım 1'de.

> `.env` özellikle yüklenmemeli. İçindeki aktif `DATABASE_URL` **local**
> adresi (`root@localhost`). Sunucuya giderse uygulama yanlış veritabanına
> bağlanmayı deneyip hata verir ve sebebini bulmak zaman alır. Ortam
> değişkenleri adım 3'te panelden girilecek.

---

## 1) Veritabanı ve yüklenen görseller

> **BU ADIM DEĞİŞTİ.** Önceki sürüm "`yedekler/` klasöründeki **en güncel**
> `.sql` dosyasını yükle" diyordu. O yönerge yanlış sonuç veriyordu:
> klasördeki en güncel döküm M1 öncesine ait olabiliyor ve içinde
> `Neighborhood`, `HomeSection`, `InternalPageSection` tabloları hiç
> bulunmuyordu. Böyle bir dökümle açılan sunucu, kodun beklediği tabloları
> bulamaz.
>
> Artık kural şu: **döküm kesme anında alınır.** Klasörde duran eski bir
> dosya kullanılmaz.

### 1.1 Kanonik yol — neden dump/import, neden `prisma migrate deploy` DEĞİL

Şema değişikliği üretime **göç çalıştırarak taşınmıyor**, taşınamıyor:

* Üretim sunucusuna `prisma/` klasörü ve `node_modules` **yüklenmiyor**
  (bkz. adım 0b). Prisma CLI orada yok.
* `.output` içindeki gömülü Prisma istemcisi yalnız sorgu çalıştırır;
  `migrate deploy` komutu paketin parçası değil.
* Sunucuda `npm install` yapılmıyor — dağıtımın hızlı ve öngörülebilir
  kalmasının sebebi de bu.

Bu bir eksiklik değil, **bilinçli bir dağıtım modeli**. Ama "üretimde
`prisma migrate deploy` çalıştırın" diye belgelenmesi yanlış olurdu; o
komut orada çalışmaz.

Göçler **yerelde** uygulanır (`npx prisma migrate deploy`), sonuç şema +
veri olarak dökülür ve üretime **döküm** gider:

```
YEREL                                     ÜRETİM
─────                                     ──────
göç uygulanır (prisma migrate deploy)
tohum/geri doldurma çalıştırılır
        │
        ▼
npm run surum-yedegi ──────────────────►  phpMyAdmin Import
  veritabani.sql                          + yuklemeler/ klasörüne aç
  yuklemeler.tar.gz
  surum.json (künye)
```

**Sonuç:** sıfırdan kurulum ile mevcut veritabanını yükseltme AYNI yoldan
gider — ikisi de tam bir döküm içe aktarır. "Boş veritabanına kurup
tohumla" senaryosu **desteklenmiyor**: tohum betikleri Node, Prisma
istemcisi ve `shared/` modüllerini gerektiriyor, üçü de üretim paketinde
yok.

### 1.2 Sürüm yedeği — veritabanı ve görseller AYRI ama BİRLİKTE

```bash
npm run surum-yedegi
```

`yedekler/surum-<damga>/` klasörü üretir:

| Dosya | İçerik |
|---|---|
| `veritabani.sql` | `mysqldump --single-transaction`; tablo adları şemadaki yazıma çevrilmiş (Linux'ta büyük/küçük harf duyarlı) |
| `yuklemeler.tar.gz` | `yuklemeler/` klasörünün tamamı |
| `surum.json` | künye: tarih · git commit · tablo sayımları · her iki dosyanın sha256'sı |

İkisi neden tek pakette: `Region.image` sütunu `/yuklemeler/…` diyor, dosya
diskte. Yalnız veritabanını geri yüklerseniz sayfalar kırık görsele işaret
eder; yalnız dosyaları geri yüklerseniz onları kimse göstermez. Künye
ikisini birbirine bağlıyor — hangi dökümün hangi arşivle eşleştiği tahmin
edilmiyor.

`npm run yedekle` (günlük cron) **kalkmadı** ve yerini almıyor: o yalnız
veritabanını döküyor ve müşteri talepleri için doğru araç. Sürüm yedeği
yayın/geri dönüş içindir.

### 1.3 Üretime kurulum

1. cPanel → MySQL Databases → veritabanı ve kullanıcı oluştur, kullanıcıyı
   veritabanına **ALL PRIVILEGES** ile ekle.
2. phpMyAdmin → Import → paketteki **`veritabani.sql`**.
   (Büyük dosyada zaman aşımı olursa: SSH varsa
   `mysql -u KULLANICI -p VERITABANI < veritabani.sql`.)
3. `yuklemeler.tar.gz` dosyasını `/home/<CPANEL_USER>/nakliye/` altına yükleyip
   aç:
   ```bash
   tar -xzf yuklemeler.tar.gz     # içinden `yuklemeler/` klasörü çıkar
   ```

**Doğrulama — künyedeki sayılarla karşılaştırın.** `surum.json` içindeki
`sayimlar` bloğu ne yazıyorsa phpMyAdmin'de o görünmeli. Bugünkü değerler:

```
Region  40   Neighborhood 473   Service 7    Post 10
HomeSection 7 / Item 15         InternalPageSection 21 / Item 21
FaqItem 15   ProcessStep 5      Meta 2       PolicyPage 3
SiteSettings 1                  StoredFile 269   Testimonial 3   User 2
yuklemeler/ → 265 dosya
```

### 1.4 Geri yüklemenin çalıştığı nasıl doğrulanır

Yerelde, **ayrı bir test veritabanına**:

```bash
# kuru çalıştırma — hiçbir şey yazmaz
npm run surum-geri-yukle -- --paket=yedekler/surum-<damga> --veritabani=nakliyeDB_test

# uygula
npm run surum-geri-yukle -- --paket=yedekler/surum-<damga>   --veritabani=nakliyeDB_test --yuklemeler=C:/temp/yuklemeler-test --uygula
```

Betik sha256'ları doğruluyor, şemayı sıfırdan kuruyor, dökümü içe
aktarıyor ve sayımları künyeyle karşılaştırıyor. Sapma varsa sıfırdan
farklı çıkış kodu döner.

Üç çit var: hedef veritabanı **açıkça verilmek zorunda** (varsayılan yok),
`DATABASE_URL`deki veritabanının üzerine yazmak ayrı bir `--ustune-yaz`
onayı ister, ve `--uygula` olmadan hiçbir şey yazılmaz.

Test veritabanını sonra düşürmeyi unutmayın:
`DROP DATABASE nakliyeDB_test;`

---

## 2) Node uygulaması

cPanel → **Setup Node.js App** → Create Application

| Alan | Değer |
|---|---|
| Node.js version | 20 veya üzeri |
| Application mode | Production |
| Application root | `nakliye`  (yani `/home/<CPANEL_USER>/nakliye` — public_html DIŞINDA) |
| Application URL | istanbulsehirici.com |
| Application startup file | `.output/server/index.mjs` |

Startup file alanı alt klasör yolunu kabul etmezse: `deploy/app.mjs`
dosyasını uygulama kökine kopyalayıp startup file olarak `app.mjs` verin.

---

## 3) Ortam değişkenleri

Girilecek değişkenlerin tam listesi ve her birinin ne işe yaradığı
depodaki **`.env.example`** dosyasında. Aşağıdaki blok onun üretim
alt kümesi:

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
https://istanbulsehirici.com/robots.txt
   → "Disallow:" satırının KARŞISI BOŞ olmalı.
     "Disallow: /" görürseniz site indekslenmez — durun ve haber verin.

https://istanbulsehirici.com/sitemap.xml
   → <loc> satırları görünmeli.

https://istanbulsehirici.com/
   → 200 ve içerik dolu.
```

4. Tam duman testini canlıya karşı çalıştırın:

```bash
node scripts/duman-testi.mjs https://istanbulsehirici.com
```

30'dan fazla kontrol yapar; sayfaların yalnızca 200 dönmesine değil,
veriden gelmesi gereken metnin gerçekten basıldığına bakar. Örnek bölgeyi
canlıdaki aktif kayıtlardan kendisi seçer.

5. Search Console'a sitemap'i gönderin.

---

## 7b) Geri alma (rollback)

Yayın kötü giderse geri dönüş **iki ayrı parçadan** oluşuyor ve ikisi
farklı davranıyor. Karıştırmak veri kaybettirir.

### Kod

`.output` bir önceki sürümle değiştirilir ve uygulama yeniden başlatılır.
Yeni sürümü atmadan önce eskisini `.output-onceki` diye saklayın —
yeniden derlemek dakikalar sürer, klasörü geri koymak saniyeler.

```bash
mv .output .output-bozuk && mv .output-onceki .output
# cPanel → Setup Node.js App → Restart
```

### Veritabanı

**Göçler yalnız EKLEME yapıyor** (M1–M7'nin yedisinde de `DROP` sayısı
sıfır; ölçüldü). Somut sonucu: **eski kod yeni şemayla çalışır.** Yeni
sütunları görmez, yok sayar. Yani çoğu geri alma senaryosunda
**veritabanına dokunmanız gerekmez** — yalnız kodu geri alın.

Veritabanını gerçekten geri almanız gereken tek durum, verinin kendisinin
bozulmasıdır (yanlış tohum, hatalı toplu güncelleme, yanlış silme). O zaman:

```bash
npm run surum-geri-yukle -- --paket=<sürüm-paketi>   --veritabani=<üretim-veritabanı> --ustune-yaz --uygula
```

> `--ustune-yaz` bilerek zorunlu. Hedef `DATABASE_URL`deki veritabanıysa
> betik onsuz çalışmayı reddeder.

**Yıkıcı geri alma SQL'i üretilmiyor ve önerilmiyor.** "Son göçü geri al"
diye bir komut yok; geri dönüş yolu dökümdür.

### Yüklenen görseller

`yuklemeler/` klasörü `.output` dışında olduğu için yeni sürüm atarken
**silinmiyor** — normal bir kod geri almasında ona dokunulmaz.

Görsel kaybı yaşandıysa (yanlışlıkla silinen dosyalar) sürüm paketindeki
arşiv açılır:

```bash
tar -xzf yuklemeler.tar.gz -C /home/<CPANEL_USER>/nakliye/
```

### Sıra

```
1. Kodu geri al               → çoğu durumda tek gereken bu
2. Site açılıyor mu kontrol   → node scripts/duman-testi.mjs https://…
3. Veri bozuksa               → sürüm paketinden veritabanını geri yükle
4. Görsel eksikse             → aynı paketten arşivi aç
```

Veritabanı ve görseller **aynı paketten** gelmeli. Farklı zamanlara ait bir
döküm ile arşivi eşleştirmek, kayıtların var olmayan dosyalara işaret
etmesi demektir — `surum.json` künyesi tam bunun için var.

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

**Bölge açma:** 40 bölge kaydı var — 39 İstanbul ilçesi (hepsi yayında) ve
adresi `/`'a yönlendirilen özel `istanbul` kaydı. İstanbul dışı 335 eski
kayıt kapsam kararıyla silindi (bkz. `prisma/legacy-bolge-temizligi.mjs`).
Yayına alınacak yeni sayfa mahalle tarafında: 473 mahallenin 10'u açık. Aktif ettiğiniz sayfa anında yayına girer; sitemap'e
girmesi **10 dakika** sürer (sitemap önbelleği `cacheMaxAgeSeconds: 600`).
Bu bir hata değildir.
