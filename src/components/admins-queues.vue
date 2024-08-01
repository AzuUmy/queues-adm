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
                   <div>
                       <div class="componenetInfo" :style="{width: commponenetTimerWidth + 'px'}">
                         <p>{{ Guiche }}</p>
                         <h2 v-if="calledInit === true">{{ userInfo.guiche }}</h2>
                          <div>
                                <template v-if="loading">
                                  <div class="loadingCounter">
                                    <div>
                                      <spiner  :style="{width: 70 + 'px', height: 70 + 'px',  borderWidth: '10px',  borderColor: '#00ff22', borderTopColor: '#ffffff'  }"  :loading="loading" />
                                    </div>
                                  </div>


                                </template>
                                <template v-else>
                                  <h2 v-if="initTimerForCall">{{ formattedTime }}</h2>
                                </template>
                          </div>
                       </div>

                       <div class="currenAtCall">
                         <p>Atendente:</p>
                         <h1>{{ userInfo.nome }}</h1>
                       </div>
                   </div>
                 </div>

                     <div class="comOnA">
                                  <h1>Atendimento</h1>
                       <div>
                                <div class="onCallingComponenets">
                                        <div class="callComponenet">
                                          <div class="onCallComponenet" v-for="(onGoing, index) in onCall" :key="index">
                                                  <h3>Senha</h3>
                                                  <h1>{{ onGoing.senha }}</h1>
                                                   <h3>Tipo</h3>
                                                   <h2>{{ onGoing.info }}</h2>
                                            </div>
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

                                                      <div class="callInteraction">
                                                        <button @click="intiCall" v-if="currentCallNotAnswerd" >Iniciar Atendimento</button>
                                                        <button v-if="callNoAnswerd" @click="cancelCalling">Cancelar</button>

                                                      </div>


                                                    </div>
                                                </div>
                                        </div>   
                                </div>

                                <div>
                                    <h1 class="TopeCDAS">Senhas na fila</h1>
                                        <div class="overContet">
                                            <div v-for="(senha, index) in senhas" :key="index" class="queuesContent">
                                            <div class="queuesInLineContent"  :style="{backgroundColor: senhaTypeInfo[senha._id], color: colorInType[senha._id]}">
                                                <h2>Senha</h2>
                                                <h1>{{ senha.senha }}</h1>
                                            </div>

                                            <div class="ButtonsInteraction">
                                                <button v-if="displayButom[index]" @click="callPass(index)">Chamar</button>
                                            </div>
                                                
                                            </div>
                                        </div>
                                </div>
                                
                            </div>
                        </div>

                </div>     
            </div>
    </section>

    <div class="queuesON"></div>
</template>


<script>
import {getToken} from '../auth/authPass';
import axios from 'axios';
import spiner from "../assets/animation/spinningWheel.vue";

