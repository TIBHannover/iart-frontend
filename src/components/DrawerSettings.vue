<template>
  <v-banner v-model="drawer" :style="getCss" class="settings" app>
    <v-row align="center">
      <v-col cols="3">
        <ModalWeights :values="weights" @update="updateWeights" />
      </v-col>

      <v-col cols="3">
        <v-select
          v-model="layout" :items="layoutItems"
          item-value="key" item-text="name"
          prepend-inner-icon="mdi-view-compact-outline"
          style="font-size: 14px" solo hide-details
          flat dense
        ></v-select>
      </v-col>

      <v-col cols="5">
        <v-btn
          :title="$t('drawer.settings.size.increase')"
          @click="zoomIn" :disabled="!zoomInEnabled" icon
        >
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
        <v-btn
          :title="$t('drawer.settings.size.reduce')"
          @click="zoomOut"
          :disabled="!zoomOutEnabled"
          class="ml-n2"
          icon
        >
          <v-icon>mdi-minus-circle-outline</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="1" style="text-align: right">
        <v-btn @click="close" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-banner>
</template>

<script>
import ModalWeights from "@/components/ModalWeights.vue";

export default {
  data() {
    return {
      weights: {},
      zoomLevel: 0,
      layout: "flexible",
      layoutItems: [
        { key: "flexible", name: this.$t("drawer.settings.layout.flexible") },
        { key: "regular", name: this.$t("drawer.settings.layout.regular") },
        { key: "umap", name: this.$t("drawer.settings.layout.umap") },
      ],
      drawer: this.$store.state.user.drawer.settings,
    };
  },
  methods: {
    close() {
      this.$store.commit("user/toggleDrawer", "settings");
    },
    commit() {
      const settings = {
        layout: this.layout,
        weights: this.weights,
        zoomLevel: this.zoomLevel,
      };

      this.$store.commit("api/updateSettings", settings);
    },
    zoomIn() {
      if (this.zoomLevel < 7) {
        this.zoomLevel += 1;
        this.commit();
      }
    },
    zoomOut() {
      if (this.zoomLevel > -7) {
        this.zoomLevel -= 1;
        this.commit();
      }
    },
    updateWeights(value) {
      this.weights = value;
      this.commit();
    },
  },
  computed: {
    toggle() {
      return this.$store.state.user.drawer.settings;
    },
    getCss() {
      const { filter } = this.$store.state.user.drawer;

      return {
        "margin-right": `${filter * 350}px`,
      };
    },
    zoomInEnabled() {
      if (this.zoomLevel === 6) {
        return false;
      }

      return true;
    },
    zoomOutEnabled() {
      if (this.zoomLevel === -6) {
        return false;
      }

      return true;
    },
  },
  watch: {
    toggle(value) {
      this.drawer = value;
    },
    layout() {
      this.commit();
    },
  },
  created() {
    const { settings } = this.$store.state.api;

    if (Object.keys(settings).length) {
      this.layout = settings.layout;
      this.weights = settings.weights;
      this.zoomLevel = settings.zoomLevel;
    }
  },
  components: {
    ModalWeights,
  },
};
</script>

<style>
.theme--light.v-banner.v-sheet.settings {
  background-color: #fff;
}

.theme--light.v-banner.v-sheet:not(.v-sheet--outlined):not(.v-sheet--shaped)
  .v-banner__wrapper {
  border-bottom: none;
}

.settings .v-banner__wrapper {
  padding: 8px 10px;
}

.v-banner__text {
  display: flex;
}

.v-banner__text .v-input {
  align-items: center;
}

.v-banner .v-btn--text {
  text-transform: capitalize;
  justify-content: left;
  letter-spacing: 0;
}

.v-banner .v-btn--text:before,
.v-banner .v-btn--text:hover:before,
.v-banner .v-btn--text:focus:before {
  background-color: transparent;
}
</style>
