<template>
  <v-banner :value="value" :style="getCss" elevation="0" app sticky>
    <v-row align="center">
      <v-col cols="4" align-self="center" style="display: flex;">
        <v-select v-model="layout" :items="layoutItems" item-value="key" item-text="name" prepend-inner-icon="mdi-view-compact-outline" style="font-size: 14px;" solo hide-details flat dense></v-select>

        <v-btn title="Increase Item Size" @click="zoomIn" :disabled="!zoomInEnabled" icon>
          <v-icon>mdi-plus-circle-outline</v-icon>
        </v-btn>
        <v-btn title="Reduce Item Size" @click="zoomOut" :disabled="!zoomOutEnabled" class="ml-n2" icon>
          <v-icon>mdi-minus-circle-outline</v-icon>
        </v-btn>
      </v-col>

      <v-col cols="7">
      </v-col>

      <v-col cols="1" style="text-align: right;">
        <v-btn @click="$emit('input', false)" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-col>
    </v-row>
  </v-banner>
</template>

<script>
export default {
  data() {
    return {
      zoomLevel: 0,
      zoomInEnabled: true,
      zoomOutEnabled: true,
      layout: 'flexible',
      layoutItems: [
        { key: 'flexible', name: 'Flexible Layout' },
        { key: 'regular', name: 'Regular Layout' },
      ],
    };
  },
  props: ['value', 'margin'],
  methods: {
    commit() {
      const settings = {
        layout: this.layout,
        zoomLevel: this.zoomLevel,
      };

      this.$store.commit('updateSettings', settings);
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
    enableZoom() {
      this.zoomInEnabled = true;
      this.zoomOutEnabled = true;

      if (this.zoomLevel === 6) {
        this.zoomInEnabled = false;
      }

      if (this.zoomLevel === -6) {
        this.zoomOutEnabled = false;
      }
    },
  },
  computed: {
    getCss() {
      return {
        'margin-right': `${this.margin * 350}px`,
      };
    },
  },
  watch: {
    layout() {
      this.commit();
    },
  },
  created() {
    const { settings } = this.$store.state.api;

    if (Object.keys(settings).length) {
      this.layout = settings.layout;
      this.zoomLevel = settings.zoomLevel;
    }
  },
};
</script>

<style>
.theme--light.v-banner.v-sheet {
  background-color: #fff;
}

.theme--light.v-banner.v-sheet:not(.v-sheet--outlined):not(.v-sheet--shaped) .v-banner__wrapper {
  border-bottom: none;
}

.v-application--is-ltr .v-banner__wrapper {
  padding: 8px 10px;
}

.v-banner__text {
  display: flex;
}

.v-banner__text .v-input {
  align-items: center;
}
</style>
