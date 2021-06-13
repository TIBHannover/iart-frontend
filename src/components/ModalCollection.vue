<template>
  <v-dialog v-model="dialog" max-width="900px">
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.collection.title") }}

        <v-btn icon @click.native="dialog = false" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- <div class="mb-4">{{ $t("modal.error.text") }}</div> -->

        <v-text-field
          v-model="collection.name"
          :placeholder="$t('modal.collection.name')"
          counter="25"
          :rules="[checkLength]"
          clearable
        ></v-text-field>

        <v-file-input
          v-model="collection.image"
          accept="image/png, image/jpeg, image/gif, application/zip,application/x-tar, application/x-bzip2, application/gzip, application/x-xz, application/x-gtar"
          :placeholder="$t('modal.collection.imagefile.label')"
          prepend-icon="mdi-camera"
          :rules="[checkImageFile]"
          show-size
        ></v-file-input>

        <v-file-input
          v-model="collection.meta"
          accept="text/csv, application/json, application/jsonl"
          :placeholder="$t('modal.collection.metafile.label')"
          prepend-icon="mdi-file-document"
          :rules="[checkMetaFile]"
          show-size
          :error="metaErrorMessage"
          :error-messages="metaErrorMessage"
        >
        </v-file-input>

        <v-btn color="primary" width="50%" plain @click="upload">
          {{ $t("button.upload") }}
        </v-btn>
        <v-btn color="grey" width="50%" plain @click="dialog = false">
          {{ $t("button.cancel") }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { keyInObj } from "../plugins/helpers";

export default {
  data() {
    return {
      dialog: true,
      collection: {},
    };
  },
  computed: {
    metaErrorMessage() {
      const uploadError = this.$store.state.collection.uploadError;
      if (!uploadError) {
        return null;
      }
      if (!keyInObj("type", uploadError)) {
        return null;
      }
      if (uploadError.type === "unknown_fields") {
        console.log("Match");
        return this.$t("modal.collection.metafile.unknown_fields", {
          field_names: this.$store.state.collection.uploadError.unknown_fields.join(
            ", "
          ),
        });
      }
      return null;
    },
  },
  methods: {
    upload() {
      this.$store.dispatch("collection/upload", this.collection);
      //   this.dialog = false;
    },
    checkImageFile() {
      const value = this.collection.image;

      if (value) {
        if (value.size < 200000000) {
          return true;
        }

        return this.$t("modal.search.file.rule");
      }

      return this.$t("field.required");
    },
    checkMetaFile() {
      const value = this.collection.meta;

      if (value) {
        if (value.size < 20000000) {
          return true;
        }

        return this.$t("modal.search.file.rule");
      }

      return this.$t("field.required");
    },
    checkLength(value) {
      if (value) {
        if (value.length < 5) {
          return this.$t("user.register.rules.min");
        }

        if (value.length > 25) {
          return this.$t("user.register.rules.max");
        }

        return true;
      }

      return this.$t("field.required");
    },
  },
  //   computed: {
  //     update() {
  //       return this.$store.state.error.date;
  //     },
  //   },
  //   watch: {
  //     update() {
  //       this.dialog = true;
  //     },
  //   },
};
</script>
