<template>
  <v-dialog
    v-model="dialog"
    max-width="350px"
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
          accept=".zip, .tar, .tar.gz, .tar.bz2, .tar.xz"
          :placeholder="$t('modal.collection.upload.imagefile.label')"
          prepend-icon="mdi-image-outline"
          :rules="[checkImageFile]"
          show-size
        ></v-file-input>

        <v-file-input
          v-model="collection.meta"
          accept=".csv, .json, .jsonl"
          :placeholder="$t('modal.collection.upload.metafile.label')"
          prepend-icon="mdi-text-box-outline"
          :rules="[checkMetaFile]"
          :error="errorMessage"
          :error-messages="errorMessage"
          show-size
        >
        </v-file-input>
      </v-card-text>
      <v-card-actions class="px-6 pb-6">
        <v-btn
          :disabled="disabled"
          @click="send"
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
import { keyInObj, repPlace } from "../plugins/helpers";
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
    errorMessage() {
      if (keyInObj('status', this.upload) && this.upload.status === "error") {
        const errorTypes = this.$t('modal.collection.upload.error');
        if (keyInObj(this.upload.error.type, errorTypes)) {
          if (this.upload.error.type === "unknown_fields") {
            return this.$t("modal.collection.upload.metafile.unknown", {
              field_names: this.upload.unknown_fields.join(", "),
            });
          }
          return errorTypes[this.upload.error.type];
        }
        return this.$t('modal.collection.upload.error.default');
      }
    },
    upload() {
      return this.$store.state.collection.upload;
    },
  },
  methods: {
    send() {
      this.$store.dispatch("collection/upload", this.collection);
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
        const text = this.$t("modal.search.file.rule");
        return repPlace({ file_size: 200 }, text);
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
    upload({ status }) {
      if (status === 'ok') {
        this.dialog = false;
        this.collection = {};
        const update = { modal: "list", value: true };
        this.$store.commit("collection/updateModal", update);
      }
    },
  },
};
</script>