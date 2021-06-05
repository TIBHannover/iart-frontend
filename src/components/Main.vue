<template>
  <v-main class="ma-1">
    <Umap v-if="layout==='umap'" />
    
    <GridCluster v-if="layout==='cluster'" :entries="entries" />
    <GridRanked v-if="layout==='ranked'" :entries="entries" />

    <ModalNoResults />
    <ModalError />
  </v-main>
</template>

<script>
import { keyInObj } from "@/plugins/helpers";

import Umap from "@/components/Umap2D.vue";
import GridRanked from "@/components/GridRanked.vue";
import GridCluster from "@/components/GridCluster.vue";
import ModalError from "@/components/ModalError.vue";
import ModalNoResults from "@/components/ModalNoResults.vue";

export default {
  computed: {
    entries() {
      return this.$store.state.api.hits;
    },
    settings() {
      return this.$store.state.api.settings;
    },
    layout() {
      const { settings } = this.$store.state.api;

      if (settings.layout === 'umap') {
        return 'umap';
      }

      if (
        keyInObj('n', settings.cluster) &&
        settings.cluster.n > 1
      ) {
        return 'cluster';
      }

      return 'ranked';
    },
  },
  components: {
    Umap,
    GridRanked,
    GridCluster,
    ModalError,
    ModalNoResults,
  },
};
</script>
