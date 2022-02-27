<template>
  <v-main class="ma-1">
    <div
      v-if="entries"
      style="height: 100%;"
    >
      <Umap
        v-if="layout==='umap'"
        :data="entries"
      />
      <GridCluster
        v-if="layout==='cluster'"
        :entries="entries"
      />
      <GridRanked
        v-if="layout==='ranked'"
        :entries="entries"
      />
    </div>

    <Loader />
    <ModalNoResults :entries="entries" />
  </v-main>
</template>

<script>
export default {
  computed: {
    entries() {
      let { hits } = this.$store.state.api;
      const { settings } = this.$store.state.api;
      if (hits && Object.keys(settings).length) {
        if (this.keyInObj('sortType', settings.layout)) {
          switch (settings.layout.sortType) {
            case 'title':
              hits = hits.map((entry) => {
                entry.order = 'zzzz';
                entry.meta.every(({ name, value_str }) => {
                  if (name === 'title' && value_str) {
                    entry.order = value_str;
                    return false;
                  }
                  return true;
                });
                return entry;
              });
              hits.sort((a, b) => a.order.localeCompare(b.order));
              break;
            case 'date':
              hits = hits.map((entry) => {
                entry.order = 9999;
                entry.meta.every(({ name, value_str }) => {
                  if (name === 'year_min' && value_str) {
                    entry.order = value_str;
                    return false;
                  }
                  return true;
                });
                return entry;
              });
              hits.sort((a, b) => a.order - b.order);
              break;
            default:
              break;
          }
        }
        if (
          this.keyInObj('sortOrder', settings.layout)
          && settings.layout.sortOrder === 'desc'
        ) {
          hits = [...hits].reverse();
        }
      }
      return hits;
    },
    layout() {
      if (this.entries) {
        const { settings } = this.$store.state.api;
        if (Object.keys(settings).length) {
          if (
            this.keyInObj('viewType', settings.layout)
            && settings.layout.viewType === 'umap'
          ) {
            return 'umap';
          }
          if (
            this.keyInObj('n', settings.cluster)
            && settings.cluster.n > 1
          ) {
            return 'cluster';
          }
        }
        return 'ranked';
      }
      return null;
    },
  },
  components: {
    Umap: () => import('@/components/Umap2D.vue'),
    Loader: () => import('@/components/Loader.vue'),
    GridRanked: () => import('@/components/GridRanked.vue'),
    GridCluster: () => import('@/components/GridCluster.vue'),
    ModalNoResults: () => import('@/components/ModalNoResults.vue'),
  },
};
</script>
