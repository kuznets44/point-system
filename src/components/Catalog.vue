<template>
  <v-container>
    
    <v-data-table
      :headers="headers"
      :items="catalogDataProcessed"
      :items-per-page="15"
      class="elevation-1"
      dense
      sort-by="points"
      sort-desc
    >

    </v-data-table>
  </v-container>
</template>

<script>
  //import axios from 'axios';
  const loadCatalog = async function() {
    this.catalogData = [];
    if(this.$store.getters.CATALOG_DATA[this.catalogId] == undefined) {
      this.$store.dispatch('GET_CATALOG_DATA',{catalogId: this.catalogId})
        .then(() => this.catalogData = this.$store.getters.CATALOG_DATA[this.catalogId]);
    } else {
      this.catalogData = this.$store.getters.CATALOG_DATA[this.catalogId];
    }
  };

  export default {
    name: 'Catalog',
    props: ['catalogId'],
    data: () => ({ catalogData: [] }),
    beforeMount: loadCatalog,
    beforeUpdate: loadCatalog,
    computed: {
      catalogDataProcessed() {
        let result = [];
        this.catalogData.forEach( ( product ) => {
          let pointsTotal = 0;
          let pointsByGroups = {};
          if(this.pointFactors.factorsGroups !== undefined) {
            this.pointFactors.factorsGroups.forEach( ( group ) => {

            pointsByGroups[group.id] = {
              id: group.id,
              name: group.name,
              weight: group.weight,
              groupPoints: 0,
              pointsByFactors: {}
            };

            if(group.weight > 0) {
              group.factors.forEach( ( factor ) => {
                if(factor.weight > 0) {
                  let propId = factor.id;

                  let productValue = product.propValues[propId];
                  console.log(productValue);

                  if(! (productValue instanceof Array) ) {
                    productValue = [productValue];
                  }

                  let pointsFromFactor = 0;
                  productValue.forEach( (productValueItem) => {
                    let factorValue = factor.values.find( value => value.id == productValueItem);

                    if( factorValue !== undefined ) {
                      let factorValueWeight = factorValue.weight;

                      if( factorValueWeight > 0 ) {
                        pointsFromFactor = Math.max( pointsFromFactor, group.weight * factorValueWeight / 100);
                      }
                    }
                  });

                  //добавляем расшифровку по факторам
                  pointsByGroups[group.id].pointsByFactors[factor.id] = {
                    id: factor.id,
                    name: factor.name,
                    weight: factor.weight,
                    points: pointsFromFactor
                  };
                  //прибавляем балл в группу
                  pointsByGroups[group.id].groupPoints += pointsFromFactor;
                  pointsTotal += pointsFromFactor;
                }
              });
            }
            });
          }
          result.push({
            id: product.id,
            name: product.name,
            sellerName: product.sellerName,
            manufacturerName: product.manufacturerName,
            price: product.price,
            points: pointsTotal,
            pointsByGroups: pointsByGroups
          });
        });
        return result;
      },
      pointFactors() {
        return this.$store.getters.POINT_FACTORS.find( element => element.catalogId == this.catalogId );
      },
      headers() {
        let result = [
          {
            text: 'Название',
            value: 'name'
          },
          {
            text: 'Производитель',
            value: 'manufacturerName'
          },
          {
            text: 'Продавец',
            value: 'sellerName'
          },
          {
            text: 'Цена',
            value: 'price'
          },
          {
            text: 'Баллов',
            value: 'points'
          },
        ];

        let pointFactorsByCatalog = this.$store.getters.POINT_FACTORS.find( element => element.catalogId == this.catalogId );
        if(pointFactorsByCatalog !== undefined) {
          let factorsGroups = pointFactorsByCatalog.factorsGroups;

          factorsGroups.forEach( group => result.push({
            text: group.name,
            value: `pointsByGroups[${group.id}].groupPoints`
          }));
        }
        return result;
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
}
</style>