<template>
  <div
    v-if="loading"
    class="loading"
  >
    <v-progress-circular
      indeterminate
      color="accent"
    />
  </div>
</template>

<script>
export default {
  data() {
    return {
      loading: true,
    };
  },
  props: ['updating'],
  computed: {
    status() {
      return this.$store.state.utils.status.loading;
    },
  },
  watch: {
    status(value) {
      this.loading = value;
    },
    updating: {
      handler(value) {
        if (value && !this.status) {
          this.loading = value.updating;
        }
      },
      deep: true,
    },
  },
};
</script>

<style scoped>
.loading {
  background-color: rgba(0, 0, 0, 0.3);
  text-align: center;
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
}

.loading > div {
  height: 100% !important;
}
</style>
