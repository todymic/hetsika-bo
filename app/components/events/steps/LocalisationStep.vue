<script setup lang="ts">
import * as z from 'zod'

const { t }  = useI18n()
const store  = useEventFormStore()

const schema = z.object({
  street:          z.string().min(1),
  complement:      z.string().optional(),
  city:            z.string().min(1),
  zipCode:         z.string().min(1),
  selectedCountry: z.string().min(1),
})

const countries = [
  { label: '🇱🇺  Luxembourg', value: 'LU' },
  { label: '🇫🇷  France',     value: 'FR' },
  { label: '🇧🇪  Belgique',   value: 'BE' },
  { label: '🇩🇪  Allemagne',  value: 'DE' },
  { label: '🇲🇬  Madagascar', value: 'MG' },
]

const formattedAddress = computed(() => {
  const { street, complement, city, zipCode, selectedCountry } = store.address
  return [street, complement, [zipCode, city].filter(Boolean).join(' '), selectedCountry]
    .filter(Boolean).join(', ')
})

const hasAddress = computed(() => !!store.address.street || !!store.address.city)

const form = useTemplateRef('addressForm')

async function validate(): Promise<boolean> {

  console.log("fsdfsdf")
  try {
    const response = await (form.value as any)?.validate()
    console.log(response)
  }
  catch (e: any){
    console.log(e.errors)
  }


  return schema.safeParse(store.address).success
}

defineExpose({ validate })
</script>

<template>
  <UCard class="w-full overflow-hidden">

    <!-- ── Header ─────────────────────────────────────────── -->
    <template #header>
      <div class="flex items-start gap-3">
        <div class="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center
                    rounded-lg bg-primary/10 text-primary">
          <UIcon name="i-lucide-map-pin" class="size-5" />
        </div>
        <div>
          <h1 class="text-base font-semibold text-highlighted">
            {{ t('events.stepper.localisation.subtitle') }}
          </h1>
          <p class="mt-0.5 text-sm text-muted">
            {{ t('events.stepper.localisation.subtitle_hint') }}
          </p>
        </div>
      </div>
    </template>

    <!-- ── Body ───────────────────────────────────────────── -->
    <UForm ref="addressForm" :schema="schema" :state="store.address" class="space-y-5">

      <!-- Country -->
      <UFormField :label="t('events.stepper.localisation.country_label', 'Pays')" name="selectedCountry" required>
        <USelectMenu
          v-model="store.address.selectedCountry"
          :items="countries"
          value-key="value"
          :placeholder="t('events.stepper.localisation.country_placeholder', 'Sélectionnez un pays')"
          leading-icon="i-lucide-globe"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Street -->
      <UFormField :label="t('events.stepper.localisation.street_label', 'Adresse')" name="street" required>
        <UInput
          v-model="store.address.street"
          :placeholder="t('events.stepper.localisation.street_placeholder', '12 rue des Fleurs')"
          leading-icon="i-lucide-map-pin"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Complement -->
      <UFormField :label="t('events.stepper.localisation.complement_label', 'Complément')" name="complement">
        <template #hint>
          <span class="text-xs text-muted">{{ t('events.stepper.localisation.complement_hint', 'Optionnel') }}</span>
        </template>
        <UInput
          v-model="store.address.complement"
          :placeholder="t('events.stepper.localisation.complement_placeholder', 'Bâtiment, étage...')"
          leading-icon="i-lucide-building-2"
          size="lg"
          class="w-full"
        />
      </UFormField>

      <!-- Zip + City -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <UFormField :label="t('events.stepper.localisation.zip_label', 'Code postal')" name="zipCode" required class="sm:col-span-2">
          <UInput v-model="store.address.zipCode" :placeholder="t('events.stepper.localisation.zip_placeholder', '1234')" leading-icon="i-lucide-hash" size="lg" class="w-full" />
        </UFormField>
        <UFormField :label="t('events.stepper.localisation.city_label', 'Ville')" name="city" required class="sm:col-span-3">
          <UInput v-model="store.address.city" :placeholder="t('events.stepper.localisation.city_placeholder', 'Luxembourg')" leading-icon="i-lucide-landmark" size="lg" class="w-full" />
        </UFormField>
      </div>

      <!-- Address preview -->
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0 -translate-y-1"
        enter-to-class="opacity-100 translate-y-0"
      >
        <div v-if="hasAddress" class="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <UIcon name="i-lucide-map-pin-check" class="mt-0.5 size-4 shrink-0 text-primary" />
          <div class="min-w-0">
            <p class="text-xs font-medium text-primary">
              {{ t('events.stepper.localisation.preview_label', 'Adresse complète') }}
            </p>
            <p class="mt-0.5 truncate text-sm text-muted">{{ formattedAddress }}</p>
          </div>
        </div>
      </Transition>

    </UForm>
  </UCard>
</template>
