import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura'
import {Toast, ToastService} from "primevue";
import { Form } from '@primevue/forms';

import Tooltip from 'primevue/tooltip'

import './assets/styles.scss'
import {i18n} from "@/i18n";

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      darkModeSelector: '.app-dark',
      cssLayer: {
        name: 'primevue',
        order: 'tailwind-base, primevue, tailwind-utilities'
      }
    }
  }
});

app.use(ToastService)
app.use(i18n)

app.component('Form', Form);
app.component('Toast', Toast);
app.directive('tooltip', Tooltip)

app.mount('#app')
