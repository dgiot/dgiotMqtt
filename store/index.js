import Vue from 'vue';
import Vuex from 'vuex';
import createPersistedState from 'vuex-persistedstate';
const state = () => ({
  mapTopic: new Map(),
});

const getters = {
  mapTopic: (state) => state.mapTopic,
};
const mutations = {
  setMapTopic(state, MapTopic) {
    state.mapTopic = MapTopic;
  },
};
const actions = {
  setMapTopic({ commit }, MapTopic) {
    commit('setMapTopic', MapTopic);
  },
};
Vue.use(Vuex);
export const store = new Vuex.Store({
  state,
  getters,
  mutations,
  actions,
  plugins: [createPersistedState()],
});
