<script setup lang="ts">
import { useRouter } from "vue-router"
import { onMounted, ref, computed } from "vue"
import eventStore from "@/stores/eventStore.ts"
import type { Event, Media } from "@/stores/eventStore.ts"
import {
  Button, Tag, Skeleton, InputText,
  IconField, InputIcon, Select, Card
} from "primevue"

const router = useRouter()
const eStore  = eventStore()

const events  = ref<Event[]>([])
const loading = ref(true)
const search  = ref("")
const statusFilter = ref<string>("all")

onMounted(() => {
  eStore.getEvents()
    .then(e => { events.value = e })
    .finally(() => { loading.value = false })
})

const statusOptions = [
  { label: "Tous les statuts", value: "all"       },
  { label: "Publié",           value: "PUBLISHED" },
  { label: "Brouillon",        value: "DRAFT"     },
  { label: "Annulé",           value: "CANCELLED" },
]

const statusConfig: Record<string, { label: string; severity: "success" | "warn" | "danger" | "secondary" }> = {
  PUBLISHED: { label: "Publié",    severity: "success" },
  DRAFT:     { label: "Brouillon", severity: "warn"    },
  CANCELLED: { label: "Annulé",    severity: "danger"  },
}

const filtered = computed(() => {
  let list = events.value
  if (search.value.trim())
    list = list.filter(e =>
      e.title?.toLowerCase().includes(search.value.toLowerCase()) ||
      e.address?.city?.toLowerCase().includes(search.value.toLowerCase())
    )
  if (statusFilter.value !== "all")
    list = list.filter(e => e.status === statusFilter.value)
  return list
})

const counts = computed(() => ({
  all:       events.value.length,
  PUBLISHED: events.value.filter(e => e.status === "PUBLISHED").length,
  DRAFT:     events.value.filter(e => e.status === "DRAFT").length,
  CANCELLED: events.value.filter(e => e.status === "CANCELLED").length,
}))

function getCover(medias: Media[]): string | null {
  if (!medias?.length) return null
  return (medias.find(m => m.isCover) ?? medias.find(m => m.mimeType.startsWith("image/")))?.url ?? null
}

function formatDate(d: Date | string | undefined) {
  if (!d) return "—"
  return new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit", month: "short", year: "numeric"
  })
}
</script>

<template>
  <div class="events-page">

    <!-- ── Page header — même style que le topbar ── -->
    <div class="page-header">
      <div class="page-header__left">
        <h1 class="page-header__title">Événements</h1>
        <p class="page-header__sub">Gérez et suivez tous vos événements</p>
      </div>
      <Button
        label="Créer un événement"
        icon="pi pi-plus"
        @click="router.push({ name: 'createevent' })"
      />
    </div>

    <!-- ── Stat pills — reprend la surface-0 + border du topbar ── -->
    <div class="stat-strip">
      <div class="stat-pill">
        <span class="stat-pill__value">{{ counts.all }}</span>
        <span class="stat-pill__label">Total</span>
      </div>
      <div class="stat-pill stat-pill--success">
        <span class="stat-pill__value">{{ counts.PUBLISHED }}</span>
        <span class="stat-pill__label">Publiés</span>
      </div>
      <div class="stat-pill stat-pill--warn">
        <span class="stat-pill__value">{{ counts.DRAFT }}</span>
        <span class="stat-pill__label">Brouillons</span>
      </div>
      <div class="stat-pill stat-pill--danger">
        <span class="stat-pill__value">{{ counts.CANCELLED }}</span>
        <span class="stat-pill__label">Annulés</span>
      </div>
    </div>

    <!-- ── Toolbar ── -->
    <div class="toolbar">
      <IconField class="toolbar__search">
        <InputIcon class="pi pi-search" />
        <InputText v-model="search" placeholder="Titre, ville…" fluid />
      </IconField>
      <Select
        v-model="statusFilter"
        :options="statusOptions"
        option-label="label"
        option-value="value"
        style="min-width: 190px"
      />
    </div>

    <!-- ── Skeletons ── -->
    <div v-if="loading" class="events-grid">
      <div v-for="n in 6" :key="n" class="event-card">
        <Skeleton height="148px" style="display:block; border-radius: 8px 8px 0 0; flex-shrink:0" />
        <div class="event-card__body">
          <Skeleton width="72px" height="22px" border-radius="6px" />
          <Skeleton width="88%" height="18px" />
          <Skeleton width="60%" height="14px" />
          <Skeleton width="50%" height="14px" />
        </div>
        <div class="event-card__footer">
          <Skeleton width="110px" height="32px" border-radius="6px" />
        </div>
      </div>
    </div>

    <!-- ── Grid ── -->
    <template v-else>
      <div v-if="filtered.length" class="events-grid">
        <div
          v-for="event in filtered"
          :key="event.id"
          class="event-card"
          @click="router.push({ name: 'events.show', params: { id: event.id } })"
        >
          <!-- Cover -->
          <div class="event-card__cover">
            <img
              v-if="getCover(event.medias)"
              :src="getCover(event.medias)!"
              :alt="event.title"
              class="event-card__cover-img"
            />
            <div v-else class="event-card__cover-placeholder">
              <i class="pi pi-calendar-plus" />
            </div>
            <div v-if="event.categories?.length" class="event-card__categories">
              <span
                v-for="cat in event.categories.slice(0, 2)"
                :key="cat.id"
                class="event-card__category"
              >{{ cat.name }}</span>
            </div>
          </div>

          <!-- Body -->
          <div class="event-card__body">
            <Tag
              :value="statusConfig[event.status]?.label ?? event.status"
              :severity="statusConfig[event.status]?.severity ?? 'secondary'"
            />
            <h3 class="event-card__title">{{ event.title }}</h3>
            <div class="event-card__meta">
              <span class="meta-row">
                <i class="pi pi-calendar" />
                {{ formatDate(event.startAt) }}
                <template v-if="event.endAt"> — {{ formatDate(event.endAt) }}</template>
              </span>
              <span v-if="event.address" class="meta-row">
                <i class="pi pi-map-marker" />
                {{ event.address.city }}, {{ event.address.countryCode }}
              </span>
            </div>
          </div>

          <!-- Footer -->
          <div class="event-card__footer">
            <Button
              label="Voir l'événement"
              icon="pi pi-arrow-right"
              icon-pos="right"
              size="small"
              text
              @click.stop="router.push({ name: 'events.show', params: { id: event.id } })"
            />
          </div>
        </div>
      </div>

      <!-- ── Empty state ── -->
      <div v-else class="empty-state">
        <div class="empty-state__icon-wrap">
          <i class="pi pi-calendar-times" />
        </div>
        <p class="empty-state__title">Aucun événement trouvé</p>
        <p class="empty-state__sub">
          {{ search ? `Aucun résultat pour « ${search} »` : "Créez votre premier événement." }}
        </p>
        <Button
          v-if="!search"
          label="Créer un événement"
          icon="pi pi-plus"
          outlined
          @click="router.push({ name: 'events.create' })"
        />
      </div>
    </template>

  </div>
