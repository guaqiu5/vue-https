import Vue from 'vue'
import VueRouter from 'vue-router'
import Client from '../views/Client.vue'
import Edge from '../views/Edge.vue'
Vue.use(VueRouter)

const routes = [{
    path: '/',
    name: 'Home',
    component: Edge,
}, {
    path: '/edge',
    name: 'Edge',
    component: Edge,
}]

const router = new VueRouter({
    mode: 'history',
    base: process.env.BASE_URL,
    routes
})

export default router