<template>
  <div class="grid-view">
    <GridItem v-for="(entry, index) in data" :key="index" :entry="entry" />
  </div>
</template>

<script>
import GridItem from '@/components/GridItem.vue';

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
  transition: flex-basis .2s ease;
}
</style>