</template>

<style scoped>
/* ── Page ── */
.events-page {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* ── Header — reprend exactement le style du topbar ── */
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
}
.page-header__title {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--p-surface-900);
  letter-spacing: -0.02em;
  margin: 0 0 0.15rem;
}
.page-header__sub {
  font-size: 0.82rem;
  color: var(--p-surface-400);
  margin: 0;
}

/* ── Stat strip — surface-0 + border-200 comme le topbar ── */
.stat-strip {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.stat-pill {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1rem;
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 8px;
  transition: border-color 0.15s;
}
.stat-pill:hover { border-color: var(--p-surface-300); }
.stat-pill__value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--p-surface-800);
  line-height: 1;
}
.stat-pill__label {
  font-size: 0.78rem;
  color: var(--p-surface-400);
}
.stat-pill--success .stat-pill__value { color: var(--p-green-600); }
.stat-pill--warn    .stat-pill__value { color: var(--p-amber-600); }
.stat-pill--danger  .stat-pill__value { color: var(--p-red-500);   }

/* ── Toolbar ── */
.toolbar {
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;
}
.toolbar__search {
  flex: 1;
  min-width: 200px;
  max-width: 340px;
}

/* ── Grid ── */
.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(268px, 1fr));
  gap: 1rem;
}

/* ── Card — surface-0 + border-200, même token que topbar ── */
.event-card {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
}
.event-card:hover {
  border-color: var(--p-primary-300);
  box-shadow: 0 8px 24px -6px color-mix(in srgb, var(--p-surface-900) 10%, transparent);
  transform: translateY(-2px);
}

/* Cover */
.event-card__cover {
  position: relative;
  height: 148px;
  background: linear-gradient(135deg, var(--p-primary-50), var(--p-primary-100));
  overflow: hidden;
  flex-shrink: 0;
}
.event-card__cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.25s ease;
}
.event-card:hover .event-card__cover-img {
  transform: scale(1.03);
}
.event-card__cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p-primary-200);
  font-size: 2rem;
}
.event-card__categories {
  position: absolute;
  bottom: 0.5rem;
  left: 0.5rem;
  display: flex;
  gap: 0.3rem;
}
.event-card__category {
  padding: 0.15rem 0.55rem;
  border-radius: 6px;
  font-size: 0.67rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  background: rgba(0, 0, 0, 0.42);
  color: #fff;
  backdrop-filter: blur(4px);
}

/* Body */
.event-card__body {
  padding: 0.9rem 1rem 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
}
.event-card__title {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--p-surface-900);
  letter-spacing: -0.015em;
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.event-card__meta {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  margin-top: 0.1rem;
}
.meta-row {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.78rem;
  color: var(--p-surface-500);
}
.meta-row .pi {
  font-size: 0.72rem;
  color: var(--p-surface-400);
  flex-shrink: 0;
}

/* Footer */
.event-card__footer {
  padding: 0.5rem 0.65rem 0.65rem;
  border-top: 1px solid var(--p-surface-100);
  margin-top: 0.5rem;
}

/* ── Empty state ── */
.empty-state {
  background: var(--p-surface-0);
  border: 1px solid var(--p-surface-200);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.65rem;
  padding: 3.5rem 1rem;
  text-align: center;
}
.empty-state__icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: var(--p-surface-100);
  border: 1px solid var(--p-surface-200);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--p-surface-400);
  font-size: 1.4rem;
}
.empty-state__title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--p-surface-700);
  margin: 0;
}
.empty-state__sub {
  font-size: 0.82rem;
  color: var(--p-surface-400);
  margin: 0;
}
</style>
