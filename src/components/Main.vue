<template>
  <v-main class="ma-1">
    <Umap v-if="layout==='umap'" :data="entries" />
    
    <GridCluster v-if="layout==='cluster'" :entries="entries" />
    <GridRanked v-if="layout==='ranked'" :entries="entries" />

    <ModalNoResults />
    <ModalError />
  </v-main>
</template>

<script>
import Umap from "@/components/Umap2D.vue";
import GridRanked from "@/components/GridRanked.vue";
import GridCluster from "@/components/GridCluster.vue";
import ModalError from "@/components/ModalError.vue";
import ModalNoResults from "@/components/ModalNoResults.vue";

export default {
  computed: {
    entries() {
      let { hits, settings } = this.$store.state.api;

      if (Object.keys(settings).length) {
        switch (settings.layout.order) {
          case "title":
            hits = hits.map((entry) => {
              entry.order = "zzzz";

              entry.meta.every(({ name, value_str }) => {
                if (name === "title" && value_str) {
                  entry.order = value_str;
                  return false;
                }

                return true;
              });

              return entry;
            });

            hits.sort((a, b) => a.order.localeCompare(b.order));
            break;
          case "date":
            hits = hits.map((entry) => {
              entry.order = 9999;

              entry.meta.every(({ name, value_str }) => {
                if (name === "year_min" && value_str) {
                  entry.order = value_str;
                  return false;
                }

                return true;
              });

              return entry;
            });

            hits.sort((a, b) => a.order - b.order);
        }
      }

      return hits;
    },
    layout() {
      const { settings } = this.$store.state.api;

      if (Object.keys(settings).length) {
        if (settings.layout.type === 'umap') {
          return 'umap';
        }

        if (settings.cluster.n > 1) {
          return 'cluster';
        }
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
