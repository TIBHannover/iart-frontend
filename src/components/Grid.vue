<template>
  <div class="grid-view">
    <GridItem v-for="entry in data" :key="entry" :entry="entry" />
  </div>
</template>

<script>
import GridItem from "@/components/GridItem.vue";

export default {
  data() {
    return {
      modalNoResults: false,
    };
  },
  computed: {
    data() {
      return this.$store.state.api.hits;
    },
  },
  components: {
    GridItem,
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
