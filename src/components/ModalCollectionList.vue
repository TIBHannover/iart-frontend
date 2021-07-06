<template>
  <v-dialog
    v-model="dialog"
    max-width="900px"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        class="register"
        text
        block
        large
      >
        <v-badge
          :content="collections.length"
          :value="collections.length > 0"
          color="accent"
          inline
        >
          {{ $t("modal.collection.list.title") }}
        </v-badge>
      </v-btn>
    </template>
    <v-card>
      <v-card-title class="mb-2">
        {{ $t("modal.collection.list.title") }}

        <v-btn
          icon
          @click.native="dialog = false"
          absolute
          top
          right
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-card
          v-for="collection in data"
          :key="collection.id"
        >
          <v-card-title>{{ collection.name }}</v-card-title>
          <v-card-text>
            <p>{{ $t("modal.collections.count") }}: {{ collection.count }}</p>
            <p>
              {{ $t("modal.collections.time_added") }}:
              {{ new Date(collection.date).toLocaleDateString() }}
            </p>
          </v-card-text>
          <v-card-actions>
            <v-btn
              color="grey"
              width="50%"
              plain
              @click="dialog = false"
            >
              {{ $t("button.show") }}
            </v-btn>
            <v-btn
              color="grey"
              width="50%"
              plain
              @click="dialog = false"
            >
              {{ $t("button.delete") }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import { keyInObj } from "../plugins/helpers";
export default {
  data() {
    return {
      dialog: false,
    };
  },
  computed: {
    data() {
      return this.$store.state.collection.collections;
    },
  },
  methods: {},
  watch: {
    dialog(value) {
      if (value) {
        this.$emit("close");
      }
    },
  },
};
</script>