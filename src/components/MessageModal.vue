<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="450px">
    <v-card>
      <v-card-title class="mb-2">
        <div class="text-h6">
          <span>Information</span>
        </div>

        <v-btn icon @click.native="$emit('input')" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="mb-4">Your search did not yield any results. Please modify your query or extend the range of your search, e. g., by removing filters.</div>

        <v-btn color="primary" width="50%" plain @click="removeAllFilters">Remove Filters</v-btn>
        <v-btn color="grey" width="50%" plain @click="$emit('input')">Cancel</v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ['value'],
  methods: {
    removeAllFilters() {
      this.$store.commit('removeAllFilters');
      this.$emit('input');
    },
  },
};
</script>
