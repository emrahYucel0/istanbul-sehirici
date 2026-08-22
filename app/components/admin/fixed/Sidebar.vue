<template>
  <aside class="w-64 bg-white shadow">
    <div class="p-4">
      <ul>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-building-fill-dash text-secondary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M11 12h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1"
              />
              <path
                d="M2 1a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v7.256A4.5 4.5 0 0 0 12.5 8a4.5 4.5 0 0 0-3.59 1.787A.5.5 0 0 0 9 9.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .39-.187A4.5 4.5 0 0 0 8.027 12H6.5a.5.5 0 0 0-.5.5V16H3a1 1 0 0 1-1-1zm2 1.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5m3 0v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5m3.5-.5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zM4 5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5M7.5 5a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5zm2.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5M4.5 8a.5.5 0 0 0-.5.5v1a.5.5 0 0 0 .5.5h1a.5.5 0 0 0 .5-.5v-1a.5.5 0 0 0-.5-.5z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/dashboard"
            class="text-gray-700 hover:text-gray-900"
            >Dashboard</NuxtLink
          >
        </li>
        <!-- Talepler, Dashboard'ın hemen altında: günlük olarak en sık
             bakılacak ekran burası. -->
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-inbox-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/leads"
            class="text-gray-700 hover:text-gray-900"
            >Talepler &amp; İstatistik</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-sign-turn-right-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098zM9 8.466V7H7.5A1.5 1.5 0 0 0 6 8.5V11H5V8.5A2.5 2.5 0 0 1 7.5 6H9V4.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L9.41 8.658A.25.25 0 0 1 9 8.466"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/navbar"
            class="text-gray-700 hover:text-secondary"
            >Üst Menü</NuxtLink
          >
        </li>
                <li class="mb-6 flex gap-3 align-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-life-preserver text-primary w-8 h-8"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m6.43-5.228a7.03 7.03 0 0 1-3.658 3.658l-1.115-2.788a4 4 0 0 0 1.985-1.985zM5.228 14.43a7.03 7.03 0 0 1-3.658-3.658l2.788-1.115a4 4 0 0 0 1.985 1.985zm9.202-9.202-2.788 1.115a4 4 0 0 0-1.985-1.985l1.115-2.788a7.03 7.03 0 0 1 3.658 3.658m-8.087-.87a4 4 0 0 0-1.985 1.985L1.57 5.228A7.03 7.03 0 0 1 5.228 1.57zM8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
            />
          </svg>
          <NuxtLink
            to="/evdeneveyonetim/site"
            class="text-gray-700 hover:text-secondary"
            >Site Genel</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-star-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/reviews"
            class="text-gray-700 hover:text-secondary"
            >Müşteri Yorumları</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-calculator-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M12 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2M4 2.5a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5zM5 7a1 1 0 1 1 0 2 1 1 0 0 1 0-2m3 0a1 1 0 1 1 0 2 1 1 0 0 1 0-2m2 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0M5 10a1 1 0 1 1 0 2 1 1 0 0 1 0-2m2 1a1 1 0 1 1 2 0 1 1 0 0 1-2 0m3-1a1 1 0 1 1 0 2 1 1 0 0 1 0-2"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/price-estimator"
            class="text-gray-700 hover:text-secondary"
            >Fiyat Hesaplama</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-shield-lock-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.8 11.8 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7 7 0 0 0 1.048-.625 11.8 11.8 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.54 1.54 0 0 0-1.044-1.263 63 63 0 0 0-2.887-.87C9.843.266 8.69 0 8 0m0 5a1.5 1.5 0 0 1 .5 2.915l.385 1.99a.5.5 0 0 1-.491.595h-.788a.5.5 0 0 1-.49-.595l.384-1.99A1.5 1.5 0 0 1 8 5"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/policies"
            class="text-gray-700 hover:text-secondary"
            >Politika Metinleri</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-list-ol text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5"
              />
              <path
                d="M1.713 11.865v-.474H2c.217 0 .363-.137.363-.317 0-.185-.158-.31-.361-.31-.223 0-.367.152-.373.31h-.59c.016-.467.373-.787.986-.787.588-.002.954.291.957.703a.595.595 0 0 1-.492.594v.033a.687.687 0 0 1 .586.663c.003.464-.406.75-1.02.75-.61 0-1.03-.3-1.06-.798h.582c.008.187.15.297.373.297.208 0 .375-.09.375-.297 0-.187-.16-.293-.363-.293h-.316zM1.617 7.325h-.616V5.723h-.033l-.552.375v-.578l.585-.399h.616z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/process"
            class="text-gray-700 hover:text-secondary"
            >Süreç Adımları</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-life-preserver text-primary w-8 h-8"
            viewBox="0 0 16 16"
          >
            <path
              d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m6.43-5.228a7.03 7.03 0 0 1-3.658 3.658l-1.115-2.788a4 4 0 0 0 1.985-1.985zM5.228 14.43a7.03 7.03 0 0 1-3.658-3.658l2.788-1.115a4 4 0 0 0 1.985 1.985zm9.202-9.202-2.788 1.115a4 4 0 0 0-1.985-1.985l1.115-2.788a7.03 7.03 0 0 1 3.658 3.658m-8.087-.87a4 4 0 0 0-1.985 1.985L1.57 5.228A7.03 7.03 0 0 1 5.228 1.57zM8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6"
            />
          </svg>
          <NuxtLink
            to="/evdeneveyonetim/services"
            class="text-gray-700 hover:text-secondary"
            >Servisler</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-question-square-fill text-primary w-8 h-8"
            viewBox="0 0 16 16"
          >
            <path
              d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.496 6.033a.237.237 0 0 1-.24-.247C5.35 4.091 6.737 3.5 8.005 3.5c1.396 0 2.672.73 2.672 2.24 0 1.08-.635 1.594-1.244 2.057-.737.559-1.01.768-1.01 1.486v.105a.25.25 0 0 1-.25.25h-.81a.25.25 0 0 1-.25-.246l-.004-.217c-.038-.927.495-1.498 1.168-1.987.59-.444.965-.736.965-1.371 0-.825-.628-1.168-1.314-1.168-.803 0-1.253.478-1.342 1.134-.018.137-.128.25-.266.25h-.825zm2.325 6.443c-.584 0-1.009-.394-1.009-.927 0-.552.425-.94 1.01-.94.609 0 1.028.388 1.028.94 0 .533-.42.927-1.029.927"
            />
          </svg>
          <NuxtLink
            to="/evdeneveyonetim/faq"
            class="text-gray-700 hover:text-secondary"
            >Sorular</NuxtLink
          >
        </li>
        <!--
             M6'DA MENÜDEN ÇIKARILAN YEDİ EKRAN
             ─────────────────────────────────────────────────────────────
             Hepsinin herkese açık tüketicisi ölçüldü ve SIFIR çıktı; yani
             yönetici bu ekranlarda düzenleme yapıp kaydediyor, veri
             tabanına yazılıyor ve sitede hiçbir şey değişmiyordu.

               Güven Bandı      TrustBar.vue        render edilmiyordu
               Neden Biz?       Choose.vue          render edilmiyordu
               We Help          Help.vue            render edilmiyordu
               Fiyatlar         Pricing.vue         render edilmiyordu
               Yorumlar (bölüm) Testimonial.vue     render edilmiyordu
               İletişim Form    QuoteRequest        0 kayıt, 0 tüketici
               Anasayfa (Hero)  HeroPage            12 alandan 2'si canlıydı
               Footer           Footer              12 bağlantı kaydı ve
                                                    telif metni hiç
                                                    okunmuyordu; adres/
                                                    telefon/e-posta ise
                                                    Site Ayarları'nı ezen
                                                    boş kopyalardı

             M4'te bu ekranların üstüne "YAYINDA DEĞİL" şeridi konmuştu; o
             geçici bir güvenlik önlemiydi. Ölü bir ekranı menüde sonsuza
             kadar uyarıyla tutmak temizlik değil, ertelemedir.

             SAYFA, PANEL ve UÇ NOKTA da silindi. Veri tabanı tabloları
             DURUYOR (veri kaybı yok) — ayrıntı M6 raporunda.

             Hero'nun iki canlı alanı (düğme metni + adresi) Site Ayarları'na
             taşındı; İstanbul dışı bölge sayfalarının kapanış düğmesi aynen
             çalışmaya devam ediyor.

             Aynı gerekçeyle daha önce kaldırılmıştı:
             "Özellikler" (/evdeneveyonetim/feature) bağlantısı KALDIRILDI.
             Arkasındaki bölüm sitede hiçbir sayfada render edilmiyordu;
             panel açılıyor, veri kaydediliyor ama görünmüyordu. Bileşen,
             panel, sayfa ve API uç noktası birlikte silindi. Aynı durumdaki
             "Kartlar" (/evdeneveyonetim/card) sayfasının zaten menüde
             bağlantısı yoktu, yalnızca doğrudan adresle açılıyordu. -->
        <li class="mb-6 flex gap-3 align-middle">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            fill="currentColor"
            class="bi bi-file-earmark-person-fill text-primary w-8 h-8"
            viewBox="0 0 16 16"
          >
            <path
              d="M9.293 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.707A1 1 0 0 0 13.707 4L10 .293A1 1 0 0 0 9.293 0M9.5 3.5v-2l3 3h-2a1 1 0 0 1-1-1M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0m2 5.755V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-.245S4 12 8 12s5 1.755 5 1.755"
            />
          </svg>
          <NuxtLink
            to="/evdeneveyonetim/about"
            class="text-gray-700 hover:text-secondary"
            >Hakkımızda</NuxtLink
          >
        </li>
        <!-- Ana Sayfa en üstte: sitenin en çok görüntülenen sayfası ve
             bu ekran onun kontrollü içeriğini yönetiyor. -->
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-house-door-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M6.5 14.5v-3.505c0-.245.25-.495.5-.495h2c.25 0 .5.25.5.5v3.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 .5-.5"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/anasayfa"
            class="text-gray-700 hover:text-secondary"
            >Ana Sayfa</NuxtLink
          >
        </li>
        <!-- İç Sayfalar, Ana Sayfa'nın hemen altında: aynı işin devamı —
             sitenin geri kalan sayfalarının editoryal içeriği. -->
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-layers-fill text-primary w-8 h-8" viewBox="0 0 16 16">
              <path d="M7.765 1.559a.5.5 0 0 1 .47 0l7.5 4a.5.5 0 0 1 0 .882l-7.5 4a.5.5 0 0 1-.47 0l-7.5-4a.5.5 0 0 1 0-.882z"/>
              <path d="m2.125 8.567-1.86.992a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882l-1.86-.992-5.17 2.756a1.5 1.5 0 0 1-1.41 0z"/>
            </svg>
          </span>
          <NuxtLink to="/evdeneveyonetim/ic-sayfa" class="text-gray-700 hover:text-secondary">İç Sayfalar</NuxtLink>
        </li>

        <!-- Medya Kütüphanesi: içerik ekranlarındaki görsel seçicinin
             arkasındaki envanter. -->
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-images text-primary w-8 h-8" viewBox="0 0 16 16">
              <path d="M4.502 9a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
              <path d="M14.002 13a2 2 0 0 1-2 2h-10a2 2 0 0 1-2-2V5A2 2 0 0 1 2 3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8a2 2 0 0 1-1.998 2M14 2H4a1 1 0 0 0-1 1h9.002a2 2 0 0 1 2 2v7A1 1 0 0 0 15 11V3a1 1 0 0 0-1-1M2.002 4a1 1 0 0 0-1 1v8l2.646-2.354a.5.5 0 0 1 .63-.062l2.66 1.773 3.71-3.71a.5.5 0 0 1 .577-.094l1.777 1.947V5a1 1 0 0 0-1-1z"/>
            </svg>
          </span>
          <NuxtLink to="/evdeneveyonetim/medya" class="text-gray-700 hover:text-secondary">Medya Kütüphanesi</NuxtLink>
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-globe-central-south-asia text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0M4.882 1.731a.48.48 0 0 0 .14.291.487.487 0 0 1-.126.78l-.291.146a.7.7 0 0 0-.188.135l-.48.48a1 1 0 0 1-1.023.242l-.02-.007a1 1 0 0 0-.462-.04 7 7 0 0 1 2.45-2.027m-3 9.674.86-.216a1 1 0 0 0 .758-.97v-.184a1 1 0 0 1 .445-.832l.04-.026a1 1 0 0 0 .152-1.54L3.121 6.621a.414.414 0 0 1 .542-.624l1.09.818a.5.5 0 0 0 .523.047.5.5 0 0 1 .724.447v.455a.8.8 0 0 0 .131.433l.795 1.192a1 1 0 0 1 .116.238l.73 2.19a1 1 0 0 0 .949.683h.058a1 1 0 0 0 .949-.684l.73-2.189a1 1 0 0 1 .116-.238l.791-1.187A.45.45 0 0 1 11.743 8c.16 0 .306.084.392.218.557.875 1.63 2.282 2.365 2.282l.04-.001a7.003 7.003 0 0 1-12.658.905Z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/region"
            class="text-gray-700 hover:text-secondary"
            >Bölgeler</NuxtLink
          >
        </li>
        <!-- Mahalleler, Bölgeler'in hemen altında: aynı coğrafi hiyerarşinin
             bir alt katmanı (İstanbul → ilçe → mahalle) ve ilçe kaydı
             seçilmeden mahalle oluşturulamıyor. -->
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-signpost-split-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M7 16h2V6h5a1 1 0 0 0 .8-.4l.975-1.3a.5.5 0 0 0 0-.6L14.8 2.4A1 1 0 0 0 14 2H9v-.586a1 1 0 0 0-2 0V3H2a1 1 0 0 0-.8.4L.225 4.7a.5.5 0 0 0 0 .6L1.2 6.6A1 1 0 0 0 2 7h5zm2-11V3h5l.75 1L14 5zM7 8v2H2l-.75-1L2 8z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/neighborhood"
            class="text-gray-700 hover:text-secondary"
            >Mahalleler</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-postcard-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path d="M11 8h2V6h-2z" />
              <path
                d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm8.5.5a.5.5 0 0 0-1 0v7a.5.5 0 0 0 1 0zM2 5.5a.5.5 0 0 0 .5.5H6a.5.5 0 0 0 0-1H2.5a.5.5 0 0 0-.5.5M2.5 7a.5.5 0 0 0 0 1H6a.5.5 0 0 0 0-1zM2 9.5a.5.5 0 0 0 .5.5H6a.5.5 0 0 0 0-1H2.5a.5.5 0 0 0-.5.5m8-4v3a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 .5-.5v-3a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/post"
            class="text-gray-700 hover:text-secondary"
            >Postlar</NuxtLink
          >
        </li>
        <li class="mb-6 flex gap-3 align-middle">
          <span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-bookmarks-fill text-primary w-8 h-8"
              viewBox="0 0 16 16"
            >
              <path
                d="M2 4a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L7 13.101l-4.223 2.815A.5.5 0 0 1 2 15.5z"
              />
              <path
                d="M4.268 1A2 2 0 0 1 6 0h6a2 2 0 0 1 2 2v11.5a.5.5 0 0 1-.777.416L13 13.768V2a1 1 0 0 0-1-1z"
              />
            </svg>
          </span>
          <NuxtLink
            to="/evdeneveyonetim/meta"
            class="text-gray-700 hover:text-secondary"
            >Meta Taglar</NuxtLink
          >
        </li>
      </ul>
    </div>
  </aside>
</template>
