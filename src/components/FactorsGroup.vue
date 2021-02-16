<template>
  <v-container>


    <v-dialog
        v-model="showDialog"
        max-width="500px"
      >
        <v-card>
          <v-card-title>
            {{ getDialogTitle }}
          </v-card-title>
          <v-card-text>
            <v-select
              :items="propsFlattened"
              v-model="factorSelected"
              item-text="name"
              item-value="id"
              @change="onPropSelect"
            ></v-select>
          </v-card-text>
        </v-card>
      </v-dialog>


    <v-form ref="form">
      <v-row justify="space-between">
        <v-col cols="12" md="4">
          <v-text-field
            v-model="factorsGroup.name"
            label="Название группы параметров"
          ></v-text-field>
        </v-col>
        <v-col cols="12" md="6">
          <v-text-field
            v-model="factorsGroup.weight"
            label="Вес, %"
          ></v-text-field>
        </v-col>
      </v-row>

      <div class="text-h6" :style="{'margin-bottom': '20px'}"><b>Параметры</b></div>

      <v-row>
        <v-col  cols="12"
                v-for="(item,index) in factorsGroup.factors"
                :key="index">
          <v-card elevation="1" outlined tile>
            <v-card-title class="headline">
              {{ item.name }}
              <v-btn icon @click="editFactor(index)">
                  <v-icon>mdi-pencil</v-icon>
              </v-btn>

              <v-spacer></v-spacer>

              <v-text-field v-model="item.weight" label="Вес, %"></v-text-field>

              <v-spacer></v-spacer>

              <v-card-actions>
                <!--
                <v-btn icon>
                  <v-icon>mdi-arrow-up</v-icon>
                </v-btn>

                <v-btn icon>
                  <v-icon>mdi-arrow-down</v-icon>
                </v-btn>
                -->
                <v-btn icon @click="deleteFactor(index)">
                  <v-icon>mdi-delete</v-icon>
                </v-btn>
              </v-card-actions>
            </v-card-title>

            <v-card-text>
              <FactorValues :factorValues="item.values"></FactorValues>
            </v-card-text>

          </v-card>
        </v-col>
      </v-row>
      <v-btn tile color="success" :style="{marginTop:'20px', marginBottom: '20px'}" @click="addFactor">
          <v-icon left>mdi-plus</v-icon>
          Добавить
      </v-btn>
    </v-form>
  </v-container>
</template>

<script>
  import FactorValues from './FactorValues.vue';

  export default {
    name: 'FactorsGroup',
    props: ['factorsGroup','catalogId'],
    components: {
      FactorValues
    },
    data: () => ({
      showDialog: false,
      factorSelected: undefined,
      factorSelectedIndex: undefined
    }),
    computed: {
      getDialogTitle() {
        return this.factorSelected !== undefined ? 'Редактировать показатель' : 'Новый показатель'
      },
      propsFlattened() {
        let catalog = this.$store.getters.CATALOGS.find( element => element.id == this.catalogId);
        let result = [];
        if(catalog.props !== undefined) {
          for(let groupCode in catalog.props) {
            let group = catalog.props[groupCode];
            group.children.forEach(prop => result.push({
              id: prop.id,
              isGroup: false,
              name: prop.name,
              values: prop.values
            }));
          }
        }

        return result;
      }
    },
    methods: {
      addFactor() {
        this.factorSelected = undefined;
        this.showDialog = true;
      },
      editFactor(index) {
        this.factorSelectedIndex = index;
        this.factorSelected = this.factorsGroup.factors[index].id;
        this.showDialog = true;
      },
      deleteFactor(index) {
        this.$store.commit('DELETE_POINT_FACTOR',{
            catalogId: this.catalogId,
            factorsGroup: this.factorsGroup,
            index: index,
          });
      },
      closeDialog() {
        this.factorSelected = undefined;
        this.factorSelectedIndex = undefined;
        this.showDialog = false;
      },
      onPropSelect() {
        let values = [];
        let factorSelected = this.propsFlattened.find( element => element.id == this.factorSelected);
        
        factorSelected.values.forEach( ( value ) => {
          console.log(parseInt(value.cnt));
          values.push({
            id: value.id,
            name: value.name,
            weight: 0,
            cnt: value.cnt != null ? value.cnt : 0
          });
        });

        if(this.factorSelectedIndex !== undefined) {
          //обновляем 
          this.$store.commit('UPDATE_POINT_FACTOR',{
            catalogId: this.catalogId,
            factorsGroup: this.factorsGroup,
            index: this.factorSelectedIndex,
            pointFactor: {
              id: factorSelected.id,
              name: factorSelected.name,
              values: values
            }
          });
        } else {
          //добавляем
          this.$store.commit('ADD_POINT_FACTOR',{
            catalogId: this.catalogId,
            factorsGroup: this.factorsGroup,
            pointFactor: {
              id: factorSelected.id,
              name: factorSelected.name,
              values: values
            }
          });
        }

        this.factorSelected = undefined;
        this.factorSelectedIndex = undefined;
        this.showDialog = false;
      }
    }
  }
</script>

<style scoped>
  .v-application--wrap {
    min-height: calc(100vh - 136px);
  }
  .container {
    margin-top: 25px;
    height: calc(100vh - 164px);
    overflow: auto;
  }
  .v-card {
    margin-bottom:20px;
  }
</style>
