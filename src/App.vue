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

      findUpdates: function( state,stateInitial ) {
        let result = [];
        let catalogs = this.$store.getters.CATALOGS;

        for ( let i in state ) {
          let factorsGroups = state[i].factorsGroups;
          let factorsGroupsInitial = stateInitial[i].factorsGroups;
          let catalog = catalogs.find( item => item.id == state[i].catalogId );

          if( factorsGroups.length !== factorsGroupsInitial.length ) {
            console.log(state[i].catalogId,'factor groups count changed');
            result.push({
              id: state[i].catalogId,
              name: catalog.name,
            });
          } else {
            for( let j = 0; j < factorsGroups.length; j++)  {
              if(     factorsGroups[j].id !== factorsGroupsInitial[j].id
                  ||  factorsGroups[j].name !== factorsGroupsInitial[j].name
                  ||  factorsGroups[j].weight !== factorsGroupsInitial[j].weight
              ) {
                console.log(state[i].catalogId,'factor group params changed');
                result.push({
                  id: state[i].catalogId,
                  name: catalog.name,
                });
              } else  {
                
                if( factorsGroups[j].factors.length !== factorsGroupsInitial[j].factors.length )  {
                  console.log(state[i].catalogId,'factors count changed');
                  result.push({
                    id: state[i].catalogId,
                    name: catalog.name,
                  });
                } else  {
                  let factors = factorsGroups[j].factors;
                  let factorsInitial = factorsGroupsInitial[j].factors;
                  for( let k = 0; k < factors.length; k++ ) {
                    if(     factors[k].id !== factorsInitial[k].id
                        ||  factors[k].name !== factorsInitial[k].name
                        ||  factors[k].weight !== factorsInitial[k].weight
                      ) {
                      console.log(state[i].catalogId,'factors params changed');
                      result.push({
                        id: state[i].catalogId,
                        name: catalog.name,
                      });
                    } else  {

                      if(  factors[k].values.length !== factorsInitial[k].values.length ) {
                        console.log(state[i].catalogId,'factor values count changed');
                        result.push({
                          id: state[i].catalogId,
                          name: catalog.name,
                        });
                      } else {
                        let values = factors[k].values;
                        let valuesInitial = factorsInitial[k].values;

                        for( let m = 0; m < values.length; m++  ) {
                          if(     values[m].id !== valuesInitial[m].id
                              ||  values[m].name !== valuesInitial[m].name
                              ||  values[m].weight !== valuesInitial[m].weight
                            ) {
                              console.log(state[i].catalogId,'factor value changed');
                              result.push({
                                id: state[i].catalogId,
                                name: catalog.name,
                              });
                          }
                        }

                      }

                    }
                  } 
                }
              }
            }
          }
        }

        return result;
      },

      save: async function() {
        this.showDialog = true;
        let factors = this.$store.getters.POINT_FACTORS;
        let factorsInitial = this.$store.getters.POINT_FACTORS_INITIAL;

        let catalogsToUpdate = this.findUpdates(factors,factorsInitial);
        console.log('catalogsToUpdate',catalogsToUpdate);
        
        if(catalogsToUpdate.length > 0) {

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

          
          for (let i = 0; i < catalogsToUpdate.length; i++) {
            let catalog = catalogsToUpdate[i];
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
          this.$store.commit('SET_POINT_FACTORS_INITIAL', JSON.parse(JSON.stringify(this.$store.getters.POINT_FACTORS)));
          setTimeout(() => {
            this.showDialog = false;
          }, 1000);
        } else {
          this.dialogMessage = `Показатели балльной системы не обновлялись`;
          setTimeout(() => {
            this.showDialog = false;
          }, 1000);
        }
      },
    }
  }
</script>

<style>
</style>