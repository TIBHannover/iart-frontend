<template>
  <v-main class="ma-1">
    <Umap v-if="settings.layout==='umap'" />
    <Grid v-else />

    <ModalNoResults v-model="modalNoResults" />
  </v-main>
</template>

<script>
import Grid from '@/components/Grid.vue';
import Umap from '@/components/Umap.vue';
import ModalNoResults from '@/components/ModalNoResults.vue';

export default {
  data() {
    return {
      modalNoResults: false,
    };
  },
  computed: {
    data() {
      return this.$store.state.api.hits;
    },
    settings() {
      return this.$store.state.api.settings;
    },
  },
  watch: {
    data(value) {
      if (value.length === 0) {
        this.modalNoResults = true;
      }
    },
  },
  components: {
    Grid,
    Umap,
    ModalNoResults,
  },
};
</script>

<style>
.grid-view {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  transition: flex-basis .2s ease;
}
</style>
