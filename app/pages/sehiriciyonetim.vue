<script setup>
import { useDarkMode } from "~/composables/useDarkMode";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref(null);
const isLoading = ref(false);
const showPassword = ref(false);
const { isDark, toggleDarkMode } = useDarkMode();

const handleLogin = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    const response = await $fetch("/api/login", {
      method: "POST",
      body: { email: email.value, password: password.value },
    });
    if (response.success) router.push("/evdeneveyonetim/dashboard");
  } catch (err) {
    error.value = err.data?.statusMessage || "Giriş başarısız.";
  } finally {
    isLoading.value = false;
  }
};


</script>

<template>
  <div
    class="relative min-h-screen bg-gradient-to-tr from-gray-900 via-indigo-950 to-black dark:from-gray-950 dark:via-blue-950 dark:to-black overflow-hidden"
  >
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl top-[-200px] left-[-200px] transform rotate-45"
      ></div>
      <div
        class="absolute w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-3xl bottom-[-300px] right-[-300px]"
      ></div>
      <div
        class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0,rgba(0,0,0,0.8)_100%)]"
      ></div>
    </div>

    <div
      class="relative z-10 flex items-center justify-center min-h-screen px-4"
    >
      <div
        class="w-full max-w-lg bg-white/90 dark:bg-gray-900/90 backdrop-blur-2xl rounded-3xl shadow-[0_15px_60px_rgba(0,0,0,0.5)] border border-gray-200/30 dark:border-gray-800/30 p-10"
      >
        <div class="flex justify-center mb-8">
          <div class="relative">
            <svg
              class="w-16 h-16 text-indigo-600 dark:text-indigo-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 11c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3zm0 2c-2.76 0-5 2.24-5 5v1h10v-1c0-2.76-2.24-5-5-5z"
              />
            </svg>
            <span
              class="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 animate-ping"
            ></span>
          </div>
        </div>
        <div class="mt-8 flex justify-end">
          <!-- İçinde yalnızca ikon var; etiket olmadan ekran okuyucu sadece
               "düğme" diyordu. Etiket, o anki temayı değil YAPILACAK İŞİ
               söylüyor. `type="button"` de eksikti — form içinde olsaydı
               gönderim tetiklerdi. -->
          <button
            type="button"
            :aria-label="isDark ? 'Açık temaya geç' : 'Koyu temaya geç'"
            @click="toggleDarkMode"
            class="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all duration-300 shadow-sm"
          >
            <svg
              v-if="isDark"
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.36 6.36l-.7-.7M6.34 6.34l-.7-.7m12.72 0l-.7.7M6.34 17.66l-.7.7M12 8a4 4 0 100 8 4 4 0 000-8z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M20.354 15.354A9 9 0 018.646 3.646 9 9 0 0020.354 15.354z"
              />
            </svg>
          </button>
        </div>
        <h2
          class="text-4xl font-bold text-center text-gray-900 dark:text-white tracking-tight"
        >
          Admin Erişimi
        </h2>
        <p
          class="text-center text-gray-500 dark:text-gray-400 mt-2 text-sm font-medium"
        >
          Sistemin kontrolü sizin elinizde
        </p>

        <form @submit.prevent="handleLogin" class="mt-10 space-y-6">
          <div class="relative group">
            <label
              for="email"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              >E-posta</label
            >
            <div class="relative">
              <input
                id="email"
                v-model="email"
                type="email"
                class="w-full p-4 pl-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="E-postanızı girin"
                required
              />
              <span
                class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
            </div>
          </div>

          <div class="relative group">
            <label
              for="password"
              class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400"
              >Şifre</label
            >
            <div class="relative">
              <input
                id="password"
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                class="w-full p-4 pl-12 pr-12 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                placeholder="Şifrenizi girin"
                required
              />
              <span
                class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
              >
                <svg
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 11c0-1.1-.9-2-2-2s-2 .9-2 2 2 4 2 4m4-4c0-1.1-.9-2-2-2s-2 .9-2 2m-4 6h8m-8-2h8m-8-2h8m-8-2h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"
                  />
                </svg>
              </span>
              <!-- Etiket duruma göre değişiyor: buton neyi YAPACAĞINI
                   söylemeli, o an ne olduğunu değil. -->
              <button
                type="button"
                :aria-label="showPassword ? 'Parolayı gizle' : 'Parolayı göster'"
                @click="showPassword = !showPassword"
                class="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none transition-colors"
              >
                <svg
                  v-if="showPassword"
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.62 0c-1.32 2.75-4.13 4.5-7.62 4.5s-6.3-1.75-7.62-4.5C7.7 9.25 10.51 7.5 14 7.5s6.3 1.75 7.62 4.5zM4 4l16 16"
                  />
                </svg>
                <svg
                  v-else
                  class="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0zm6.62 0c-1.32 2.75-4.13 4.5-7.62 4.5s-6.3-1.75-7.62-4.5C7.7 9.25 10.51 7.5 14 7.5s6.3 1.75 7.62 4.5z"
                  />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            :disabled="isLoading"
            class="w-full p-4 bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-500 dark:to-blue-500 text-white rounded-xl font-semibold text-lg tracking-wide hover:from-indigo-700 hover:to-blue-700 dark:hover:from-indigo-600 dark:hover:to-blue-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:focus:ring-indigo-700 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
          >
            <span v-if="isLoading" class="flex items-center">
              <svg
                class="w-5 h-5 animate-spin mr-2"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                ></circle>
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                ></path>
              </svg>
              Yükleniyor...
            </span>
            <span v-else>Giriş Yap</span>
          </button>

          <transition name="fade">
            <p
              v-if="error"
              class="text-center text-red-500 dark:text-red-400 text-sm font-medium mt-4"
            >
              {{ error }}
            </p>
          </transition>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* İnce ayarlar için özel stiller */
input:focus + span svg {
  @apply text-indigo-500 dark:text-indigo-400;
}
</style>
