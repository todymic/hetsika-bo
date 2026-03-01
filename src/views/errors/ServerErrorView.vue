<script setup lang="ts">
import { useRouter } from "vue-router";
import { Home, RefreshCcw, TriangleAlert } from "lucide-vue-next";

const router = useRouter();

const goHome = () => router.push("/");
const reload = () => window.location.reload();
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-[#0d0d0f] px-4 relative overflow-hidden">
    <!-- Glow background -->
    <div class="absolute inset-0 pointer-events-none">
      <div class="absolute top-1/3 left-1/3 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl animate-pulse" />
      <div
        class="absolute bottom-1/3 right-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl animate-pulse"
        style="animation-delay: 1s;"
      />
    </div>

    <!-- Card -->
    <div class="relative w-full max-w-md">
      <div class="bg-white/[0.03] border border-white/[0.08] rounded-2xl p-8 shadow-2xl backdrop-blur-sm text-center">
        <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 mb-4">
          <TriangleAlert class="text-red-300" :size="22" />
        </div>

        <h1 class="text-2xl font-light text-white/90 tracking-tight" style="font-family: Georgia, serif;">
          Oups… erreur serveur
        </h1>
        <p class="text-sm text-white/40 mt-2">
          Une erreur est survenue. Réessayez dans quelques instants.
        </p>

        <div class="mt-6 flex gap-3 justify-center">
          <button
            @click="reload"
            class="px-4 py-2 rounded-xl bg-white/[0.06] border border-white/[0.10] text-white/70 text-sm hover:bg-white/[0.08] transition-all inline-flex items-center gap-2"
          >
            <RefreshCcw :size="16" />
            Réessayer
          </button>

          <button
            @click="goHome"
            class="px-4 py-2 rounded-xl bg-yellow-400 text-[#0d0d0f] text-sm font-medium hover:bg-yellow-300 transition-all inline-flex items-center gap-2"
          >
            <Home :size="16" />
            Accueil
          </button>
        </div>

        <p class="text-xs text-white/25 mt-6">
          Code erreur : <span class="text-white/40">500</span>
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
