<template>
  <v-dialog
    v-model="dialog"
    max-width="750px"
  >
    <template v-slot:activator="{ on }">
      <v-btn
        v-on="on"
        text
        block
        large
      >
        <v-badge
          :content="data.length"
          :value="data.length > 0"
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
        <v-data-table
          :headers="headers"
          :footer-props="footerProps"
          :items="data"
          hide-default-footer
          multi-sort
        >
          <template v-slot:item.status="{ item }">
            <v-progress-circular
              v-if="item.status==='U'"
              :title="item.progress + '%'"
              indeterminate
              color="primary"
              width="1.25"
              size="15"
            ></v-progress-circular>
            <v-icon
              v-if="item.status==='R'"
              style="font-size: 20px;"
            >
              mdi-check-circle-outline
            </v-icon>
            <v-icon
              v-if="item.status==='E'"
              style="font-size: 20px;"
              color="accent"
            >
              mdi-alert-circle-outline
            </v-icon>
          </template>
          <template v-slot:item.date="{ item }">
            {{ toDate(item.date) }}
          </template>
          <template v-slot:item.actions="{ item }">
            <v-icon
              @click="showCollection(item)"
              :title="$t('button.show')"
              class="mr-2"
              small
            >
              mdi-eye-outline
            </v-icon>
            <v-icon
              @click="deleteCollection(item)"
              :title="$t('button.delete')"
              small
            >
              mdi-trash-can-outline
            </v-icon>
          </template>
        </v-data-table>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      dialog: false,
      checkInterval: null,
      headers: [
        { text: '', value: 'status', width: 10, sortable: false },
        { text: this.$t('modal.collection.list.table.name'), value: 'name' },
        { text: this.$t('modal.collection.list.table.count'), value: 'count', align: 'end', width: 150 },
        { text: this.$t('modal.collection.list.table.date'), value: 'date', align: 'end', width: 150 },
        { text: this.$t('modal.collection.list.table.actions'), value: 'actions', align: 'end', width: 100, sortable: false },
      ],
      footerProps: {
        'items-per-page-text': '',
      },
    };
  },
  methods: {
    toDate(item) {
      return new Date(item).toLocaleDateString();
    },
    showCollection() {
      // TODO
    },
    deleteCollection(item) {
      this.$store.dispatch('collection/delete', item);
    },
  },
  computed: {
    data() {
      return this.$store.state.collection.collections;
    },
    toggleModal() {
      return this.$store.state.collection.modal.list;
    },
  },
  watch: {
    data() {
      clearInterval(this.checkInterval);
      if (this.dialog) {
        this.checkInterval = setInterval(() => {
          this.$store.dispatch('collection/list');
        }, 5000);
      }
    },
    dialog(value) {
      if (value) {
        this.$store.dispatch('collection/list');
        this.$emit('close');
      }
    },
    toggleModal(value) {
      this.dialog = value;
    },
  },
};
</script>

<style scoped>
.v-data-footer__select > div {
  display: none;
}
</style>
