import { createRouter, createWebHistory } from 'vue-router';
import LogIn from '../views/LogIn.vue';
import Dashboard from '../views/Dashboard.vue';
import Home from '../views/Home.vue';
import Administration from '../views/Administration.vue';
import Manager from '../views/Manager.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: LogIn,
    },
    {
      path: '/:pathMatch(.*)',
      name: 'notfound',
      component: () => import('../views/NotFoundView.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard,
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
    },
    {
      path: '/administration',
      name: 'administration',
      component: Administration,
    },
    {
      path: '/manager',
      name: 'manager',
      component: Manager,
    },
  ],
});

export default router;
