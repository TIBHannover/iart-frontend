<template>
  <v-menu
    v-model="dialog" :close-on-content-click="false" min-width="300" 
    max-width="300" offset-y bottom right open-on-hover
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block>
        <v-icon color="grey darken-1" class="mr-2 ml-n1">
          mdi-view-dashboard-outline
        </v-icon>
        <span style="font-size: 14px">
          {{ $t("modal.layout.title") }}
        </span>
      </v-btn>
    </template>

    <v-card id="layout" width="300">
      <v-card-text class="px-6 pt-4 pb-5">
        <v-select
          v-model="layout.default" :items="layout.items"
          class="mb-0" item-value="key" item-text="name" 
          attach="#layout" solo flat dense hide-details
        >
          <template v-slot:prepend>
            {{ $t("field.use") }}
          </template>

          <template v-slot:append-outer>
            <v-btn
              v-if="layout.grid" class="ml-2" @click="layout.grid = false"
              :title="$t('modal.layout.grid.hide')" icon small
            >
              <v-icon>mdi-grid-off</v-icon>
            </v-btn>
            <v-btn
              v-else class="ml-2" @click="layout.grid = true" 
              :title="$t('modal.layout.grid.show')" icon small
            >
              <v-icon>mdi-grid</v-icon>
            </v-btn>
          </template>
        </v-select>

        <v-select
          v-model="order.default" :items="order.items"
          class="mb-2" item-value="key" item-text="name" 
          attach="#layout" solo flat dense hide-details
        >
          <template v-slot:prepend>
            {{ $t("modal.layout.order.title") }}
          </template>
        </v-select>

        <div :title="$t('modal.layout.itemSize')">
          <v-slider
            v-model="itemSize" min="-7" max="7" color="secondary"
            :disabled="layout.default==='umap' && layout.grid"
            prepend-icon="mdi-magnify-scan" hide-details
            @end="update"
          >
            <template v-slot:append>
              <v-text-field
                v-model="itemSize" type="number" class="mt-0 pt-0"
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
      itemSize: 0,
      layout: {
        default: "flexible",
        grid: false,
        items: [
          { key: "flexible", name: this.$t("modal.layout.type.flexible") },
          { key: "umap", name: this.$t("modal.layout.type.umap") },
        ],
      },
      order: {
        default: "relevance",
        items: [
          { key: "relevance", name: this.$t("modal.layout.order.type.relevance") },
          { key: "title", name: this.$t("modal.layout.order.type.title") },
          { key: "date", name: this.$t("modal.layout.order.type.date") },
        ],
      }
    };
  },
  props: ["values"],
  methods: {
    update() {
      const values = {
        order: this.order.default,
        type: this.layout.default,
        itemSize: this.itemSize,
        grid: this.layout.grid,
      }

      this.$emit("update", values);
    },
  },
  watch: {
    layout: {
      handler() {
        this.update();
      },
      deep: true,
    },
    order: {
      handler() {
        this.update();
      },
      deep: true,
    },
  },
  created() {
    if (this.values && Object.keys(this.values).length) {
      this.layout.grid = this.values.grid;
      this.itemSize = this.values.itemSize;
      this.layout.default = this.values.type;
      this.order.default = this.values.order;
    }
  },
};
</script>

<style>
#layout .v-select .v-input__slot {
  padding-right: 3px !important;
  padding-left: 1px !important;
}

#layout .v-select .v-input__prepend-outer {
  display: flex;
  min-height: 27px;
  margin-right: 4px;
  align-items: center;
  white-space: nowrap;
}
</style>
