import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';

Vue.use(Vuex);

export const store = new Vuex.Store({
  state: {
    catalogs: [],
    catalogData: {},
    sellers: [],
    manufacturers: [],
    pointFactors: [],
    pointFactorsInitial: []
  },
  mutations: {
    SET_POINT_FACTORS: (state, payload) => {
      state.pointFactors = payload;
    },
    SET_POINT_FACTORS_INITIAL: (state, payload) => {
      state.pointFactorsInitial = payload;
    },
    SET_CATALOGS: (state, payload) => {
      state.catalogs = payload;
    },
    SET_CATALOG_DATA: (state, payload) => {
       state.catalogData[payload.catalogId] = payload.catalogData;
    },
    DELETE_POINT_FACTORS_GROUP: (state, payload) => {
      let pointFactorsByCatalog = state.pointFactors.find( item => item.catalogId == payload.catalogId);
      let pointFactorsFiltered = pointFactorsByCatalog.factorsGroups.filter( item => item.id !== payload.id);
      pointFactorsByCatalog.factorsGroups = pointFactorsFiltered;
      //state.pointFactors = 
    },
    ADD_POINT_FACTORS_GROUP: (state, payload) => {
      let pointFactorsByCatalog = state.pointFactors.find( item => item.catalogId == payload.catalogId);
      pointFactorsByCatalog.factorsGroups.push(payload.factorsGroup);
      //state.pointFactors = 
    },
    UPDATE_POINT_FACTOR: (state, payload) => {
      let pointFactorsByCatalog = state.pointFactors.find( item => item.catalogId == payload.catalogId);
      let pointFactorsGroup = pointFactorsByCatalog.factorsGroups.find( item => item.id == payload.factorsGroup.id);
      pointFactorsGroup.factors[payload.index] = payload.pointFactor;
    },
    DELETE_POINT_FACTOR: (state, payload) => {
      let pointFactorsByCatalog = state.pointFactors.find( item => item.catalogId == payload.catalogId);
      let pointFactorsGroup = pointFactorsByCatalog.factorsGroups.find( item => item.id == payload.factorsGroup.id);
      pointFactorsGroup.factors.splice(payload.index,1);
    },
    ADD_POINT_FACTOR: (state, payload) => {
      let pointFactorsByCatalog = state.pointFactors.find( item => item.catalogId == payload.catalogId);
      let pointFactorsGroup = pointFactorsByCatalog.factorsGroups.find( item => item.id == payload.factorsGroup.id);
      pointFactorsGroup.factors.push(payload.pointFactor);
    }

  },
  getters: {
    CATALOGS: state => {
      return state.catalogs;
    },
    POINT_FACTORS: state => {
      return state.pointFactors;
    },
    POINT_FACTORS_INITIAL: state => {
      return state.pointFactorsInitial;
    },
    CATALOG_DATA: state => {
      return state.catalogData;
    }
  },
  actions: {
    GET_POINT_SYSTEM_DATA: async ( context ) => {
      let [factors, catalogs] = await Promise.all([
        axios.get('https://mebel.ru/tools/api/point-system/factors/'),
        axios.get('https://mebel.ru/tools/api/point-system/catalogs/')
      ]);

      let catalogsData = [];
      catalogs.data.forEach( ( catalog ) => {
        let propsFlattened = [];
        for (let propGroupCode in catalog.props) {
          let propsGroup = catalog.props[propGroupCode];
          propsGroup.children.forEach( prop => propsFlattened.push(prop) );
        }
        catalog.propsFlattened = propsFlattened;
        catalogsData.push(catalog);
      });
      context.commit('SET_CATALOGS', catalogsData);

      let pointFactors = [];
      factors.data.forEach((item) => {
        const propsOfCatalog = context.state.catalogs.find( (element) => element.id == item.catalogId ).propsFlattened;

        let factorsGroups = [];

        for( let i in item.factorsGroups ) {
          let factorsGroup = item.factorsGroups[i];

          let factors = [];
          factorsGroup.factors.forEach( (factor) => {
            //we need to specify all of the values of the corresponding props of catalog
            let propValues = propsOfCatalog.find( prop => prop.id == factor.id ).values;
            propValues.forEach (propValue => {
              let factorValue = factor.values.find( value => value.id == propValue.id);
              if( factorValue && factorValue.weight > 0 ) {
                propValue.weight = factorValue.weight;
              }
            });

            factors.push({
              id: factor.id,
              name: factor.name,
              weight: factor.weight,
              values: propValues
            });
          });
          
          factorsGroups.push({
            id: factorsGroup.id,
            name: factorsGroup.name,
            weight: factorsGroup.weight,
            factors: factors
          });
        }

        pointFactors.push({
          catalogId: item.catalogId,
          factorsGroups: factorsGroups          
        });
      });
      context.commit('SET_POINT_FACTORS', pointFactors);      
      context.commit('SET_POINT_FACTORS_INITIAL', JSON.parse(JSON.stringify(pointFactors)));      
    },
    /*
    GET_POINT_FACTORS: async (context) => {
      let {data} = await axios.get('https://mebel.ru/tools/api/point-system/factors/');
      let pointFactors = [];
      
      data.forEach((item) => {

        let factorsGroups = [];
        for(let i in item.factorsGroups) {
          let factorsGroup = item.factorsGroups[i];

          let factors = [];
          factorsGroup.factors.forEach( (factor) => {
            factors.push({
              id: factor.id,
              name: factor.name,
              weight: factor.weight,
              values: factor.values
            });
          });
          
          factorsGroups.push({
            id: factorsGroup.id,
            name: factorsGroup.name,
            weight: factorsGroup.weight,
            factors: factors
          });
        }

        pointFactors.push({
          catalogId: item.catalogId,
          factorsGroups: factorsGroups          
        });
      });
      context.commit('SET_POINT_FACTORS', pointFactors);
    },
    GET_CATALOGS: async (context) => {
      let {data} = await axios.get('https://mebel.ru/tools/api/point-system/catalogs/');
      context.commit('SET_CATALOGS', data);
    },
    */
    GET_CATALOG_DATA: (context, payload) => {
      return new Promise( (resolve) => {
        axios.get('https://mebel.ru/tools/api/point-system/products/?catalog=' + payload.catalogId)
        .then( (response) => {
          context.commit('SET_CATALOG_DATA', {
            catalogId: payload.catalogId,
            catalogData: response.data
          });
          resolve();
        });
      });
    },
  }
});