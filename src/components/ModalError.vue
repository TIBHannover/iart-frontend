<template>
  <v-dialog
    v-model="dialog"
    max-width="450px"
  >
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.error.title") }}

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
        <div v-if="origin==='search'" class="mb-4">
          {{ $t("modal.error.text.search") }}
        </div>
        <div v-if="origin==='upload'" class="mb-4">
          {{ $t("modal.error.text.upload") }}
        </div>
        <div v-if="origin==='login'" class="mb-4">
          {{ $t("modal.error.text.login") }}
        </div>
        <div v-if="origin==='logout'" class="mb-4">
          {{ $t("modal.error.text.logout") }}
        </div>
        <div v-if="origin==='register'" class="mb-4">
          {{ $t("modal.error.text.register") }}
        </div>

        <v-btn
          color="primary"
          width="50%"
          plain
          @click="reload"
        >
          {{ $t("button.reload") }}
        </v-btn>
        <v-btn
          color="grey"
          width="50%"
          plain
          @click="dialog=false"
        >
          {{ $t("button.cancel") }}
        </v-btn>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
    };
  },
  methods: {
    reload() {
      window.location.reload();
      this.dialog = false;
    },
  },
  computed: {
    update() {
      return this.$store.state.error.date;
    },
    origin() {
      return this.$store.state.error.origin;
    },
  },
  watch: {
    update() {
      this.dialog = true;
    },
  },
};
</script>
