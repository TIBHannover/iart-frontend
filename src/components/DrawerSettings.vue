<template>
  <v-banner v-model="drawer" :style="getCss" class="settings" app>
    <v-row align="center">
      <v-col cols="3">
        <ModalWeights :values="weights" @update="updateWeights" />
      </v-col>

      <v-col cols="3">
        <ModalLayout :values="layout" @update="updateLayout" />
      </v-col>

      <v-col cols="3">
        <ModalCluster :values="cluster" @update="updateCluster" />
      </v-col>

      <v-col cols="3">
        <v-layout justify-end>
          <v-btn @click="close" icon>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-layout>
      </v-col>
    </v-row>
  </v-banner>
</template>

<script>
import { keyInObj } from "@/plugins/helpers";

import ModalLayout from "@/components/ModalLayout.vue";
import ModalWeights from "@/components/ModalWeights.vue";
import ModalCluster from "@/components/ModalCluster.vue";

export default {
  data() {
    return {
      weights: {},
      cluster: {},
      layout: {},
      drawer: this.$store.state.user.drawer.settings,
    };
  },
  methods: {
    close() {
      this.$store.commit("user/toggleDrawer", "settings");
    },
    commit() {
      const settings = {
        weights: this.weights,
        cluster: this.cluster,
        layout: this.layout,
      };

      this.$store.commit("api/updateSettings", settings);
    },
    updateWeights(value) {
      this.weights = value;
      this.commit();
    },
    updateLayout(value) {
      this.layout = value;
      this.commit();
    },
    updateCluster(value) {
      this.cluster = value;
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
  },
  watch: {
    toggle(value) {
      this.drawer = value;
    },
  },
  created() {
    const { settings } = this.$store.state.api;

    if (Object.keys(settings).length) {
      if (keyInObj("weights", settings)) {
        this.weights = settings.weights;
      }

      if (keyInObj("cluster", settings)) {
        this.cluster = settings.cluster;
      }
      
      if (keyInObj("layout", settings)) {
        this.layout = settings.layout;
      }
    }
  },
  components: {
    ModalLayout,
    ModalWeights,
    ModalCluster,
  },
};
</script>

<style>
.theme--light.v-banner.v-sheet.settings {
  background-color: #fff;
  border-bottom: 1px solid #f5f5f5;
}

.theme--light.v-banner.v-sheet:not(.v-sheet--outlined):not(.v-sheet--shaped)
  .v-banner__wrapper {
  border-bottom: none;
}

.settings .v-banner__wrapper {
  padding: 8px 10px;
}

.settings .v-btn:not(.v-btn--round).v-size--default {
  padding: 0 8px;
}

.v-banner__text {
  display: flex;
}

.v-banner__text .v-input {
  align-items: center;
}

.v-banner__text .v-label {
  color: rgba(0, 0, 0, 0.87);
  font-size: 14px;
}

.v-banner__text .v-input--switch {
  padding-bottom: 0 !important;
  margin-top: 0;
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
