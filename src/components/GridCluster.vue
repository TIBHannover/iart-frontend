<template>
  <div class="cluster-view mb-n2">
    <div 
      v-for="(entries, index) in clusterEntries"
      :key="index" class="mt-2 mb-4"
    >
      <div class="text-h6 mx-3 mb-2">
        {{ $t("field.cluster") }} {{ parseInt(index) + 1 }}

        <span v-if="entries.length===1" class="v-label theme--light">
           · {{ entries.length }} {{ $t("field.object") }}
        </span>
        <span v-else class="v-label theme--light">
           · {{ entries.length }} {{ $t("field.objects") }}
        </span>
      </div>

      <v-slide-group multiple show-arrows>
        <v-slide-item v-for="entry in filter(entries)" :key="entry">
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
  methods: {
    filter(entries) {
      if (entries.length > 50) {
        return entries.slice(0, 50);
      }

      return entries;
    },
  },
  computed: {
    clusterEntries() {
      const entries = {};

      this.entries.forEach((entry) => {
        if (entries[entry.cluster] instanceof Array) {
          entries[entry.cluster].push(entry);
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

.cluster-view .v-slide-group__next--disabled > .theme--light.v-icon.v-icon.v-icon--disabled,
.cluster-view .v-slide-group__prev--disabled > .theme--light.v-icon.v-icon.v-icon--disabled {
  color: rgba(69, 123, 157, .2) !important;
}

.cluster-view .text-h6 > .v-label {
  vertical-align: middle;
  align-items: center;
  font-size: 14px;
}
</style>
