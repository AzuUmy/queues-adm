import { createRouter, createWebHistory } from "vue-router";
import { getToken } from '../auth/authPass'
const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/home',
            name: 'home',
            component: () => import('../views/homeViewUnloag.vue'),
            meta: { requiresAuth: true }
        },
        {
            path: '/createAcc',
            name: 'createAcc',
            component: () => import('../views/creatAccView.vue'),
          
        },
        {
            path: '/login',
            name: 'login',

            component: () => import('../views/loginView.vue'),
           
        }
    ],
});

router.beforeEach(async (to, from, next) => {
    const token = getToken();
    if(to.name === 'login'){
            if(token){
                next({ path: '/home' });
        }else{
            next();
        }
       
    } else if (to.matched.some(record => record.meta.requiresAuth)) {
        if (!token) {
            next({
                path: '/login',
                query: { redirect: to.fullPath }
            });
        } else {
            next();
        }
    } else {
        next();
    }
});

export default router;