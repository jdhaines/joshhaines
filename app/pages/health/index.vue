<script setup lang="ts">
definePageMeta({
  layout: "health",
})

await navigateTo("/health/habits", { redirectCode: 302 })
</script>
