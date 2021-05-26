<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="750px">
    <v-card>
      <v-card-title>
        <div class="text-h6">
          {{ $t("modal.grid.title") }}
        </div>

        <v-btn icon @click.native="$emit('input')" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text class="mt-4">
        <Grid :entries="entries" />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Grid from "@/components/Grid.vue";

export default {
  props: ["value", "entries"],
  components: {
    Grid,
  },
};
</script>
