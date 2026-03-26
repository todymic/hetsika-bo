<script setup lang="ts">
const props = defineProps<{ fields: { key: string; filled: boolean }[] }>()

const percent = computed(() => {
  if (!props.fields.length) return 0
  return Math.round(props.fields.filter(f => f.filled).length / props.fields.length * 100)
})

const color = computed(() => {
  if (percent.value >= 80) return 'text-success'
  if (percent.value >= 40) return 'text-warning'
  return 'text-error'
})
</script>

<template>
  <div class="flex items-center gap-3 rounded-lg bg-muted/30 px-4 py-2.5">
    <UIcon
      :name="percent === 100 ? 'i-lucide-circle-check' : 'i-lucide-circle-dashed'"
      class="size-4 shrink-0"
      :class="percent === 100 ? 'text-success' : 'text-muted'"
    />
    <span class="text-xs text-muted">Complétude</span>
    <div class="h-1.5 flex-1 overflow-hidden rounded-full bg-border">
      <div
        class="h-full rounded-full bg-primary transition-all duration-500"
        :style="{ width: `${percent}%` }"
      />
    </div>
    <span class="text-xs font-medium tabular-nums" :class="color">
      {{ percent }}%
    </span>
  </div>
</template>
