<template>
  <v-main class="ma-1">
    <Umap v-if="settings.layout === 'umap'" />
    <Grid v-else />

    <ModalNoResults />
    <ModalError />
    <ModalCollection />
  </v-main>
</template>

<script>
import Grid from "@/components/Grid.vue";
import Umap from "@/components/Umap.vue";
import ModalError from "@/components/ModalError.vue";
import ModalNoResults from "@/components/ModalNoResults.vue";
import ModalCollection from "@/components/ModalCollection.vue";

export default {
  computed: {
    settings() {
      return this.$store.state.api.settings;
    },
  },
  components: {
    Grid,
    Umap,
    ModalError,
    ModalNoResults,
    ModalCollection,
  },
};
</script>

<style>
.grid-view {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  transition: flex-basis 0.2s ease;
}
</style>
