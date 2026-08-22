// composables/useSectionCrud.ts
// Tek kayıtlı (sectionName ile bulunan) admin section'ları için ortak CRUD state'i.
// Panelin kendi template'i (form alanları, nested listeler) aynı kalır; sadece
// load/save/delete boilerplate'i buradan gelir.
//
// Tüm section'lar sectionName üzerinde unique constraint'e sahip tekil kayıtlar
// (en fazla bir "hero", bir "quotes" satırı olabilir) — bu yüzden "yeni kayıt
// ekle" diye ayrı bir modal/akış yok: save() kayıt yoksa oluşturur, varsa
// günceller (form.id varlığına bakarak kendisi karar verir). Silme, kaydı tümüyle
// temizler (tekrar save() ile yeniden oluşturulabilir).
//
// apiPath (örn. "quote") ve sectionName (örn. "quotes") KASITLI olarak ayrı
// parametreler: API route dosya adı ile DB'deki sectionName alanı çoğu bölümde
// aynı string olsa da (örn. "hero" route + "heros" sectionName) her zaman
// birbirini tutmuyor — ikisini tek parametreye indirgemek yanlış URL'e istek
// atılmasına yol açar (Nuxt bunu sayfa route'u sanıp 404 yakalayıcısına düşürür,
// 200 OK ile HTML döner, kaydetme "başarılı" görünür ama hiçbir şey kaydedilmez).
//
// $fetch (ofetch) kasıtlı olarak kullanılıyor, useFetch değil: useFetch URL bazlı
// bir cache anahtarı kullanır ve load() burada birden çok kez (mount + her
// save/remove sonrası) çağrıldığından, useFetch ikinci çağrıda sunucuya gitmek
// yerine ilk yüklemedeki veriyi cache'ten döndürebiliyordu.
export function useSectionCrud<T extends Record<string, any>>(
  apiPath: string,
  sectionName: string,
  initialShape: T,
  /**
   * `loadQuery`: OKUMA çağrısına eklenen sorgu dizesi (örn. `?admin=true`).
   *
   * Yayın durumu gelen bölümlerde (bugün yalnız hizmetler) herkese açık
   * okuma taslakları süzüyor; panel ise onları görmek zorunda. Yazma
   * çağrılarına EKLENMİYOR: POST/PUT/DELETE zaten `requireAdmin` arkasında
   * ve gövdeye sorgu parametresi taşımak bir anlam ifade etmiyor.
   */
  options: { loadQuery?: string } = {}
) {
  const form = reactive({ ...initialShape }) as T
  const message = ref('')
  const showDeleteModal = ref(false)
  // save()/remove() süren istek boyunca true — panel şablonu bunu Kaydet/Sil
  // butonlarını devre dışı bırakmak için kullanır. Olmadan, yavaş bir ağda
  // çift tıklama aynı kaydı iki kez POST/PUT veya DELETE edebiliyordu.
  const isSaving = ref(false)
  const isDeleting = ref(false)
  // Panelin initialShape'inde "id" olsun ya da olmasın, kayıt var mı yok mu
  // burada takip edilir — save()'in POST/PUT karar mekanizması buna bakar.
  const recordId = ref<number | string | null>(null)

  const applyData = (data: (Partial<T> & { id?: number | string }) | null | undefined) => {
    if (!data) return
    recordId.value = data.id ?? null
    for (const key of Object.keys(initialShape) as (keyof T)[]) {
      if (data[key] !== undefined) {
        form[key] = data[key] as T[keyof T]
      }
    }
  }

  const extractPayload = (response: any) => {
    if (!response || response.success === false) return null
    return response.data ?? response
  }

  const load = async () => {
    try {
      const response = await $fetch(`/api/${apiPath}${options.loadQuery ?? ''}`)
      applyData(extractPayload(response))
    } catch {
      message.value = 'Veri alınırken hata oluştu.'
    }
  }

  // Kayıt yoksa (form.id boş) oluşturur, varsa günceller.
  const save = async () => {
    if (isSaving.value) return { success: false }
    isSaving.value = true
    const method = recordId.value ? 'PUT' : 'POST'
    try {
      const response: any = await $fetch(`/api/${apiPath}`, {
        method,
        body: { sectionName, ...form },
      })
      if (response?.success === false) {
        // SUNUCUNUN CÜMLESİ AYNEN GÖSTERİLİYOR.
        //
        // Genel "hata oluştu" metni, adres çakışması gibi düzeltilebilir
        // sorunlarda yöneticiyi kör bırakıyordu: hangi adresin, hangi
        // kayıtla çakıştığı yalnız sunucu yanıtında vardı. Domain hataları
        // zaten okunur cümleler (bkz. root-paths.ts); ham yığın izi ya da
        // Prisma hatası buraya ulaşmıyor (getSafeErrorMessage süzüyor).
        //
        // "hata" ÖNEKİ BİLEREK KORUNUYOR: on bir panel mesajın kırmızı mı
        // yeşil mi görüneceğine `message.includes('hata')` ile karar
        // veriyor. Sunucunun cümlesi bu kelimeyi içermek zorunda değil —
        // önek olmadan adres çakışması BAŞARI rengiyle basılırdı.
        message.value = response.error
          ? `Kaydetme hatası: ${response.error}`
          : method === 'POST' ? 'Oluşturma sırasında hata oluştu.' : 'Güncelleme sırasında hata oluştu.'
        return { success: false, error: response.error }
      }
      applyData(extractPayload(response))
      message.value = method === 'POST' ? 'Başarıyla oluşturuldu!' : 'Başarıyla güncellendi!'
      return { success: true }
    } catch {
      message.value = 'Kaydetme sırasında hata oluştu.'
      return { success: false }
    } finally {
      isSaving.value = false
    }
  }

  const remove = async () => {
    if (isDeleting.value) return
    showDeleteModal.value = false
    isDeleting.value = true
    try {
      const response: any = await $fetch(`/api/${apiPath}`, {
        method: 'DELETE',
        body: { sectionName },
      })
      if (response?.success === false) {
        message.value = 'Silme sırasında hata oluştu.'
      } else {
        message.value = 'Kayıt silindi!'
        Object.assign(form, initialShape)
        recordId.value = null
      }
    } catch {
      message.value = 'Silme sırasında hata oluştu.'
    } finally {
      isDeleting.value = false
    }
  }

  onMounted(load)

  return { form, message, showDeleteModal, recordId, isSaving, isDeleting, load, save, remove }
}
