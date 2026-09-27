<script setup lang="ts">
const route = useRoute()
const showTradingViewAttribution = computed(() =>
  ["/health/weight", "/health/lifts"].includes(route.path)
)
</script>

<template>
  <NuxtRouteAnnouncer />
  <UApp>
    <SiteHeader />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <SiteFooter />
    <p
      v-if="showTradingViewAttribution"
      class="bg-muted px-4 pb-2 text-center text-[10px] text-dimmed"
    >
      TradingView Lightweight Charts™ — Copyright © 2025
      <a
        href="https://www.tradingview.com/"
        target="_blank"
        rel="noopener noreferrer"
        class="underline decoration-dotted underline-offset-2 hover:text-muted"
      >
        TradingView, Inc.
      </a>
    </p>
    <SiteSearch />
    <ImageLightbox />
  </UApp>
</template>
