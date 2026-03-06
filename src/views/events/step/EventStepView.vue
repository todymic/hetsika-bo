<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Stepper, StepList, Step, StepPanels, StepPanel,
  StepItem, Button
} from 'primevue'

import EventInfoStepView          from './EventInfoStepView.vue'
import EventLocalisationStepView  from './EventLocalisationStepView.vue'
import EventTicketStepView, { type TicketType } from './EventTicketStepView.vue'
import EventDateStepView          from './EventDateStepView.vue'
import {useI18n} from "vue-i18n";

const router = useRouter()
const { t } = useI18n()

// ── Breakpoint ──
const isMobile = ref(false)
const checkBreakpoint = () => { isMobile.value = window.innerWidth <= 768 }
onMounted(() => {
  checkBreakpoint()
  window.addEventListener('resize', checkBreakpoint)
})
onUnmounted(() => window.removeEventListener('resize', checkBreakpoint))

// ── Shared step state ──
const activeStep = ref('1')

// ── Step 1 ──
const title        = ref("")
const description  = ref("")
const categories   = ref<{ id: number; name: string }[]>([])
const coverPreview = ref<string | null>(null)
const categoryOptions = [
  { id: 1, name: "Musique" }, { id: 2, name: "Sport" },
  { id: 3, name: "Culture" }, { id: 4, name: "Technologie" },
  { id: 5, name: "Gastronomie" }, { id: 6, name: "Art" },
]

// ── Step 2 ──
const street      = ref("")
const city        = ref("")
const zipcode     = ref("")
const countryCode = ref("")
const countryOptions = [
  { label: "France",     value: "FR" },
  { label: "Luxembourg", value: "LU" },
  { label: "Belgique",   value: "BE" },
  { label: "Suisse",     value: "CH" },
  { label: "Madagascar", value: "MG" },
]

// ── Step 3 ──
const tickets = ref<TicketType[]>([])

// ── Step 4 ──
const startAt = ref<Date | null>(null)
const endAt   = ref<Date | null>(null)

// ── Submit ──
const submitting = ref(false)
const submit = () => {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    router.push({ name: 'events' })
  }, 1200)
}
</script>

