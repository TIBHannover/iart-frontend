<template>
  <v-btn 
    :title="$t('help.title')" @click="help" class="help"
    color="accent" fixed fab large bottom right
  >
    <v-icon>mdi-help</v-icon>
  </v-btn>
</template>

<script>
export default {
  methods: {
    help() {
      const filter = { drawer: "filter", value: true };
      const settings = { drawer: "settings", value: true };

      this.$store.commit("user/updateDrawer", filter);
      this.$store.commit("user/updateDrawer", settings);
      
      window.scrollTo(0, 0);
      this.$intro().start();
    },
  },
};
</script>

<style>
.help.v-btn {
  z-index: 99;
}

.help.v-btn--fab.v-size--large.v-btn--absolute.v-btn--bottom {
  bottom: 0;
}
</style>
