<template>
  <v-app>
    <div
      class="logo"
      @click="reset"
      style="cursor: pointer;"
    >
      <img src="/assets/images/logo.png" />
    </div>
  </v-app>
</template>

<script>
export default {
  methods: {
    reset() {
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.v-application {
  justify-content: center;
  align-items: center;
  display: flex;
  height: 100%;
}

.logo {
  margin: auto;
}

.logo > img {
  max-height: 56px;
}
</style>