export default {

  components: {
    spiner

  },

    data() {
        return{
            Guiche: 'Guiche',
            senhas: [],
            userInfo: {
                nome: '',
                guiche: ''
            },
            senhaTypeInfo: {},
            colorInType: {},
            loggedUser: true,
            noCallOngoing: true,
            calledSenha: [],
            callingTimer: 60, //keep as 60
            handleTimerdisplayInfo: '',
            callingOn: false,
            callNoAnswerd: false,
            defaultCallingTime: 60, // keep as 60
            displayButom: [false],
            time: '',
            currentCallNotAnswerd: true,
            initCurrentCalling: [],
            onCall: [],
            passedTime: 0,
            formattedTime: '00:00',
            initTimerForCall: false,
            calledInit: true,
            commponenetTimerWidth: 250,
            loading: false
        }
    },

    watch: {
       senhas: {
            immediate: true,
           handler(){
                this.getQueuesON();
            }
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

                if(data.status === 'success' && data.type === 'Preferencial'){
                    this.senhas.push(data.data);
                }

                if(data.status === 'success' && data.type === 'DeleteRegular'){
                    const deleteRegular = data.data;
                    console.log(deleteRegular);
                    this.senhas = this.senhas.filter(senha => senha._id !== deleteRegular._id);
                } 

                if(data.status === 'success' && data.type === 'DeletePref'){
                    const deletePref = data.data;
                    console.log(deletePref);
                    this.senhas = this.senhas.filter(senha => senha._id !== deletePref._id);
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
            this.updateTime();
            let calledTime = this.time;

            this.getCurrentCalling(user, guiche, senha, info, calledTime);
                setTimeout(() => {
                    this.deleteCallingFromQueue(senha, info);
                    this.initCurrentCalling = [guiche, user, senha, info];
                    this.getCalledSenha();
                    this.setRunningCallingTime();
                },100);
        },


        updateTime(){
            const now = new Date();
                this.time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        },



        async getQueuesON(){
             try {

                const [regularQueue, prefQueue] = await Promise.all([
                    axios.get('http://localhost:8080/prefe'),
                    axios.get('http://localhost:8080/senhas')

                ]);


                 const senhas  =  this.senhas = [...regularQueue.data.data, ...prefQueue.data.data];

                 /* tracking content inside senhas to check button display
                 * in this case button is displayed twice if there is preferencial senha one for the first preferencial
                 * and one for the first regular senha, this is done by passing the trackPrefSenha to the displayButton
                 * so the next element to display the button will be the first element outside the preference if
                 * both of them receives the trackButton as a parameter, this variable is an array started a position 0
                 * by passing this array into the displayButton I am updating the state (Boolean) to true for
                 * that specific position if it meets the requirements*/

                 const trackButton = [0]; // set the position of the array for [0]
                 let trackPrefSenha = 0; // tracks the position of the preferencial senha


                 senhas.forEach(senha => {
                      if(senha.info === 'Preferencial'){
                        trackPrefSenha++; // tracks how many senhas with tag info there is in the array increases the number of the variable for each

                          if(trackPrefSenha > 0){
                            this.displayButom = [trackButton]; // by passing the trackButton array it sets the display of position 0 to true
                          }

                          this.senhaTypeInfo[senha._id] = 'rgb(0, 119, 255)';
                          this.colorInType[senha._id] = 'White'

                      } else if(senha.info === 'Regular') { // checks if there is senhas with tag regular

                          if(trackPrefSenha > 0){
                            this.displayButom[trackPrefSenha] = [trackButton]; // set the displayButton to true for the position that are after the trackPrefSenha
                          }else{
                            this.displayButom = [trackButton]; // passes the trackButton position to displayButton so only the first element always contains a button
                          }

                      }
                      else{
                          this.senhaTypeInfo[senha._id] = '';
                          this.colorInType[senha._id] = '';
                      }
                 });

            } catch (error) {
                console.error('Error fetching senhas:', error.response ? error.response.data : error.message);
            }
        },



        async getCurrentCalling(user, guiche, senha, info, time){
            try {
                const response = await axios.post('http://localhost:8080/calling',{
                    guiche: guiche,
                    senha: senha,
                    info: info,
                    atendente: user,
                    callStart: time
                });
                
            } catch (error) {
                console.log("Error calling");
            }
        },

        async deleteCallingFromQueue(senha,info){
            try {

             if(info === 'Regular'){
                  const response = await axios.delete(`http://localhost:8080/Pickedsenha/${senha}`);
                } else if(info === 'Preferencial'){
                   const  response = await axios.delete(`http://localhost:8080/pickedPrefSenha/${senha}`);
                }                  


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
                await this.featchUserOnCalling();
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
                        this.currentCallNotAnswerd = false;
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
              this.currentCallNotAnswerd = true;
              this.handleTimerdisplayInfo = 'rgb(0, 119, 255)';
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
        },

        intiCall() {
                  let guiche = this.initCurrentCalling[0];
                  let atendente = this.initCurrentCalling[1];
                  let senha = this.initCurrentCalling[2];
                  let info = this.initCurrentCalling[3];
                  this.updateTime();
                  let calledTime = this.time;

                  this.initOnGoingCall(guiche, senha, info, atendente, calledTime);
                  setTimeout(() => {
                        this.cancelByInfo(senha, guiche, atendente);
                        this.getCurrentCall(atendente, senha, guiche);
                        this.initTimerForCall = false;
                        this.calledInit = true;
                  }, 100)


                  this.currentCallNotAnswerd = true;
                  this.callingTimer = this.defaultCallingTime;
                  this.beforeDestroy();
        },


      async initOnGoingCall(guiche, senha, info, atendente, callStart){
          try {
            const response = await axios.post('http://localhost:8080/initCall', {
              guiche: guiche,
              senha: senha,
              info: info,
              atendente: atendente,
              callStart: callStart
            });
          } catch (err) {
            console.error(err);
          }
      },

      async getCurrentCall(atendente, senha, guiche){
          console.log("teste", atendente, senha, guiche);
          try {
            const response = await axios.get('http://localhost:8080/ongoingCall', {
                params: {
                  atendente: atendente,
                  senha: senha,
                  guiche: guiche
                }
            });
            this.calledInit = false;
            if(this.calledInit === false){
              this.commponenetTimerWidth = 600;
              this.Guiche = 'Tempo'
            }
            this.startCountingOnGoingCall();
            this.onCall = Array.isArray(response.data.data) ? response.data.data : [response.data.data];
          } catch (error){
              console.log("Error fetching data");
          }
      },

      startCountingOnGoingCall(){
             this.loading = true;
          this.interval = setInterval(() => {
              this.loading = false;
              this.passedTime++;
              this.updateFormattedTime();
              this.initTimerForCall = true;

          }, 1000);
      },

      updateFormattedTime() {
        const minutes = Math.floor(this.passedTime / 60);
        const seconds = this.passedTime % 60;

        // Format minutes and seconds to be always two digits
        this.formattedTime = `${this.padZero(minutes)}:${this.padZero(seconds)}`;
      },

      padZero(number) {
        return number.toString().padStart(2, '0');
      },

    },

    mounted() {
       this.loadUserInfo();
       this.connectWebSocket();
       this.getQueuesON();
       this.featchUserOnCalling();
    }
}

</script>