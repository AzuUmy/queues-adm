<template>
        <section>
        <div class="creatUsserForms">
                <div class="componenetOn">
                    <div>
                        <h1>Cadastrar usuario</h1>
                    </div>
                    <div class="componeentCreat">
                        <p>Nome</p>
                        <input type="text" v-model="nome">
                        <p>Email</p>
                        <input type="text" v-model="email">
                        <p>Matricula</p>
                        <input type="text" v-model="matricula">
                        <p>Senha</p>
                        <input type="password" v-model="senha"> 
                    </div>
                   
                    <div>
                      <h1>Selecione o Guiche</h1>
                            <div class="guicheDropDown"> 
                                <input v-model="selectedContent" :style="{backgroundColor: backChange, color: colorchange}" type="text" @click="displayDropDown" readonly>
                                    <div class="dropDownContent" v-show="isOpen" id="dropDown">
                                        <p>Guiches disponiveis</p>
                                        <div v-for="(guiche, index) in guiches"  :key="index" >
                                           <div @click="selectGuiche(index)" class="guicheEle">
                                             <p>Guiche</p>
                                             <p  >{{ guiche.guiche }}</p>
                                           </div>
                                           <div>
                                                <hr>
                                           </div>
                                           
                                        </div>     
                                </div>
                                
                            </div>
                      </div>
                      <div>
                        <button class="textIn" @click="creatUser">Cadastrar Usuario</button>
                      </div>

                </div>
                
        </div>



        
    </section>
</template>

<script>
import axios from 'axios';
export default {
    data() {
        return{
            isOpen: false,
            guiches: [],
            selectedContent: "Guiche",
            nome: '',
            email: '',
            matricula: 0,
            senha: '',
            backChange: "",
            colorchange: ""
         }
    },


    methods: {
        displayDropDown(){
            this.isOpen = !this.isOpen;
            console.log(this.isOpen)
        },

         
        
           async getGuiches(){
            try {
                const response = await axios.get('http://localhost:8080/guiche');
                this.guiches = response.data.data;
            } catch (error) {
                console.error('Erro featching data', error.response);
            }
        },

        selectGuiche(index){
            this.selectedContent = this.guiches[index].guiche;
            this.isOpen = false;
            if(this.selectedContent != 'guiche'){
                this.backChange = "rgb(0, 162, 255)";
                this.colorchange = "white";
            }
        },
        
        async creatUser(){

            try {
                const  response = await axios.post('http://localhost:8080/newAccount', {
                    nome: this.nome,
                    email: this.email,
                    matricula: this.matricula,
                    senha: this.senha,
                    guiche: this.selectedContent
                });
                const router = this.$router;
                router.push('login/');
            } catch (error){
                console.log("Erro creating user");
            }
        }
     

    },

    mounted() {
        this.getGuiches();
    },


}

</script>