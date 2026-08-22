#!/bin/sh
# =============================================================================
# GÜNLÜK VERİTABANI YEDEĞİ — cPanel cron sarmalayıcısı
# -----------------------------------------------------------------------------
# cPanel > Cron Jobs'a yapıştırılacak TEK satır:
#
#     0 3 * * * /home/KULLANICI/nakliye/scripts/yedek-cron.sh
#
# NEDEN AYRI BİR SARMALAYICI VAR
# cPanel'de Node uygulamaları kendi sanal ortamlarında çalışır
# (~/nodevenv/UYGULAMA/SURUM/bin/node). Cron ise oturum açmamış, PATH'i
# neredeyse boş bir kabukta çalışır — orada düz `node` yazmak "command not
# found" verir ve yedek sessizce hiç alınmaz. Bu, cPanel'de Node cron'larının
# başarısız olmasının bir numaralı sebebidir.
#
# Bu betik node'u kendisi bulur; kurulumdan kuruluma değişen yolu senin
# bilmene gerek kalmaz.
#
# PAROLA NEREDE
# DATABASE_URL cron satırına YAZILMAZ. Yazılsaydı hem crontab dosyasında hem
# `ps` çıktısında açıkta dururdu. Bunun yerine ayrı ve yalnızca sahibinin
# okuyabildiği bir dosyadan alınır (bkz. ENV_DOSYASI).
# =============================================================================

set -eu

# --- Ayarlanabilir yollar ---------------------------------------------------
# Betik uygulama kökündeki scripts/ içinde durduğu için kök kendiliğinden
# bulunuyor; taşınırsa UYGULAMA_KOKU ortam değişkeniyle ezilebilir.
UYGULAMA_KOKU="${UYGULAMA_KOKU:-$(cd "$(dirname "$0")/.." && pwd)}"

# Yedekler UYGULAMA KÖKÜNÜN DIŞINDA tutuluyor. İçeride olsaydı müşteri
# taleplerini (ContactLead) içeren dump'lar web'den indirilebilir hâle
# gelebilirdi.
YEDEK_KLASORU="${YEDEK_KLASORU:-$HOME/yedekler}"
ENV_DOSYASI="${ENV_DOSYASI:-$HOME/.env.yedek}"
GUNLUK="${GUNLUK:-$HOME/yedek.log}"

# Günlüğün klasörü yoksa betik daha ilk yazmada ölürdü — hem de hatayı
# yazacak yer olmadığı için sessizce.
mkdir -p "$(dirname "$GUNLUK")" "$YEDEK_KLASORU"

# --- node'u bul -------------------------------------------------------------
bul_node() {
  # 1) Zaten PATH'te mi
  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi
  # 2) cPanel sanal ortamları — en yüksek sürüm numarası tercih edilir
  for aday in $(ls -d "$HOME"/nodevenv/*/*/bin/node 2>/dev/null | sort -V -r); do
    [ -x "$aday" ] && { echo "$aday"; return 0; }
  done
  # 3) Sistem geneli kurulumlar
  for aday in /usr/local/bin/node /usr/bin/node /opt/alt/alt-nodejs*/root/usr/bin/node; do
    [ -x "$aday" ] && { echo "$aday"; return 0; }
  done
  return 1
}

# --- Hata bildirimi ---------------------------------------------------------
# KRİTİK: cron (ve cPanel) e-postayı ÇIKIŞ KODUNA göre değil, ÇIKTIYA göre
# gönderir. Her şeyi günlüğe yönlendirseydik başarısızlık da sessiz kalırdı —
# yani yedeğin çalışmadığını ancak ona ihtiyaç duyduğun gün öğrenirdin.
#
# Bu yüzden ayrım şöyle:
#   BAŞARI      → yalnızca günlüğe yaz, ekrana hiçbir şey basma → e-posta YOK
#   BAŞARISIZLIK→ günlüğe VE stderr'e yaz                        → e-posta VAR
#
# Başarıda da e-posta atsaydık her gün bir bildirim gelir, birkaç hafta sonra
# okunmadan silinmeye başlar ve gerçek hata da o yığının içinde kaybolurdu.
hata() {
  echo "$(date '+%F %T')  HATA: $1" >> "$GUNLUK"
  echo "YEDEKLEME BAŞARISIZ ($(date '+%F %T')): $1" >&2
  echo "Ayrıntı: $GUNLUK" >&2
}

NODE="$(bul_node)" || {
  hata "node bulunamadı. Cron satırında NODE=/tam/yol/node verin."
  exit 1
}

# --- Parola dosyası ---------------------------------------------------------
if [ ! -r "$ENV_DOSYASI" ]; then
  hata "$ENV_DOSYASI okunamıyor. İçinde DATABASE_URL olmalı, izni 600 olmalı."
  exit 1
fi

# --- Yedeği al --------------------------------------------------------------
cd "$UYGULAMA_KOKU"

# `set -e` burada BİLEREK kapatılıyor: yedekleme başarısız olursa betiğin o
# satırda ölmesini değil, hatayı günlüğe yazıp bildirim üretmesini istiyoruz.
set +e
{
  echo "----- $(date '+%F %T') -----"
  "$NODE" --env-file="$ENV_DOSYASI" scripts/yedekle.mjs "$YEDEK_KLASORU" 2>&1
} >> "$GUNLUK" 2>&1
KOD=$?
set -e

echo "çıkış kodu: $KOD" >> "$GUNLUK"

if [ "$KOD" -ne 0 ]; then
  # Sebebi e-postaya da koy — günlüğe bakmadan ne olduğu anlaşılsın.
  hata "yedekle.mjs $KOD koduyla çıktı"
  tail -n 15 "$GUNLUK" >&2
fi

# --- Günlüğü sınırla --------------------------------------------------------
# Yıllarca büyümesin: son 500 satır yeter.
if [ -f "$GUNLUK" ]; then
  tail -n 500 "$GUNLUK" > "$GUNLUK.tmp" && mv "$GUNLUK.tmp" "$GUNLUK"
fi

# Sıfırdan farklı çıkış cPanel'in cron e-postasını tetikler — sessiz
# başarısızlık olmasın diye.
exit "$KOD"
