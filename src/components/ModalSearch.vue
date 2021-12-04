<template>
  <v-dialog
    v-model="dialog"
    max-width="350px"
  >
    <template v-slot:activator="{ on }">
      <v-icon
        id="search-image"
        @click="dialog=true"
        v-on="on"
        :title="$t('modal.search.title')"
      >
        mdi-image-outline
      </v-icon>
    </template>

    <v-card>
      <v-card-title>
        <div class="text-h6">
          {{ $t("modal.search.title") }}
        </div>

        <v-btn
          icon
          @click.native="dialog=false"
          absolute
          top
          right
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-switch
          v-model="selectFile"
          class="pt-1 pb-2"
          :label="$t('modal.search.toggle')"
          color="secondary"
          inset
          hide-details
        ></v-switch>

        <v-file-input
          v-if="selectFile"
          v-model="user.file"
          accept="image/png, image/jpeg, image/gif"
          :placeholder="$t('modal.search.file.label')"
          prepend-icon="mdi-camera"
          :rules="[checkFile]"
          show-size
        ></v-file-input>
        <v-text-field
          v-else
          v-model="user.url"
          :rules="[checkURL]"
          :placeholder="$t('modal.search.url.label')"
          prepend-icon="mdi-link-variant"
          clearable
        ></v-text-field>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-menu
          offset-y
          bottom
          right
        >
          <template v-slot:activator="{ attrs, on: menu }">
            <v-btn
              v-bind="attrs"
              v-on="menu"
              :disabled="disabled"
              color="accent"
              block
              rounded
              depressed
            >
              {{ $t("button.submit") }}
            </v-btn>
          </template>

          <v-list class="pa-0">
            <v-list-item class="px-0 h44">
              <v-btn
                @click="search(false)"
                text
                block
                large
              >
                {{ $t("search.new") }}
              </v-btn>
            </v-list-item>

            <v-list-item class="px-0 h44">
              <v-btn
                @click="search(true)"
                text
                block
                large
              >
                {{ $t("search.append") }}
              </v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import isURL from 'validator/lib/isURL';

export default {
  data() {
    return {
      user: {},
      dialog: false,
      selectFile: false,
    };
  },
  props: ['value'],
  methods: {
    search(append) {
      const query = { positive: true, append };
      if (this.selectFile) {
        query.type = 'file';
        query.value = this.user.file;
      } else {
        query.type = 'url';
        query.value = this.user.url;
      }
      this.$store.dispatch('api/upload', query);
      this.dialog = false;
      this.user = {};
    },
    checkFile() {
      const value = this.user.file;
      if (value) {
        if (value.size < 2000000) {
          return true;
        }
        const text = this.$t('modal.search.file.rule');
        return this.repPlace({ file_size: 2 }, text);
      }
      return this.$t('field.required');
    },
    checkURL() {
      const value = this.user.url;
      if (value) {
        if (value.length && isURL(value)) {
          return true;
        }
        return this.$t('modal.search.url.rule');
      }
      return this.$t('field.required');
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
