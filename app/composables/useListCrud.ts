// composables/useListCrud.ts
// Çoklu kayıtlı (Post, Region gibi) admin panelleri için ortak liste-CRUD state'i.
// useSectionCrud'un tekil-kayıt karşılığı: burada tek bir "form" değil, bir "items"
// listesi ve o listeden seçilip forma yüklenen tek bir kayıt var. Filtreleme,
// zengin metin editörü (TipTap) senkronizasyonu gibi panele özgü şeyler
// composable'ın dışında, panelin kendi template/script'inde kalır.
//
// POST/PUT kararı form[idField] (varsayılan "id") doluluğuna bakılarak veriliyor;
// DELETE ve listeden kayıt bulma ise keyField (varsayılan "slug") üzerinden yapılıyor
// — çünkü yeni oluşturulan bir kayıtta henüz id yokken slug zaten kullanıcı tarafından
// girilmiş oluyor, var olan API'ler de silme/bulma işlemlerini slug ile yapıyor.
//
// `options.paginated: true` verilmezse (varsayılan) davranış öncekiyle birebir
// aynıdır: tüm kayıtlar tek seferde çekilir. `paginated: true` verilirse liste
// server/api/posts.ts ve regions.ts'in artık desteklediği page/pageSize
// parametreleriyle sayfalanır — çok sayıda kayıtta (binlerce post/bölge) tüm
// tabloyu tek istekte çekmek yerine sadece görünen sayfa kadar veri taşınır.
export function useListCrud<T extends Record<string, any>>(
  apiPath: string,
  initialShape: T,
  options: {
    keyField?: string
    idField?: string
    /**
     * Liste isteğine eklenen sorgu. DİZE ya da FONKSİYON olabilir.
     *
     * Fonksiyon biçimi M6'da eklendi: Bölgeler paneli aynı uçtan iki farklı
     * kümeyi çekiyor (İstanbul ilçeleri / legacy bölgeler) ve seçim
     * değiştiğinde listenin YENİDEN İSTENMESİ gerekiyor. Sabit dize bunu
     * yapamazdı; `listUrl` hesaplaması fonksiyonu okuyunca reaktif oluyor ve
     * `useFetch` kendi izleyicisiyle yeni listeyi getiriyor.
     *
     * SÜZGEÇ SUNUCUDA kalsın diye böyle: 375 kaydı çekip istemcide ayırmak
     * her açılışta gereksiz veri taşımak olurdu.
     */
    listQuery?: string | (() => string)
    itemQuery?: string
    paginated?: boolean
    pageSize?: number
  } = {}
) {
  const keyField = options.keyField || 'slug'
  const idField = options.idField || 'id'
  const listQuerySecenegi = options.listQuery || ''
  const listQueryDegeri = () =>
    typeof listQuerySecenegi === 'function' ? listQuerySecenegi() : listQuerySecenegi
  // Tekil kayıt sorgusu kapsamdan BAĞIMSIZ olmalı: kayıt hangi listede
  // görünürse görünsün aynı yetkiyle açılıyor.
  const listQuery = typeof listQuerySecenegi === 'function' ? '?admin=true' : listQuerySecenegi
  // Tekil kayıt çekilirken kullanılacak sorgu. Varsayılanı listQuery: panel
  // listeyi hangi yetkiyle görüyorsa (örn. `?admin=true` → pasif kayıtlar da
  // gelsin) tek kaydı da AYNI yetkiyle görmeli. Bu ayrım yapılmadığında pasif
  // bir bölge listede görünüyor ama "Düzenle" dediğinde API onu bulamıyordu.
  // Yalnızca listeye özgü bir parametre (örn. light=true) eklenirse burası
  // ayrıca verilmelidir — tekil kayıt her zaman TAM gelmelidir.
  const itemQuery = options.itemQuery ?? listQuery
  const paginated = options.paginated ?? false
  const pageSize = options.pageSize || 20

  // `?admin=true` + `slug=x` gibi sorguları birleştirir.
  const itemUrl = (key: string | number) => {
    const base = itemQuery.replace(/^\?/, '')
    return `/api/${apiPath}?${base ? `${base}&` : ''}${keyField}=${encodeURIComponent(String(key))}`
  }

  const form = reactive({ ...initialShape }) as T
  const message = ref('')
  // save()/remove() süren istek boyunca true — panel şablonu bunu Kaydet/Sil
  // butonlarını devre dışı bırakmak için kullanır. Olmadan, yavaş bir ağda
  // çift tıklama aynı kaydı iki kez POST/PUT veya DELETE edebiliyordu.
  const isSaving = ref(false)
  const isDeleting = ref(false)
  // selectItem() sırasında true — düzenleme formunu açan "Düzenle" butonu
  // bunu kullanarak kullanıcıya bekleme geri bildirimi verebilir.
  const isLoadingItem = ref(false)
  const page = ref(1)

  const listUrl = computed(() => {
    const sorgu = listQueryDegeri()
    if (!paginated) return `/api/${apiPath}${sorgu}`
    const sep = sorgu.includes('?') ? '&' : '?'
    return `/api/${apiPath}${sorgu}${sep}page=${page.value}&pageSize=${pageSize}`
  })

  const { data, refresh } = useFetch(listUrl, { watch: [listUrl] })

  // paginated modda data.value.data = {items,total,page,pageSize,totalPages};
  // aksi halde data.value.data doğrudan bare bir dizi.
  const paginationMeta = computed(() => {
    if (!paginated || !data.value || !(data.value as any).success) return null
    return (data.value as any).data
  })

  const items = computed(() => {
    if (!data.value || !(data.value as any).success) return []
    if (paginated) return paginationMeta.value?.items || []
    return (data.value as any).data || []
  })

  const total = computed(() => paginationMeta.value?.total ?? items.value.length)
  const totalPages = computed(() => paginationMeta.value?.totalPages ?? 1)

  const goToPage = (target: number) => {
    if (target < 1 || target > totalPages.value || target === page.value) return
    page.value = target
  }

  const resetForm = () => {
    Object.assign(form, initialShape)
  }

  // Sayfalama aktifken seçilen kayıt geçerli sayfada olmayabilir — bu yüzden
  // listedeki (potansiyel olarak eski/eksik) kopyadan değil, doğrudan API'den
  // key ile tek kayıt çekilir. Bu ayrıca sayfalama olmasa bile listenin
  // (light=true ile content'siz gelmiş olabilecek) eksik alanlarını
  // tamamlayarak her zaman düzenleme formuna TAM kaydı yükler.
  const selectItem = async (key: string | number) => {
    isLoadingItem.value = true
    try {
      const response: any = await $fetch(itemUrl(key))
      if (!response?.success || !response.data) return null
      Object.assign(form, response.data)
      return response.data
    } catch {
      return null
    } finally {
      isLoadingItem.value = false
    }
  }

  // Nuxt 4'te useFetch varsayılan olarak SHALLOW ref döndürüyor
  // (experimental.defaults.useAsyncData.deep = false). Bu yüzden
  // `data.value.data = ...` şeklinde ref'in İÇİNİ değiştirmek reaktiviteyi
  // tetiklemiyordu: liste ancak sayfa yenilenince güncelleniyordu (durum
  // değiştirme, kaydetme, silme hepsi bundan etkileniyordu). Ref'in değerini
  // bütün olarak yenilemek shallow ref'te de tetikleniyor.
  const setLocalItems = (newItems: any[]) => {
    const current = data.value as any
    if (!current) return
    data.value = paginated
      ? { ...current, data: { ...current.data, items: newItems } }
      : { ...current, data: newItems }
  }

  // items listesindeki bir kaydı ekler (yoksa) ya da yerine koyar (varsa).
  // save() içeride kullanır; toggleStatus gibi composable dışından yapılan
  // tekil güncellemeler için de dışa açılır. Sadece paginated:false modda
  // kullanılır — paginated modda save()/remove() sonrası gerçek toplam
  // sayı/sayfa içeriği için sunucudan refresh() yapılır (bkz. aşağısı).
  const replaceItem = (updated: any) => {
    if (!data.value) return
    const idx = items.value.findIndex((item: any) => item[keyField] === updated[keyField])
    const newItems =
      idx === -1
        ? [...items.value, updated]
        : items.value.map((item: any) => (item[keyField] === updated[keyField] ? updated : item))
    setLocalItems(newItems)
  }

  const save = async () => {
    if (isSaving.value) return { success: false }
    isSaving.value = true
    const method = (form as any)[idField] ? 'PUT' : 'POST'
    try {
      const response: any = await $fetch(`/api/${apiPath}`, { method, body: form })
      if (!response?.success) {
        // Sunucunun cümlesi aynen gösteriliyor (bkz. useSectionCrud.ts'teki
        // aynı gerekçe): adres çakışmasında hangi adresin hangi kayıtla
        // çakıştığı yöneticiye ulaşmalı.
        // "hata" öneki bilerek: panellerin renk kararı bu kelimeye bakıyor.
        message.value = response?.error
          ? `Kaydetme hatası: ${response.error}`
          : method === 'POST' ? 'Oluşturma sırasında hata oluştu.' : 'Güncelleme sırasında hata oluştu.'
        return { success: false, error: response?.error }
      }
      if (paginated) {
        await refresh()
      } else {
        replaceItem(response.data)
      }
      message.value = method === 'POST' ? 'Başarıyla oluşturuldu!' : 'Başarıyla güncellendi!'
      return { success: true, data: response.data }
    } catch (err) {
      message.value = 'Kaydetme sırasında hata oluştu.'
      return { success: false }
    } finally {
      isSaving.value = false
    }
  }

  const remove = async (key: string | number) => {
    if (isDeleting.value) return { success: false }
    isDeleting.value = true
    try {
      const response: any = await $fetch(`/api/${apiPath}?${keyField}=${encodeURIComponent(String(key))}`, { method: 'DELETE' })
      if (!response?.success) {
        message.value = 'Silme sırasında hata oluştu.'
        return { success: false }
      }
      if (paginated) {
        // Bu sayfadaki son kayıt silindiyse ve daha önceki bir sayfa varsa,
        // artık boş kalacak bir sayfada takılı kalınmasın diye bir önceki
        // sayfaya dön (refresh() zaten en güncel toplam/sayfa sayısını getirir).
        if (items.value.length === 1 && page.value > 1) {
          page.value -= 1
        } else {
          await refresh()
        }
      } else if (data.value) {
        setLocalItems(items.value.filter((item: any) => item[keyField] !== key))
      }
      message.value = 'Kayıt silindi!'
      return { success: true }
    } catch {
      message.value = 'Silme sırasında hata oluştu.'
      return { success: false }
    } finally {
      isDeleting.value = false
    }
  }

  return {
    form,
    message,
    items,
    isSaving,
    isDeleting,
    isLoadingItem,
    page,
    total,
    totalPages,
    goToPage,
    refresh,
    resetForm,
    selectItem,
    save,
    remove,
    replaceItem,
  }
}
