<template>
  <v-main class="ma-1">
    <Umap v-if="settings.layout==='umap'" />
    <Grid v-else :entries="entries" />

    <ModalNoResults />
    <ModalError />
  </v-main>
</template>

<script>
import Grid from "@/components/Grid.vue";
import Umap from "@/components/Umap2D.vue";
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
  },
  components: {
    Grid,
    Umap,
    ModalError,
    ModalNoResults,
  },
};
</script>
