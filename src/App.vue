<template>
  <div>
    <div v-if="!dataLoaded" :style="{
      width: '100%',
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }">
      <v-progress-circular
        :size="100"
        color="blue"
        indeterminate
      ></v-progress-circular>
    </div>
    <v-app v-if="dataLoaded" id="inspire">

      <v-dialog
        v-model="showDialog"
        max-width="500px"
        persistent
      >
        <v-card>
          <v-card-title>
            Сохранение данных
          </v-card-title>
          <v-card-text>
            {{ dialogMessage }}
          </v-card-text>
        </v-card>

      </v-dialog>


        <v-tabs
          left
          icons-and-text
        >
          <v-tab to="/factors" ripple>
            Показатели
            <v-icon>mdi-poll</v-icon>
          </v-tab>

          <v-tab to="/catalogs" ripple>
            Каталоги
            <v-icon>mdi-cart-variant</v-icon>
          </v-tab>

          <v-tab @click="save" ripple>
            Сохранить
            <v-icon>mdi-content-save</v-icon>
          </v-tab>

          <v-tab @click="close" ripple>
            Выйти
            <v-icon>mdi-logout</v-icon>
          </v-tab>

        </v-tabs>


      <v-main>
        <router-view></router-view>
      </v-main>
    </v-app>

  </div>
</template>

<script>
  import axios from 'axios';

  export default {
    data: () => ({ 
      drawer: null,
      dialogMessage: '' ,
      showDialog: false,
      dataLoaded: false
    }),
    beforeCreate() {
      this.$store.dispatch('GET_POINT_SYSTEM_DATA')
        .then( () => this.dataLoaded = true);
    },
    methods: {
      close: function(){
        window.location = 'https://mebel.ru/bitrix/admin/';
      },
      save: async function() {
        this.showDialog = true;
      
        this.dialogMessage = `Обновляем параметры показателей балльной системы`;
        await axios.post(
          'https://mebel.ru/tools/api/point-system/factors/',
          'data=' + JSON.stringify(this.$store.getters.POINT_FACTORS),{
            withCredentials: false,
            headers: { 
              'Content-Type': 'application/x-www-form-urlencoded' 
            },
          }
        );

        //обновляем каталог
        this.showDialogSpinner = true;

        let catalogs = this.$store.getters.CATALOGS;
        console.log(catalogs);
        for (let i in catalogs) {
          let catalog = catalogs[i];
          this.dialogMessage = `Обновляем баллы товаров каталога "${catalog.name}"`;

          await axios.post(
            'https://mebel.ru/tools/api/point-system/products/',
            `action=update&iblock_id=${catalog.id}`,{
              withCredentials: false,
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              },
            }
          );
        }
            
        this.dialogMessage = 'Баллы товаров обновлены!';
        this.showDialogSpinner = false;
        setTimeout(() => {
          this.showDialog = false;
        }, 1000);

      },
    }
  }
</script>

<style>
</style>