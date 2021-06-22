<template>
  <v-main class="ma-1">
    <Umap v-if="layout==='umap'" :data="entries" />

    <GridCluster v-if="layout==='cluster'" :entries="entries" />
    <GridRanked v-if="layout==='ranked'" :entries="entries" />

    <ModalNoResults :entries="entries" />
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
      let { hits, settings } = this.$store.state.api;

      if (hits && Object.keys(settings).length) {
        if (keyInObj("sortType", settings.layout)) {
          switch (settings.layout.sortType) {
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

        if (
          keyInObj("sortOrder", settings.layout) &&
          settings.layout.sortOrder === "desc"
        ) {
          hits = [...hits].reverse();
        }
      }

      return hits;
    },
    layout() {
      const { settings } = this.$store.state.api;

      if (Object.keys(settings).length) {
        if (
          keyInObj("viewType", settings.layout) &&
          settings.layout.viewType === "umap"
        ) {
          return "umap";
        }

        if (
          keyInObj("n", settings.cluster) &&
          settings.cluster.n > 1
        ) {
          return "cluster";
        }
      }

      return "ranked";
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
