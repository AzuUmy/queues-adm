<template>
    <section>
            <div class="init-component">
                <div>
                    <button v-if="loggedUser" @click="selectOperation('login', '/login')" >Login</button>
                </div>
            </div>

            <div>
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

                     <div class="comOnA">
                        <h1>Atendimento</h1>
                        <div>
                            <div class="onCallingComponenets">
                                    <div class="callComponenet">
                                        
                                    </div>
                                    <div class="buttonTets">
                                    <button>Encerrar</button>
                                    <button>Pausar</button>
                                </div>
                            </div>

                                <div class="elementOfOngoing" v-if="callingOn">
                                        <h1>Chamando</h1>
                                        <div class="callinCurrent">
                                                <div class="calling">
                                                    <div v-for="(called, index) in calledSenha" :key="index" class="calling-componenet">
                                                        <h2>Senha</h2>
                                                        <h1 class="NumberInSenha">{{ called.senha }}</h1>
                                                        <h2>tipo</h2>
                                                        <h1>{{ called.info }}</h1>
                                                    </div>
                                                </div>
                                                <div>
                                                    <div class="Timer" :style="{background: handleTimerdisplayInfo}">
                                                        <h1>{{ callingTimer }}</h1>
                                                        <button v-if="callNoAnswerd" @click="cancelCalling">Cancelar</button>
                                                    </div>
                                                </div>
                                        </div>   
                                </div>

                                <div>

                                    <h1>Senhas na fila</h1>
                                        <div class="overContet">
                                            <div v-for="(senha, index) in senhas" :key="index" class="queuesContent">
                                            <div class="queuesInLineContent">
                                                <h2>Senha</h2>
                                                <h1>{{ senha.senha }}</h1>
                                            </div>

                                            <div class="ButtonsInteraction">
                                                <button @click="callPass(index)">Chamar</button>
                                            </div>
                                                
                                            </div>
                                        </div>

                                </div>
                                
                            </div>
                        </div>

                </div>     
            </div>
    </section>

    <div class="queuesON">
           
           
        </div>
    

  
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
            noCallOngoing: true,
            calledSenha: [],
            callingTimer: 60,
            handleTimerdisplayInfo: '',
            callingOn: false,
            callNoAnswerd: false,
            defaultCallingTime: 60
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

                if(data.status === 'success' && data.type === 'Delete'){
                    const deletedSenha = data.data;
                    this.senhas = this.senhas.filter(senha => senha._id !== deletedSenha._id);
                } 

                if(data.status === 'success' && data.type === 'Call'){  
                    this.calledSenha.push(data.data);
                    this.getCalledSenha();
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

        callPass(index){
            let user = this.userInfo.nome;
            let guiche = this.userInfo.guiche;
            let senha = this.senhas[index].senha;
            let info = this.senhas[index].info;

            this.getCurrentCalling(user, guiche, senha, info);
                setTimeout(() => {
                    this.deleteCallingFromQueue(senha);
                    this.getCalledSenha();
                    this.setRunningCallingTime();
                },100);
        },

        async getQueuesON(){
             
             try {
                const response = await axios.get('http://localhost:8080/senhas');
                this.senhas = response.data.data;
            } catch (error) {
                console.error('Error fetching senhas:', error.response ? error.response.data : error.message);
            }
            
        },



        async getCurrentCalling(user, guiche, senha, info){
            try {
                const response = await axios.post('http://localhost:8080/calling',{
                    guiche: guiche,
                    senha: senha,
                    info: info,
                    atendente: user,
                });
                
            } catch (error) {
                console.log("Error calling");
            }
        },

        async deleteCallingFromQueue(senha){
            try {
                const response = await axios.delete(`http://localhost:8080/Pickedsenha/${senha}`);
                this.senhas = this.senhas.filter(item => item.senha !== senha);
            } catch(error) {
                console.log("error deleting content")
            }
        },

        async getCalledSenha(atendente, guiche ) {
            try{
                const response = await axios.get('http://localhost:8080/calling', {
                    params: {
                        atendente: atendente,
                        guiche: guiche
                    }
                });

                this.calledSenha = response.data.data;
                this.featchUserOnCalling();
            } catch (error) {
                console.log('error', error);
            }
        },

        async featchUserOnCalling(){
            let atendente = this.userInfo.nome;
            let guiche = this.userInfo.guiche;
            await this.getCalledSenha(atendente, guiche);
           
        },

        setRunningCallingTime(){
         this.handleCallingON();
            this.interval = setInterval(() => {
                if(this.callingTimer > 0){
                    this.callingTimer --;
                    this.handleTimerdisplayInfo = 'rgb(0, 119, 255)';

                    if(this.callingTimer < 30){
                       this.handleTimerdisplayInfo = 'orange';
                    } 
                    if( this.callingTimer < 15) {
                        this.handleTimerdisplayInfo = 'red';
                    }
                    
                    if(this.callingTimer <= 0){
                        this.callNoAnswerd = true;
                        this.beforeDestroy();
                    }
                }else{
                    clearInterval(this.interval);
                }    
            }, 1000); 
        },

        beforeDestroy() {
            clearInterval(this.interval);
        },

        handleCallingON(){
            if(this.calledSenha != null){
                this.callingOn = true;
            } else{
                this.callingOn = false
            }
        },

         cancelCalling(){
            let senha = this.calledSenha[0].senha;
            let guiche = this.userInfo.guiche;
            let atendente = this.userInfo.nome;
            this.cancelByInfo(senha, guiche, atendente);
        },

      async  cancelByInfo(senha, guiche, atendente){
                try {
                    const response = await axios.delete(`http://localhost:8080/deleteCall/${senha}/${guiche}/${atendente}`);
                    this.calledSenha.splice(0 , 1);
                    this.callingOn = false;
                    this.callNoAnswerd = false;
                    this.callingTimer = this.defaultCallingTime;
                } catch (error) {
                    console.error('error deleting senha', error);
                }
        }
    },

    

    mounted() {
       this.loadUserInfo();
       this.connectWebSocket();
       this.getQueuesON();
       this.featchUserOnCalling();
    }
}

</script>