<template>
  <v-container>
    <v-row
      justify="end"
      >
        <v-col cols="2">
          <v-btn tile color="success" @click="addFactorsGroup">
            <v-icon left>mdi-plus</v-icon>
            Добавить
          </v-btn>
        </v-col>
    </v-row>

    <v-data-table
      :headers="headers"
      :items="items"
      :items-per-page="10"
      class="elevation-1"
    >
    
      <template v-slot:item.name="{ item }">
        <router-link :to="`/factors/${$route.params.code}/${item.id}`">{{ item.name }}</router-link>
      </template>  

      <template v-slot:item.delete="{ item }">
        <v-btn
          color="error"
          fab
          x-small
          @click="deleteFactorsGroup(item.id)"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </template>  
    </v-data-table>
  </v-container>
</template>

<script>
  export default {
    name: 'FactorsGroupsList',
    props: ['catalogId'],
    data: () => ({ 
      headers: [
        {
          text: 'Название',
          value: 'name'
        },
        {
          text: 'Вес',
          value: 'weight'
        },
        {
          text: 'Количество параметров',
          value: 'factorsAmount'
        },
        {
          text: '',
          value: 'delete'
        },
      ],
    }),
    computed: {
      items() {
        let items = [];
        let factorsGroupsByCatalog = this.$store.getters.POINT_FACTORS.find( element => element.catalogId == this.catalogId );

        if( factorsGroupsByCatalog !== undefined ) {
          let factorsGroups = factorsGroupsByCatalog.factorsGroups;
          console.log(factorsGroups);
          factorsGroups.forEach( (factorGroup) => {
            items.push({
              id: factorGroup.id,
              name: factorGroup.name,
              weight: factorGroup.weight,
              factorsAmount: factorGroup.factors.length,
              delete: false
            });
          });
        }

        return items;
      }
    },
    methods: {
      deleteFactorsGroup(id) {
        console.log(id);
        this.$store.commit('DELETE_POINT_FACTORS_GROUP',{
          catalogId: this.catalogId,
          id: id
        });
      },
      addFactorsGroup() {
        let newGroupId = this.makeGroupId();
        this.$store.commit('ADD_POINT_FACTORS_GROUP',{
          catalogId: this.catalogId,
          factorsGroup: {
            id: newGroupId,
            name: 'Новая группа показателей',
            weight: 0,
            factors: []
          }
        });
        this.$router.push(`/factors/${this.$route.params.code}/${newGroupId}`);
      },
      makeGroupId: function() {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for (var i = 0; i < 5; i++)	{
          text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
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
</style>