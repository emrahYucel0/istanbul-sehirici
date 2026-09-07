<script setup>
const router = useRouter()
const isLoggingOut = ref(false)

const handleLogout = async () => {
  isLoggingOut.value = true
  try {
    await $fetch('/api/logout', { method: 'POST' })
  } finally {
    isLoggingOut.value = false
    // Çıkış, giriş sayfasının YENİ adresine dönüyor (bkz. middleware/auth.global.ts).
    router.push('/sehiriciyonetim')
  }
}
</script>

<template>
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-lg font-semibold">Admin Panel</h1>
          </div>
          <div class="flex items-center">
            <button
              @click="handleLogout"
              :disabled="isLoggingOut"
              class="text-sm font-medium text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              Çıkış Yap
            </button>
          </div>
        </div>
      </div>
    </nav>
</template>