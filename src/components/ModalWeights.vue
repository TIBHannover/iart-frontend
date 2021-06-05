<template>
  <v-menu
    v-model="dialog" :close-on-content-click="false" min-width="300"
    max-width="300" offset-y bottom right open-on-hover
  >
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" text block>
        <v-icon color="grey darken-1" class="mr-2 ml-n1">
          mdi-compass-outline
        </v-icon>
        <span style="font-size: 14px">
          {{ $t("modal.weights.title") }}
        </span>
      </v-btn>
    </template>

    <Weights
      :default="values" :local="false" :visible="dialog"
      @update="update" @close="dialog = false"
    />
  </v-menu>
</template>

<script>
import Weights from "@/components/Weights.vue";

export default {
  data() {
    return {
      dialog: false,
    };
  },
  props: ["values"],
  methods: {
    update(value) {
      this.$emit("update", value);
    },
  },
  components: {
    Weights,
  },
};
</script>
