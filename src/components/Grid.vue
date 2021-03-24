<template>
  <v-main class="ma-1">
    <div class="grid-view">
      <GridItem v-for="(entry, index) in data" :key="index" :entry="entry" />
    </div>

    <MessageModal v-model="messageModal" />
  </v-main>
</template>

<script>
import GridItem from '@/components/GridItem.vue';
import MessageModal from '@/components/MessageModal.vue';

export default {
  data() {
    return {
      messageModal: false,
    };
  },
  computed: {
    data() {
      return this.$store.state.api.hits;
    },
  },
  watch: {
    data(value) {
      if (value.length === 0) {
        this.messageModal = true;
      }
    },
  },
  components: {
    GridItem,
    MessageModal,
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
