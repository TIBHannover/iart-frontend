<template>
  <v-footer v-bind="localAttrs" padless>
    <v-card flat tile width="100%" class="text-center">
      <v-card-text class="footer">
        <a @click="legal"> Legal notice </a>
        <a @click="privacy"> Data protection </a>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
import router from "../router";

export default {
  data() {
    return {};
  },
  methods: {
    legal() {
      router.push({ path: "legal" });
    },
    privacy() {
      router.push({ path: "privacy" });
    },
  },
};
</script>

<style>
.footer * {
  padding-left: 1em;
  padding-right: 1em;
}
</style>