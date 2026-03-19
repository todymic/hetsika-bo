<script setup lang="ts">
import type { Media } from '~/types/model'

defineProps<{ files: Media[] }>()
defineEmits<{ remove: [media: Media] }>()

const { t } = useI18n()

function isImageMime(mime: string) { return mime.startsWith('image/') }
</script>

<template>
  <div v-if="files.length" class="space-y-2">
    <p class="flex items-center gap-1.5 text-xs font-medium text-muted">
      <UIcon name="i-lucide-paperclip" class="size-3.5" />
      {{ t('events.stepper.info.existing_files', 'Fichiers existants') }}
    </p>

    <ul class="space-y-2">
      <li
        v-for="media in files"
        :key="media.id"
        class="flex items-center gap-3 rounded-lg border border-default bg-muted/20 px-3 py-2"
      >
        <div class="h-10 w-10 shrink-0 overflow-hidden rounded-md border border-default bg-muted/40">
          <img
            v-if="isImageMime(media.mimeType)"
            :src="media.thumbnailUrl || media.url"
            :alt="media.originalName"
            class="h-full w-full object-cover"
          />
          <div v-else class="flex h-full w-full items-center justify-center">
            <UIcon name="i-lucide-file-text" class="size-4 text-muted" />
          </div>
        </div>

        <div class="min-w-0 flex-1">
          <p class="truncate text-sm font-medium text-highlighted">{{ media.originalName }}</p>
          <div class="flex items-center gap-2">
            <span class="text-xs text-muted uppercase">{{ media.mimeType.split('/')[1] }}</span>
            <span v-if="media.isCover" class="inline-flex items-center gap-1 text-xs text-primary">
              <UIcon name="i-lucide-star" class="size-3" />
              {{ t('events.stepper.info.cover', 'Couverture') }}
            </span>
          </div>
        </div>

        <UButton variant="ghost" size="xs" icon="i-lucide-external-link" color="neutral" :to="media.url" target="_blank" />
        <UButton variant="ghost" size="xs" icon="i-lucide-trash-2" color="error" @click="$emit('remove', media)" />
      </li>
    </ul>

    <UDivider class="my-2" />
  </div>
</template>