<template>
  <div class="create-page">

    <!-- ── Header ── -->
    <div class="create-page__header">
      <Button icon="pi pi-arrow-left" text severity="secondary" size="small" @click="router.back()" />
      <div>
        <h1 class="create-page__title">{{ t('events.create.page_title') }}</h1>
        <p  class="create-page__sub">{{ t('events.create.page_subtitle') }}</p>
      </div>
    </div>

    <!-- ── Card ── -->
    <div class="create-card">

      <!-- ════════════════════════════════
           DESKTOP — Stepper horizontal
           ════════════════════════════════ -->
      <Stepper
        v-if="!isMobile"
        v-model:value="activeStep"
        linear
        class="stepper-horizontal"
      >
        <StepList>
          <Step value="1">{{ t('events.create.steps.informations') }}</Step>
          <Step value="2">{{ t('events.create.steps.localisation') }}</Step>
          <Step value="3">{{ t('events.create.steps.billets') }}</Step>
          <Step value="4">{{ t('events.create.steps.dates') }}</Step>
        </StepList>

        <StepPanels>

          <!-- STEP 1 -->
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-pen-to-square" /></div>
                <div>
                  <h2 class="panel__title">Informations générales</h2>
                  <p class="panel__sub">Titre, catégories et image de couverture</p>
                </div>
              </div>
              <EventInfoStepView
                v-model:title="title"
                v-model:description="description"
                v-model:categories="categories"
                v-model:cover-preview="coverPreview"
                :category-options="categoryOptions"
              />
            </div>
            <div class="panel__actions panel__actions--end">
              <Button
                :label="t('events.create.actions.next')" icon="pi pi-arrow-right" icon-pos="right"
                :disabled="!title.trim()"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>

          <!-- STEP 2 -->
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-map-marker" /></div>
                <div>
                  <h2 class="panel__title">Localisation</h2>
                  <p class="panel__sub">Adresse complète du lieu</p>
                </div>
              </div>
              <EventLocalisationStepView
                v-model:street="street"
                v-model:city="city"
                v-model:zipcode="zipcode"
                v-model:country-code="countryCode"
                :country-options="countryOptions"
              />
            </div>
            <div class="panel__actions">
              <Button :label="t('events.create.actions.back')" severity="secondary" icon="pi pi-arrow-left" outlined @click="activateCallback('1')" />
              <Button
                :label="t('events.create.actions.next')" icon="pi pi-arrow-right" icon-pos="right"
                :disabled="!street.trim() || !city.trim() || !zipcode.trim() || !countryCode"
                @click="activateCallback('3')"
              />
            </div>
          </StepPanel>

          <!-- STEP 3 -->
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-ticket" /></div>
                <div>
                  <h2 class="panel__title">Types de billets</h2>
                  <p class="panel__sub">Définissez les catégories de billets disponibles</p>
                </div>
              </div>
              <EventTicketStepView v-model:tickets="tickets" />
            </div>
            <div class="panel__actions">
              <Button :label="t('events.create.actions.back')" severity="secondary" icon="pi pi-arrow-left" outlined @click="activateCallback('2')" />
              <Button :label="t('events.create.actions.next')" icon="pi pi-arrow-right" icon-pos="right" @click="activateCallback('4')" />
            </div>
          </StepPanel>

          <!-- STEP 4 -->
          <StepPanel v-slot="{ activateCallback }" value="4">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-calendar" /></div>
                <div>
                  <h2 class="panel__title">Dates</h2>
                  <p class="panel__sub">Planifiez le début et la fin</p>
                </div>
              </div>
              <EventDateStepView
                v-model:start-at="startAt"
                v-model:end-at="endAt"
              />
            </div>
            <div class="panel__actions">
              <Button :label="t('events.create.actions.back')"
                      severity="secondary"
                      icon="pi pi-arrow-left"
                      outlined
                      @click="activateCallback('3')" />
              <Button
                label="Créer l'événement" icon="pi pi-check"
                :loading="submitting"
                :disabled="!startAt || (endAt !== null && endAt <= startAt!)"
                @click="submit"
              />
            </div>
          </StepPanel>

        </StepPanels>
      </Stepper>

      <!-- ════════════════════════════════
           MOBILE — Stepper vertical
           ════════════════════════════════ -->
      <Stepper
        v-else
        v-model:value="activeStep"
        linear
        class="stepper-vertical"
      >

        <!-- STEP 1 -->
        <StepItem value="1">
          <Step>Informations</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-pen-to-square" /></div>
                <div>
                  <h2 class="panel__title">{{ t('events.create.info.title') }}</h2>
                  <p  class="panel__sub">{{ t('events.create.info.subtitle') }}</p>
                </div>
              </div>
              <EventInfoStepView
                v-model:title="title"
                v-model:description="description"
                v-model:categories="categories"
                v-model:cover-preview="coverPreview"
                :category-options="categoryOptions"
              />
            </div>
            <div class="panel__actions panel__actions--end">
              <Button
                :label="t('events.create.actions.next')" icon="pi pi-arrow-right" icon-pos="right"
                :disabled="!title.trim()"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
        </StepItem>

        <!-- STEP 2 -->
        <StepItem value="2">
          <Step>Localisation</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-map-marker" /></div>
                <div>
                  <h2 class="panel__title">Localisation</h2>
                  <p class="panel__sub">Adresse complète du lieu</p>
                </div>
              </div>
              <EventLocalisationStepView
                v-model:street="street"
                v-model:city="city"
                v-model:zipcode="zipcode"
                v-model:country-code="countryCode"
                :country-options="countryOptions"
              />
            </div>
            <div class="panel__actions">
              <Button :label="t('events.create.actions.back')" severity="secondary" icon="pi pi-arrow-left" outlined @click="activateCallback('1')" />
              <Button
                :label="t('events.create.actions.next')" icon="pi pi-arrow-right" icon-pos="right"
                :disabled="!street.trim() || !city.trim() || !zipcode.trim() || !countryCode"
                @click="activateCallback('3')"
              />
            </div>
          </StepPanel>
        </StepItem>

        <!-- STEP 3 -->
        <StepItem value="3">
          <Step>Billets</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-ticket" /></div>
                <div>
                  <h2 class="panel__title">Types de billets</h2>
                  <p class="panel__sub">Types & tarifs disponibles</p>
                </div>
              </div>
              <EventTicketStepView v-model:tickets="tickets" />
            </div>
            <div class="panel__actions">
              <Button :label="t('events.create.actions.back')" severity="secondary" icon="pi pi-arrow-left" outlined @click="activateCallback('2')" />
              <Button :label="t('events.create.actions.next')" icon="pi pi-arrow-right" icon-pos="right" @click="activateCallback('4')" />
            </div>
          </StepPanel>
        </StepItem>

        <!-- STEP 4 -->
        <StepItem value="4">
          <Step>Dates</Step>
          <StepPanel v-slot="{ activateCallback }">
            <div class="panel">
              <div class="panel__head">
                <div class="panel__icon"><i class="pi pi-calendar" /></div>
                <div>
                  <h2 class="panel__title">Dates</h2>
                  <p class="panel__sub">Planifiez le début et la fin</p>
                </div>
              </div>
              <EventDateStepView
                v-model:start-at="startAt"
                v-model:end-at="endAt"
              />
            </div>
            <div class="panel__actions">
              <Button :label="t('events.create.actions.back')" severity="secondary" icon="pi pi-arrow-left" outlined @click="activateCallback('3')" />
              <Button
                label="Créer l'événement" icon="pi pi-check"
                :loading="submitting"
                :disabled="!startAt || (endAt !== null && endAt <= startAt!)"
                @click="submit"
              />
            </div>
          </StepPanel>
        </StepItem>

      </Stepper>

    </div>
  </div>
