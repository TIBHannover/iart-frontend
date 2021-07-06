<template>
  <v-menu
    v-model="dialog"
    :close-on-content-click="false"
    min-width="300"
    max-width="300"
    offset-y
    bottom
    right
    open-on-hover
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        text
        block
      >
        <v-icon
          color="grey darken-1"
          class="mr-2 ml-n1"
        >
          mdi-compass-outline
        </v-icon>
        <v-badge
          v-if="changed"
          color="accent"
          dot
        >
          <span style="font-size: 14px">
            {{ $t("modal.weights.title") }}
          </span>
        </v-badge>
        <span
          v-else
          style="font-size: 14px"
        >
          {{ $t("modal.weights.title") }}
        </span>
      </v-btn>
    </template>

    <Weights
      :default="values"
      :local="false"
      :visible="dialog"
      @update="update"
      @close="dialog=false"
    />
  </v-menu>
</template>

<script>
import { isEqual } from "@/plugins/helpers";
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
  computed: {
    toggle() {
      return this.$store.state.user.modal.weights;
    },
    changed() {
      if (this.values && Object.keys(this.values).length) {
        const defaultValue = { clip_embedding_feature: 1 };
        if (!isEqual(this.values, defaultValue)) {
          return true;
        }
      }
      return false;
    },
  },
  watch: {
    toggle(value) {
      this.dialog = value;
    }
  },
  components: {
    Weights,
  },
};
</script>