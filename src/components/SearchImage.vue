<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="350px">
    <v-card>
      <v-card-title>
        Image search
        <v-btn icon @click.native="$emit('input')" absolute right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-switch v-model="selectFile" class="pt-0" inset label="Upload image from my computer"></v-switch>

        <v-file-input v-if="selectFile" v-model="file" accept="image/png, image/jpeg, image/gif" placeholder="Select image file" prepend-icon="mdi-camera" chips show-size filled></v-file-input>

        <v-text-field v-else v-model="url" placeholder="Paste URL to image" prepend-icon="mdi-link-variant" clearable filled
        ></v-text-field>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-btn @click="search" block rounded>Search</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      file: null,
      url: null,
      selectFile: false,
    };
  },
  props: ['value'],
  methods: {
    search() {
      if (this.selectFile) {
        // TODO
      } else {
        this.$emit('search', this.url);
      }

      this.$emit('input');
    },
  },
};
</script>

<style>
.v-text-field__details,
.v-text-field__details > div {
  min-height: 0;
}
</style>
