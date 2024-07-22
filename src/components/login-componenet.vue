<template>
    <section>
        <div class="loginContent">
            <div>
                <div>
                    <p>Email/Matricula</p>
                    <input v-model="email" type="email">
                    <p>Senha</p>
                    <input v-model="senha" type="password">
                </div>
                <div>
                    <div>

                        <button @click="loginIntoApp" :disabled="loading">

                            <template v-if="loading">
                                <div class="loadingComponent">
                                    <spiner  :loading="loading" />
                                </div>
                                     
                            </template>
                            <template v-else>
                                Entrar
                            </template>

                        </button>

                        <button class="buttonCreat" @click="selectOperation('/createAcc')">Cadastrar Usuario</button>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
import axios from 'axios';
import { setToken } from '../auth/authPass';
import { getToken } from '../auth/authPass';
import spiner from '../assets/animation/spinningWheel.vue';

export default {

    components:{
            spiner
        },

    data() {
        return {
            email: '',
            senha: '',
            users: [],
            loading: false,
        }
    },

    methods: {
        selectOperation(route) {
            const router = this.$router;
            router.push(route);
        },

        async loginIntoApp() {
            try {
                const response = await axios.get('http://localhost:8080/loginUser');
                this.users = response.data.us;
                let userFound = false;
                this.users.forEach(user => {
                        if (this.email === user.email && this.senha === user.senha) {
                            const userData = {
                                nome: user.nome,
                                guiche: user.guiche
                            };

                            setToken(userData);
                            userFound = true;

                            this.loading = true;
                            if(getToken()){
                                setTimeout(() => {
                                    this.setUserStatus(getToken().guiche, getToken().nome);
                                    const router = this.$router;
                                    router.push('/home');
                                }, 2000);
                            }
                        }
                    });

                    if(!userFound){
                        userFound = false
                    }
                

            } catch (err) {
                console.log("error", err);
            }
        },

        async setUserStatus(guiche, atendente){
                try {
                const response = await axios.post('http://localhost:8080/userStatus', {
                        guiche: guiche,
                        atendente: atendente,
                        status: 'Online' 
                    });
                    } catch (error){
                    console.error('Error writing data', error);
                    }
        }
    },
}
</script>