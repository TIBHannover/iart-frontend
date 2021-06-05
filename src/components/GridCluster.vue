<template>
  <div class="cluster-view mb-n2">
    <div 
      v-for="(entries, index) in clusterEntries"
      :key="index" class="mt-2 mb-4"
    >
      <div class="text-h6 mx-3 mb-2">
        {{ $t("field.cluster") }} {{ parseInt(index) + 1 }}
      </div>

      <v-slide-group multiple show-arrows>
        <v-slide-item v-for="entry in entries" :key="entry">
          <GridItem :key="entry" :entry="entry" :entries="entries" />
        </v-slide-item>

        <div v-if="entries.length<4" class="grid-item-fill"></div>
      </v-slide-group>
    </div>
  </div>
</template>

<script>
import GridItem from "@/components/GridItem.vue";

export default {
  props: ["entries"],
  computed: {
    clusterEntries() {
      const entries = {};

      this.entries.forEach((entry) => {
        if (entries[entry.cluster] instanceof Array) {
          if (entries[entry.cluster].length < 49) {
            entries[entry.cluster].push(entry);
          }
        } else {
          entries[entry.cluster] = [entry];
        }
      });

      return entries;
    }
  },
  components: {
    GridItem,
  },
};
</script>

<style>
.cluster-view .text-h6 {
  font-size: 1.15rem !important;
}

.cluster-view .v-slide-group__next,
.cluster-view .v-slide-group__prev {
  flex: 0 1 36px;
  min-width: 36px;
}

.cluster-view .v-slide-group:not(.v-slide-group--has-affixes)>.v-slide-group__next, 
.cluster-view .v-slide-group:not(.v-slide-group--has-affixes)>.v-slide-group__prev {
    display: flex;
}
</style>
