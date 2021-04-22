<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="450px">
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.noresults.title") }}

        <v-btn icon @click.native="$emit('input')" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="mb-4">{{ $t("modal.noresults.text") }}</div>

        <v-btn color="primary" width="50%" plain @click="removeAllFilters">{{
          $t("drawer.filter.remove")
        }}</v-btn>
        <v-btn color="grey" width="50%" plain @click="$emit('input')">{{
          $t("button.cancel")
        }}</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["value"],
  methods: {
    removeAllFilters() {
      this.$store.commit("api/removeAllFilters");
      this.$emit("input");
    },
  },
};
</script>
