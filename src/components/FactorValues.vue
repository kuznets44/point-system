<template>
  <v-list dense>
    <v-list-item  v-for="(value, i) in factorValues"
                  :key="i"
      >
      <v-list-item-content>
        <v-list-item-title v-text="`${value.name} (${value.cnt})`"></v-list-item-title>
        <v-text-field style="width:100px" v-model="value.weight" label="Вес, %"></v-text-field>
      </v-list-item-content>
    </v-list-item>
  </v-list>
</template>

<script>
  export default {
    data: () => ({ 
      opened: false
    }),
    props: ['factorValues']
  }
</script>

<style scoped>
  .v-list-item {
    display: inline-block;
    width: 15%;
  }
</style>