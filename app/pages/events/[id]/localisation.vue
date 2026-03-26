<script setup lang="ts">
import * as z from 'zod'
import { useEventStore } from '~/stores/eventStore'

definePageMeta({ layout: 'event-dashboard' })

const { t }                             = useI18n()
const route                             = useRoute()
const toast                             = useToast()
const { getEvent, updateEventAddress }  = useEventStore()
const eventId                           = Number(route.params.id)

const pending = ref(true)
const saving  = ref(false)
const form    = useTemplateRef('form')

const state = ref({
  street:          '',
  complement:      '',
  city:            '',
  zipCode:         '',
  selectedCountry: '',
})

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

const formattedAddress = computed(() =>
  [state.value.street, state.value.complement,
    [state.value.zipCode, state.value.city].filter(Boolean).join(' '),
    state.value.selectedCountry].filter(Boolean).join(', ')
)

onMounted(async () => {
  try {
    const event = await getEvent(eventId)
    if (event.address) {
      state.value.street          = event.address.street ?? ''
      state.value.city            = event.address.city ?? ''
      state.value.zipCode         = event.address.zipcode ?? ''
      state.value.selectedCountry = event.address.countryCode ?? ''
    }
  } finally {
    pending.value = false
  }
})

async function save() {
  try { await (form.value as any)?.validate() } catch { return }
  const result = schema.safeParse(state.value)
  if (!result.success) return

  saving.value = true
  try {
    await updateEventAddress(eventId, {
      street:      state.value.street,
      city:        state.value.city,
      zipcode:     state.value.zipCode,
      countryCode: state.value.selectedCountry,
    })
    toast.add({ title: t('events.section.address_saved', 'Adresse enregistrée'), color: 'success' })
  } catch {
    toast.add({ title: t('common.error', 'Erreur'), color: 'error' })
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <div class="p-6 space-y-6">

    <div class="flex items-center justify-between">
      <h1 class="text-lg font-semibold text-highlighted">
        {{ t('events.dashboard.menu.localisation', 'Localisation') }}
      </h1>
      <UButton icon="i-lucide-save" size="sm" :loading="saving" @click="save">
        {{ t('common.save', 'Enregistrer') }}
      </UButton>
    </div>

    <template v-if="pending">
      <div class="flex justify-center py-20">
        <UIcon name="i-lucide-loader-2" class="size-8 animate-spin text-muted" />
      </div>
    </template>

    <UForm v-else ref="form" :schema="schema" :state="state" class="space-y-5">

      <UFormField :label="t('events.stepper.localisation.country_label', 'Pays')" name="selectedCountry" required>
        <USelectMenu
          v-model="state.selectedCountry"
          :items="countries"
          value-key="value"
          leading-icon="i-lucide-globe"
          size="lg" class="w-full"
        />
      </UFormField>

      <UFormField :label="t('events.stepper.localisation.street_label', 'Adresse')" name="street" required>
        <UInput v-model="state.street" leading-icon="i-lucide-map-pin" size="lg" class="w-full" />
      </UFormField>

      <UFormField :label="t('events.stepper.localisation.complement_label', 'Complément')" name="complement">
        <template #hint>
          <span class="text-xs text-muted">{{ t('events.stepper.localisation.complement_hint', 'Optionnel') }}</span>
        </template>
        <UInput v-model="state.complement" leading-icon="i-lucide-building-2" size="lg" class="w-full" />
      </UFormField>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-5">
        <UFormField :label="t('events.stepper.localisation.zip_label', 'Code postal')" name="zipCode" required class="sm:col-span-2">
          <UInput v-model="state.zipCode" leading-icon="i-lucide-hash" size="lg" class="w-full" />
        </UFormField>
        <UFormField :label="t('events.stepper.localisation.city_label', 'Ville')" name="city" required class="sm:col-span-3">
          <UInput v-model="state.city" leading-icon="i-lucide-landmark" size="lg" class="w-full" />
        </UFormField>
      </div>

      <Transition enter-active-class="transition duration-300 ease-out" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0">
        <div v-if="state.street" class="flex items-start gap-2.5 rounded-lg border border-primary/20 bg-primary/5 px-4 py-3">
          <UIcon name="i-lucide-map-pin-check" class="mt-0.5 size-4 shrink-0 text-primary" />
          <p class="text-sm text-muted">{{ formattedAddress }}</p>
        </div>
      </Transition>

    </UForm>
  </div>
</template>
