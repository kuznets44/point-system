<template>
  <v-app id="catalogs">
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
        nav
        dense
      >
        <v-list-item
          v-for="item in catalogs"
          :key="item.id"
          :to="`/catalogs/${item.code}`"
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
    </v-app-bar>

    <!-- empty state -->
    <v-container v-if="catalogSelected.id == undefined" :style="{marginTop:'10px'}">
      <v-row>
        <v-col
          v-for="item in catalogs"
          :key="item.id"
          cols="3"
        >
          <v-card :to="`/catalogs/${item.code}`"
                  :img="item.picture"
                  tile
                  height="200">
            <v-card-title style="background-color:rgba(255,255,255,0.4)">{{ item.name }}</v-card-title>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <Catalog v-if="catalogSelected.id !== undefined" :catalogId = "catalogSelected.id"></Catalog>

  </v-app>
</template>

<script>
  import Catalog from './Catalog.vue';

  export default {
    components: {
      Catalog
    },
    data: () => ({ 
      drawer: null,
    }),

    computed: {
      catalogs() {
        return this.$store.getters.CATALOGS;
      },
      catalogSelected() {
        if(this.$route.params.code !== undefined) {
          return this.catalogs.find( item => item.code == this.$route.params.code );
        } else {
          return {};
        }
      },
      getTitle() {
        let title = 'Выберите каталог';
        if(this.$route.params.code !== undefined) {
          let catalog = this.catalogs.find( item => item.code == this.$route.params.code );
          title = catalog.name;
        }

        return title;
      },
    },
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