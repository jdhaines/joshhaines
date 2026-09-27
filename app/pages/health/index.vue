<script setup lang="ts">
definePageMeta({
  layout: "health",
})

await navigateTo("/health/weight", { redirectCode: 302 })
</script>
