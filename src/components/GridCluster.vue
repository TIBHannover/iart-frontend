<template>
  <div class="cluster-view mb-n2">
    <div 
      v-for="(entries, index) in clusterEntries"
      :key="index" class="mt-2 mb-4"
    >
      <div class="text-h6 mx-3 mb-2">
        {{ $t("field.cluster") }} {{ parseInt(index) + 1 }}

        <span class="v-label theme--light ml-1">
          <span v-if="convertEntries[index].length===1">
            · {{ convertEntries[index].length }} {{ $t("field.object") }}
          </span>

          <span v-else>
            · {{ convertEntries[index].length }} {{ $t("field.objects") }}
          </span>
        </span>
      </div>

      <v-slide-group
        v-model="slide[index]" @click:next="next(index)"
        @click:prev="prev(index)" value=0 show-arrows
      >
        <v-slide-item v-for="entry in entries" :key="entry">
          <GridItem :key="entry" :entry="entry" :entries="entries" />
        </v-slide-item>

        <div v-if="entries.length<4" class="grid-item-fill"></div>
      </v-slide-group>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';

import GridItem from "@/components/GridItem.vue";

export default {
  props: ["entries"],
  data() {
    return {
      slide: {},
    };
  },
  methods: {
    next(index) {
      Vue.set(this.slide, index, this.slide[index] + 5);
    },
    prev(index) {
      Vue.set(this.slide, index, this.slide[index] - 5);
    },
  },
  computed: {
    convertEntries() {
      const entries = {};

      this.entries.forEach((entry) => {
        if (entries[entry.cluster] instanceof Array) {
          entries[entry.cluster].push(entry);
        } else {
          entries[entry.cluster] = [entry];
        }
      });

      return entries;
    },
    clusterEntries() {
      const entries = { ...this.convertEntries };

      Object.keys(entries).forEach((cluster) => {
        if (this.slide[cluster] === undefined) {
          Vue.set(this.slide, cluster, 0);
        }

        const nEntries = 25 + this.slide[cluster];

        if (entries[cluster].length > nEntries) {
          entries[cluster] = entries[cluster].slice(0, nEntries);
        }
      });

      return entries;
    },
  },
  components: {
    GridItem,
  },
};
</script>

<style>
.cluster-view .text-h6 {
  font-size: 1.15rem !important;
  align-items: center;
  display: flex;
}

.cluster-view .text-h6 > .v-label {
  font-size: 14px;
  cursor: auto;
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

.cluster-view .v-slide-group__next--disabled > .theme--light.v-icon.v-icon.v-icon--disabled,
.cluster-view .v-slide-group__prev--disabled > .theme--light.v-icon.v-icon.v-icon--disabled {
  color: rgba(69, 123, 157, .2) !important;
}
</style>
