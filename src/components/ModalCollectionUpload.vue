<template>
  <v-dialog
    v-model="dialog"
    max-width="450px"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        class="register"
        text
        block
        large
      >
        {{ $t("modal.collection.upload.title") }}
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.collection.upload.title") }}

        <v-btn
          @click.native="dialog = false"
          absolute
          top
          right
          icon
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <!-- <div class="mb-4">{{ $t("modal.error.text") }}</div> -->

        <v-text-field
          v-model="collection.name"
          :placeholder="$t('modal.collection.upload.name')"
          counter="25"
          :rules="[checkLength]"
          clearable
        ></v-text-field>

        <v-file-input
          v-model="collection.image"
          accept="image/png, image/jpeg, image/gif, application/zip,application/x-tar, application/x-bzip2, application/gzip, application/x-xz, application/x-gtar"
          :placeholder="$t('modal.collection.upload.imagefile.label')"
          prepend-icon="mdi-image-outline"
          :rules="[checkImageFile]"
          show-size
        ></v-file-input>

        <v-file-input
          v-model="collection.meta"
          accept="text/csv, application/json, application/jsonl"
          :placeholder="$t('modal.collection.upload.metafile.label')"
          prepend-icon="mdi-text-box-outline"
          :rules="[checkMetaFile]"
          show-size
          :error="metaErrorMessage"
          :error-messages="metaErrorMessage"
        >
        </v-file-input>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-btn
          :disabled="disabled"
          @click="upload"
          color="accent"
          block
          rounded
          depressed
        >
          {{ $t("button.upload") }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import { keyInObj } from "../plugins/helpers";
export default {
  data() {
    return {
      dialog: false,
      collection: {},
    };
  },
  computed: {
    disabled() {
      if (this.collection && Object.keys(this.collection).length) {
        if (
          this.collection.name &&
          this.checkImageFile() === true &&
          this.checkMetaFile() === true
        ) {
          return false;
        }
      }
      return true;
    },
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
        return this.$t("modal.collection.upload.metafile.unknown", {
          field_names: this.$store.state.collection.uploadError.unknown_fields
            .join(", "),
        });
      }
      return null;
    },
  },
  methods: {
    upload() {
      this.$store.dispatch("collection/upload", this.collection);
      this.dialog = false;
    },
    checkImageFile() {
      const value = this.collection.image;
      if (value) {
        if (value.size < 200000000) {
          return true;
        }
        const text = this.$t("modal.search.file.rule");
        return repPlace({ file_size: 200 }, text);
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
  watch: {
    dialog(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
};
</script>