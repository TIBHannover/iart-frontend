<template>
  <div class="flex-view">
    <GridItem 
      v-for="entry in entries" :key="entry" 
      :entry="entry" :entries="entries"
    />
    
    <div class="grid-item-fill"></div>
  </div>
</template>

<script>
import GridItem from "@/components/GridItem.vue";

export default {
  props: ["entries"],
  components: {
    GridItem,
  },
};
</script>

<style>
.flex-view {
  flex-grow: 1;
  display: flex;
  flex-wrap: wrap;
  overflow: hidden;
  transition: flex-basis 0.2s ease;
}

.flex-view:after {
  content: "";
  flex: auto;
}

.grid-item-fill {
  flex-grow: 50;
}
</style>
