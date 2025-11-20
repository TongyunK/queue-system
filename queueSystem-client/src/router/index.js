import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    redirect: '/ticket'
  },
  {
    path: '/ticket',
    name: 'ticket',
    component: () => import('../views/ticket/TicketView.vue')
  },
  {
    path: '/display',
    name: 'display',
    component: () => import('../views/display/DisplayView.vue')
  },
  {
    path: '/counter',
    name: 'counter',
    component: () => import('../views/counter/CounterView.vue')
  },
  {
    path: '/admin',
    redirect: '/admin/login'
  },
  {
    path: '/admin/login',
    name: 'adminLogin',
    component: () => import('../views/admin/AdminLoginView.vue')
  },
  {
    path: '/admin/settings',
    name: 'adminSettings',
    component: () => import('../views/admin/AdminSettingsView.vue')
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