</template>

<style scoped>
/* ── Page ── */
.create-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.create-page__header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}
.create-page__title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--p-surface-900);
  letter-spacing: -0.02em;
  margin: 0 0 0.15rem;
}
.create-page__sub {
  font-size: 0.82rem;
  color: var(--p-surface-400);
  margin: 0;
}

/* ── Card ── */
.create-card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 12px;
  overflow: hidden;
}

/* ══════════════════════════
   HORIZONTAL (desktop)
   ══════════════════════════ */
.stepper-horizontal {
  width: 100%;
}

:deep(.stepper-horizontal .p-stepper-list) {
  padding: 1rem 2rem;
  border-bottom: 1px solid var(--p-surface-200);
}

:deep(.stepper-horizontal .p-stepper-panels) {
  padding: 0;
}

:deep(.stepper-horizontal .p-step-panel) {
  padding: 0;
}

/* ══════════════════════════
   VERTICAL (mobile)
   ══════════════════════════ */
.stepper-vertical {
  width: 100%;
  padding: 0.75rem 0.25rem;
}

:deep(.stepper-vertical .p-steppanel-content) {
  padding-left: 0.5rem;
}

/* ══════════════════════════
   PANEL — commun aux deux
   ══════════════════════════ */
.panel {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1.5rem 2rem 1rem;
  animation: panel-slide-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@media (max-width: 768px) {
  .panel {
    padding: 1rem 0.75rem 0.75rem;
  }
}

.panel__head {
  display: flex;
  align-items: center;
  gap: 0.9rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--p-surface-100);
  animation: fade-in 0.25s ease both;
}

.panel__icon {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: var(--p-primary-50);
  color: var(--p-primary-600);
  border: 1px solid color-mix(in srgb, var(--p-primary-200) 60%, transparent);
  display: flex; align-items: center; justify-content: center;
  font-size: 1rem; flex-shrink: 0;
}

.panel__title {
  font-size: 1rem; font-weight: 700;
  color: var(--p-surface-900); margin: 0 0 0.1rem;
}

.panel__sub {
  font-size: 0.78rem; color: var(--p-surface-400); margin: 0;
}

/* ── Actions ── */
.panel__actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 1.25rem 2rem 1.5rem;
  border-top: 1px solid var(--p-surface-100);
  animation: fade-up 0.3s 0.2s ease both;
}

.panel__actions--end {
  justify-content: flex-end;
}

@media (max-width: 768px) {
  .panel__actions {
    padding: 1rem 0.75rem 1rem;
    flex-wrap: wrap;
  }
  .panel__actions :deep(.p-button) {
    flex: 1;
    justify-content: center;
    min-width: 0;
  }
}

/* ══════════════════════════
   Animations
   ══════════════════════════ */
:deep(.p-steppanel-content) {
  animation: panel-slide-in 0.35s cubic-bezier(0.4, 0, 0.2, 1) both;
}

@keyframes panel-slide-in {
  from { opacity: 0; transform: translateY(-10px); }
  to   { opacity: 1; transform: translateY(0); }
}

:deep(.p-step-number) {
  transition: background 0.25s ease, border-color 0.25s ease,
  color 0.25s ease, transform 0.2s ease;
}
:deep(.p-step-active .p-step-number) {
  transform: scale(1.1);
}
:deep(.p-step-separator) {
  transition: background 0.4s ease;
}

@keyframes fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes fade-up {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
</style>
