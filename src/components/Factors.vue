<template>
  <v-app id="factors">
    <v-navigation-drawer
      :style="{'top':'80px','height': 'calc(100vh - 80px)'}"
      v-model="drawer"
      app
    >
    <v-list>
      <v-list-item>
        <v-list-item-content>
          <v-list-item-title class="title">
            Каталоги
          </v-list-item-title>
        </v-list-item-content>
      </v-list-item>
    </v-list>
      
      <v-divider></v-divider>

      <v-list
        dense
        nav
      >
        <v-list-item
          v-for="item in catalogs"
          :key="item.id"
          :to="`/factors/${item.code}`"
        >
          <v-list-item-icon>
            <v-icon>mdi-cog</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.name }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar app :style="{'top':'80px'}" color="blue">
      <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>

      <v-toolbar-title color="white">{{ getTitle }}</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn icon v-if="catalogSelected.id !== undefined && factorsGroupSelected !== undefined" title="Вернуться" @click="returnToList">
        <v-icon>mdi-undo</v-icon>
      </v-btn>
    </v-app-bar>

    <!-- empty state -->
    
    <v-container v-if="catalogSelected.id == undefined">
      <v-row>
        <v-col
          v-for="item in catalogs"
          :key="item.id"
          cols="3"
        >
          <v-card :to="`/factors/${item.code}`" :style="{height:'300px'}" :img="item.picture" tile>
            <v-card-title style="background-color:rgba(255,255,255,0.4)">{{ item.name }}</v-card-title>
            <v-card-actions style="width:100%;position:absolute;bottom:0;background-color:rgba(255,255,255,0.8)">
              <v-list dense style="background-color:transparent;width:100%">
                <v-list-item  v-for="(group,index) in getFactorsGroups(item.id)" style="display:flex"
                              :key="index"
                              >
                  <router-link :to="`/factors/${item.code}/${group.id}/`">{{ group.name }}</router-link>
                  <v-spacer></v-spacer>
                   {{ group.weight }}%
                </v-list-item>
              </v-list>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <FactorsGroupsList v-if="catalogSelected.id !== undefined && factorsGroupSelected == undefined" :catalogId = "catalogSelected.id"></FactorsGroupsList>
    <FactorsGroup v-if="catalogSelected.id !== undefined && factorsGroupSelected !== undefined"
                  :catalogId="catalogSelected.id"
                  :factorsGroup = "factorsGroupSelected"></FactorsGroup>

  </v-app>
</template>

<script>
  import FactorsGroupsList from './FactorsGroupsList.vue';
  import FactorsGroup from './FactorsGroup.vue';

  export default {
    components: {
      FactorsGroupsList,
      FactorsGroup
    },
    data: () => ({ 
      drawer: null,
      //catalogs: [],
    }),
/*
    beforeMount() {
      this.catalogs = this.$store.getters.CATALOGS;
      this.pointFactors = this.$store.getters.POINT_FACTORS;
    },
    */
    computed: {
      catalogs() {
        return this.$store.getters.CATALOGS;
      },
      pointFactors() {
        return this.$store.getters.POINT_FACTORS;
      },
      catalogSelected() {
        if(this.$route.params.code !== undefined) {
          return this.catalogs.find( item => item.code == this.$route.params.code );
        } else {
          return {};
        }
      },
      factorsGroupSelected() {
        if(this.$route.params.id !== undefined) {
          let pointFactorsByCatalog = this.$store.getters.POINT_FACTORS.find( element => element.catalogId == this.catalogSelected.id);
          console.log(pointFactorsByCatalog);
          if(pointFactorsByCatalog !== undefined) {
            return pointFactorsByCatalog.factorsGroups.find( element => element.id == this.$route.params.id);
          }
        } 
        return undefined;
      },
      getTitle() {
        let title = 'Показатели балльной системы';
        if(this.$route.params.code !== undefined) {
          let catalog = this.catalogs.find( item => item.code == this.$route.params.code );
          title += `: ${catalog.name}`;
        }

        return title;
      },
    },
    methods: {
      returnToList() {
        this.$router.push(`/factors/${this.$route.params.code}/`);
      },
      getFactorsGroups(catalogId) {
        let factorsByCatalog = this.pointFactors.find( item => item.catalogId == catalogId);
        if(factorsByCatalog !== undefined) {
          return factorsByCatalog.factorsGroups;
        } else {
          return [];
        }
      }
    }
  }
</script>

<style>
.v-application--wrap {
  min-height: calc(100vh - 136px);
}
.container {
  margin-top: 10px;
  height: calc(100vh - 164px);
    overflow: auto;
}
</style>