<template>
    <section>
        <div class="init-component">
            <div>
                <button v-if="loggedUser" @click="selectOperation('login', '/login')" >Login</button>
            </div>
        </div>

        <div class="userInfo">
            <div>

                <div class="componenetInfo">
                     <p>Guiche</p>
                    <h2>{{ userInfo.guiche }}</h2>
                </div>
               
                <div class="currenAtCall">
                    <p>Atendente:</p>
                    <h1>{{ userInfo.nome }}</h1>
                 </div>


            </div>

            <div class="call-componenet">
                <div>
                    <h1>Atendimento</h1>
                    <div class="CallComE">
                            <div class="callCo">
                                <div>
                                    <p>calling</p>
                                </div>
                            </div> 
                            <div v-if="noCallOngoing" class="ActionButton">
                                    <button class="Button1">Encerrar Antedimento</button>
                                    <button class="Button2">Pausar Atendimento</button>
                            </div>
                    </div>
                </div>
            </div>
         
        </div>
        
    
    
        <div class="CompoenentQueuesLine">
            <h1>Senhas na Fila</h1>
            <div class="queuesLine">
                <div v-for="(senha, index) in senhas" :key="index" class="QueuesElement">
                    <div class="QueEdcd">
                        <div class="queueNumber">
                            <p class="topIndiPref">Senha</p>
                            <h2>{{ senha.senha }}</h2>   
                        </div>
                         <div>
                              <button @click="callpass(index)" class="callAction">Chamar</button>
                         </div>
                    </div>
                       
                </div>

            </div>
        </div>
    </section>

</template>


<script>
import {getToken} from '../auth/authPass';
import axios from 'axios';
export default {
    data() {
        return{
            senhas: [],
            userInfo: {
                nome: '',
                guiche: ''
            },
            loggedUser: true,
            noCallOngoing: true
        }
    },


    methods: {

        connectWebSocket() {
            const ws = new WebSocket('ws://localhost:8080');
            ws.onopen = () => {
                console.log('WebSocket connected');
            };
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.status === 'success' && data.type === 'Regular') {
                    this.senhas.push(data.data);
                }
            };
            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
            };
            ws.onclose = () => {
                console.log('WebSocket closed');
            };
        },


        selectOperation(route){
            const router = this.$router;
            router.push(route);
        },

        loadUserInfo(){
           const userData = getToken();
           if(userData) {
            this.loggedUser = false
            this.userInfo = userData;
           }else{
            console.log("No user data found");
           }
        },

        async getQueuesON(){
             
             try {
                const response = await axios.get('http://localhost:8080/senhas');
                this.senhas = response.data.data;
            } catch (error) {
                console.error('Error fetching senhas:', error.response ? error.response.data : error.message);
            }
            
        },

        callpass(index){
           // console.log("called", index);
        }

        

    },

    mounted() {
       this.loadUserInfo();
       this.connectWebSocket();
       this.getQueuesON();
    },
}

</script>