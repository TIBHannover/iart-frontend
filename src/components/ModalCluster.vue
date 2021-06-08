<template>
  <v-menu
     v-model="dialog" :close-on-content-click="false" min-width="300" 
     max-width="300" offset-y bottom right open-on-hover
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block>
        <v-icon color="grey darken-1" class="mr-2 ml-n1">
          mdi-select-group
        </v-icon>
        <span style="font-size: 14px">
          {{ $t("modal.cluster.title") }}
        </span>
      </v-btn>
    </template>

    <v-card id="cluster" width="300">
      <v-card-text class="px-6 pt-4 pb-5">
        <v-select
          v-model="cluster.default" :items="cluster.items" class="mb-2"
          item-value="key" item-text="name" attach="#cluster"
          solo flat dense hide-details @change="update"
        >
          <template v-slot:prepend>
            {{ $t("field.use") }}
          </template>
        </v-select>

        <div :title="$t('modal.cluster.n')"">
          <v-slider
            v-model="nClusters" min="1" max="12" color="secondary"
            prepend-icon="mdi-format-list-numbered" hide-details
            @end="update"
          >
            <template v-slot:append>
              <v-text-field
                v-model="nClusters" type="number" class="mt-0 pt-0"
                background-color="grey lighten-4" style="width: 80px"
                hide-details single-line rounded flat
              ></v-text-field>
            </template>
          </v-slider>
        </div>
      </v-card-text>
    </v-card>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      nClusters: 1,
      cluster: {
        default: "kmeans",
        items: [
          { key: "kmeans", name: this.$t("modal.cluster.type.kmeans") },
          // { key: "agglomerative", name: this.$t("modal.cluster.type.agglomerative") },
        ],
      }
    };
  },
  props: ["values"],
  methods: {
    update() {
      const values = {
        type: this.cluster.default,
        n: this.nClusters,
      }

      this.$emit("update", values);
    },
  },
  created() {
    if (this.values && Object.keys(this.values).length) {
      this.cluster.default = this.values.type;
      this.nClusters = this.values.n;
    }
  },
};
</script>

<style>
#cluster .v-select .v-input__slot {
  padding-right: 3px !important;
  padding-left: 1px !important;
}

#cluster .v-select .v-input__prepend-outer {
  display: flex;
  min-height: 27px;
  margin-right: 4px;
  align-items: center;
}
</style>
