// scripts/mysql-araclari.mjs
//
// MySQL KOMUT SATIRI ARAÇLARININ ORTAK BULUCUSU.
//
// `yedekle.mjs` yıllardır kendi aday listesini taşıyordu. Sürüm yedeği ve
// geri yükleme betikleri de aynı listeye ihtiyaç duyunca üç kopya olacaktı;
// biri güncellenip diğerleri unutulduğunda hata "mysqldump bulunamadı"
// diye görünür ama sebebi görünmez. Tek yerde.
//
// PAROLA KOMUT SATIRINA YAZILMIYOR. `mysqldump -pPAROLA` biçimi hem
// `ps` çıktısında hem kabuk geçmişinde parolayı açığa çıkarır. Onun yerine
// `MYSQL_PWD` ortam değişkeni kullanılıyor — süreç ortamı, süreç listesi
// değil.
import { spawnSync } from 'node:child_process'

const WINDOWS_KOKLERI = [
  'C:/Program Files/MySQL/MySQL Server 8.0/bin',
  'C:/Program Files/MySQL/MySQL Server 8.4/bin',
  'C:/Program Files/MariaDB 11.4/bin',
  'C:/xampp/mysql/bin',
]

/**
 * `mysqldump` ya da `mysql` çalıştırılabilirini bulur.
 *
 * @param arac 'mysqldump' | 'mysql'
 * @param ortamDegiskeni Elle yol vermek için ortam değişkeninin adı
 */
export function araciBul(arac, ortamDegiskeni) {
  const adaylar = [
    process.env[ortamDegiskeni],
    arac,
    ...WINDOWS_KOKLERI.map((k) => `${k}/${arac}.exe`),
    `/usr/bin/${arac}`,
    `/usr/local/bin/${arac}`,
  ].filter(Boolean)

  for (const aday of adaylar) {
    const deneme = spawnSync(aday, ['--version'], { encoding: 'utf8' })
    if (!deneme.error && deneme.status === 0) return aday
  }
  return null
}

/** `DATABASE_URL`i mysql araçlarının istediği parçalara ayırır. */
export function baglantiyiCoz(url) {
  if (!url) throw new Error('DATABASE_URL tanımlı değil.')
  let u
  try {
    u = new URL(url)
  } catch {
    throw new Error('DATABASE_URL çözümlenemedi.')
  }
  return {
    veritabani: u.pathname.replace(/^\//, ''),
    kullanici: decodeURIComponent(u.username),
    parola: decodeURIComponent(u.password),
    sunucu: u.hostname,
    port: u.port || '3306',
  }
}

/** Ortak bağlantı bayrakları — parola HARİÇ (o `MYSQL_PWD` ile gidiyor). */
export const baglantiBayraklari = (b) => [
  `--host=${b.sunucu}`,
  `--port=${b.port}`,
  `--user=${b.kullanici}`,
  '--default-character-set=utf8mb4',
]

/** Parolayı ortama koyar; komut satırına ASLA yazmaz. */
export const parolaliOrtam = (b) => ({ ...process.env, MYSQL_PWD: b.parola })
