<template>
  <v-dialog v-model="dialog" max-width="350px">
    <template v-slot:activator="{ on }">
      <v-icon
        v-on="on" :title="$t('modal.search.title')"
        @click="searchImage = true"
      >
        mdi-image-outline
      </v-icon>
    </template>

    <v-card>
      <v-card-title>
        <div class="text-h6">
          <span>{{ $t("modal.search.title") }}</span>
        </div>

        <v-btn icon @click.native="dialog = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-switch
          v-model="selectFile" class="pt-1 pb-2"
          :label="$t('modal.search.toggle')"
          color="secondary" inset hide-details
        ></v-switch>

        <v-file-input
          v-if="selectFile" v-model="user.file"
          accept="image/png, image/jpeg, image/gif"
          :placeholder="$t('modal.search.file.label')"
          prepend-icon="mdi-camera" :rules="[checkFile]"
          show-size
        ></v-file-input>
        <v-text-field
          v-else v-model="user.url" :rules="[checkURL]"
          :placeholder="$t('modal.search.url.label')"
          prepend-icon="mdi-link-variant" clearable
        ></v-text-field>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-btn
          @click="search" :disabled="disabled"
          color="accent" block rounded depressed
        >
          {{ $t("button.submit") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import isURL from "validator/lib/isURL";

export default {
  data() {
    return {
      user: {},
      dialog: false,
      selectFile: false,
    };
  },
  props: ["value"],
  methods: {
    search() {
      const query = { positive: true };

      if (this.selectFile) {
        query.type = "file";
        query.value = this.user.file;
      } else {
        query.type = "url";
        query.value = this.user.url;
      }

      this.$store.dispatch("api/upload", query);
      this.dialog = false;
    },
    checkFile() {
      const value = this.user.file;

      if (value) {
        if (value.size < 2000000) {
          return true;
        }

        return this.$t("modal.search.file.rule");
      }

      return this.$t("field.required");
    },
    checkURL() {
      const value = this.user.url;

      if (value) {
        if (value.length && isURL(value)) {
          return true;
        }

        return this.$t("modal.search.url.rule");
      }

      return this.$t("field.required");
    },
  },
  computed: {
    disabled() {
      if (this.user && Object.keys(this.user).length) {
        if (this.selectFile && this.checkFile() === true) {
          return false;
        }

        if (!this.selectFile && this.checkURL() === true) {
          return false;
        }
      }

      return true;
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
