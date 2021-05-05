<template>
  <v-main class="ma-1">
    <Umap v-if="settings.layout === 'umap'" />
    <Grid v-else />

    <ModalNoResults />
    <ModalError />
  </v-main>
</template>

<script>
import Grid from "@/components/Grid.vue";
import Umap from "@/components/Umap.vue";
import ModalError from "@/components/ModalError.vue";
import ModalNoResults from "@/components/ModalNoResults.vue";

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
