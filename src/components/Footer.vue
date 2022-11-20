<template>
  <v-bottom-navigation horizontal>
    <v-btn @click="imprint" text>
      {{ $t("imprint.title") }}
    </v-btn>

    <v-btn @click="privacy" text>
      {{ $t("privacy.title") }}
    </v-btn>

    <v-btn href="https://github.com/TIBHannover/iart" class="icon-btn">
      <v-icon> mdi-github </v-icon>
      {{ $t("github") }}
    </v-btn>
  </v-bottom-navigation>
</template>

<script>
import router from "@/router";

export default {
  methods: {
    imprint() {
      router.push({ path: "imprint" });
    },
    privacy() {
      router.push({ path: "privacy" });
    },
  },
};
</script>

<style scoped>
.v-bottom-navigation {
  box-shadow: none !important;
}
.icon-btn {
  flex-direction: row;
  white-space: nowrap;
}
.v-item-group.v-bottom-navigation .v-btn .v-btn__content {
  flex-direction: row !important;
  white-space: nowrap;
}
</style>
