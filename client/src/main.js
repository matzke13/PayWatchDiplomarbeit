import { createApp } from 'vue';
import { Quasar, Notify } from 'quasar';
import { createPinia } from 'pinia';

import '@quasar/extras/roboto-font/roboto-font.css';
import '@quasar/extras/material-icons/material-icons.css';
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css';
import iconSet from 'quasar/icon-set/fontawesome-v6';

import 'quasar/src/css/index.sass';

import App from './App.vue';
import router from './router';

const app = createApp(App);

// initialise store
app.use(createPinia());
// initialise router after store to enable store based router guards
app.use(router);

app.use(Quasar, {
  plugins: { Notify },
  iconSet: iconSet,
});

app.mount('#app');
