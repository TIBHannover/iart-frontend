<template>
  <v-navigation-drawer
    v-model="drawer"
    width="350"
    app
    right
    hide-overlay
    disable-resize-watcher
  >
    <v-toolbar flat class="v-bar--underline">
      <v-toolbar-title>{{ $t("drawer.filter.title") }}</v-toolbar-title>

      <div class="v-btn--absolute v-btn--right">
        <v-btn
          @click="removeAllFilters"
          :title="$t('drawer.filter.remove')"
          icon
        >
          <v-icon>mdi-trash-can-outline</v-icon>
        </v-btn>

        <v-btn @click="close" class="ml-n2" icon>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>
    </v-toolbar>

    <v-container class="ml-1 mt-n1">
      <div v-for="(count, index) in counts" :key="index">
        <label
          v-if="notEmpty(count.field)"
          class="v-label v-label--active theme--light ml-6"
          >{{ $t("drawer.filter.field")[count.field] }}</label
        >

        <v-autocomplete
          v-model="data[count.field]"
          item-value="name"
          :items="count.entries"
          :label="$t('drawer.filter.field')[count.field]"
          :disabled="!count.entries.length"
          :filter="filterAutocomplete"
          @click:clear="remove(-1, count.field)"
          class="mb-4"
          background-color="grey lighten-4"
          solo
          rounded
          hide-details
          hide-selected
          flat
          clearable
          multiple
        >
          <template v-slot:item="{ on, item }">
            <v-list-item v-on="on">
              <v-list-item-content>
                <v-list-item-title class="meta">
                  <div :title="item.name">{{ item.name }}</div>
                  <div
                    class="ml-3"
                    :title="item.count + ' ' + $t('drawer.filter.objects')"
                  >
                    ({{ item.count }})
                  </div>
                </v-list-item-title>
              </v-list-item-content>
            </v-list-item>
          </template>

          <template v-slot:selection="{ attrs, selected, item }">
            <v-chip
              v-bind="attrs"
              :input-value="selected"
              @click:close="remove(item.name, count.field)"
              close
            >
              <span :title="item.name">{{ item.name }}</span>
            </v-chip>
          </template>
        </v-autocomplete>
      </div>

      <div class="date-range mb-4">
        <v-layout row class="mx-6 ma-1">
          <label class="v-input v-label v-label--active theme--light">
            {{ $t("drawer.filter.field['meta.period']") }}
          </label>

          <v-btn
            v-if="dateToggle"
            @click="dateToggle = false"
            :title="$t('drawer.filter.period.hide')"
            icon
            small
          >
            <v-icon>mdi-eye-off-outline</v-icon>
          </v-btn>
          <v-btn
            v-else
            @click="dateToggle = true"
            :title="$t('drawer.filter.period.show')"
            icon
            small
          >
            <v-icon>mdi-eye-outline</v-icon>
          </v-btn>
        </v-layout>

        <v-range-slider
          v-if="dateToggle"
          v-model="dateRange"
          min="1000"
          max="2000"
          color="secondary"
          :disabled="!dateToggle"
          @end="commitDateRange"
          hide-details
        >
          <template v-slot:prepend>
            <v-text-field
              :value="dateRange[0]"
              type="number"
              class="mt-0 pt-0"
              background-color="grey lighten-4"
              style="width: 85px"
              @change="$set(dateRange, 0, $event)"
              hide-details
              single-line
              rounded
              flat
            ></v-text-field>
          </template>

          <template v-slot:append>
            <v-text-field
              :value="dateRange[1]"
              type="number"
              class="mt-0 pt-0"
              background-color="grey lighten-4"
              style="width: 85px"
              @change="$set(dateRange, 1, $event)"
              hide-details
              single-line
              rounded
              flat
            ></v-text-field>
          </template>
        </v-range-slider>
      </div>
    </v-container>
  </v-navigation-drawer>
</template>

<script>
export default {
  data() {
    return {
      data: {},
      dateToggle: false,
      dateRange: [1400, 1900],
      drawer: this.$store.state.user.drawer.filter,
    };
  },
  methods: {
    close() {
      this.$store.commit("user/toggleDrawer", "filter");
    },
    remove(value, field) {
      this.$store.commit("api/removeFilter", { value, field });
    },
    removeAllFilters() {
      this.$store.commit("api/removeAllFilters");
    },
    commitDateRange() {
      this.$store.commit("api/updateDateRange", this.dateRange);
    },
    filterAutocomplete(item, queryText) {
      const key = item.name.toLocaleLowerCase();
      const query = queryText.toLocaleLowerCase();

      return key.indexOf(query) > -1;
    },
    notEmpty(field) {
      if (Object.prototype.hasOwnProperty.call(this.data, field)) {
        if (this.data[field].length) {
          return true;
        }
      }

      return false;
    },
  },
  computed: {
    counts() {
      return this.$store.state.api.counts;
    },
    filters() {
      return this.$store.state.api.filters;
    },
    toggle() {
      return this.$store.state.user.drawer.filter;
    },
    updateDateToggle() {
      return this.$store.state.api.dateRange.length;
    },
  },
  watch: {
    filters: {
      handler(filters) {
        this.data = filters;
      },
      deep: true,
    },
    data: {
      handler(data) {
        Object.keys(data).forEach((field) => {
          data[field].forEach((value) => {
            this.$store.commit("api/addFilter", { value, field });
          });
        });
      },
      deep: true,
    },
    toggle(value) {
      this.drawer = value;
    },
    drawer(value) {
      if (!value && this.$store.state.user.drawer.filter) {
        this.$store.commit("user/toggleDrawer", "filter");
      }
    },
    dateToggle(value) {
      if (value) {
        this.$store.commit("api/updateDateRange", this.dateRange);
      } else {
        this.$store.commit("api/updateDateRange", []);
      }
    },
    updateDateToggle(value) {
      if (value === 0) {
        this.dateToggle = false;
      }
    },
  },
  created() {
    const { dateRange } = this.$store.state.api;

    if (dateRange.length) {
      this.dateRange = dateRange;
      this.dateToggle = true;
    }

    this.data = this.filters;
  },
};
</script>

<style>
.v-navigation-drawer:not(.v-navigation-drawer--close) {
  box-shadow: 0 8px 10px -5px rgb(0 0 0 / 20%), 0 16px 24px 2px rgb(0 0 0 / 14%),
    0 6px 30px 5px rgb(0 0 0 / 12%);
}

.container > div > label {
  font-size: 12px;
}

.date-range .row > label {
  align-items: center;
  font-size: 12px;
}

.v-select__slot label,
.container > div > label {
  text-transform: capitalize;
}

.v-select__slot .v-chip__content > span {
  text-overflow: ellipsis;
  max-width: 160px;
  overflow: hidden;
}

.v-select__selections {
  margin: 4px 0;
}

.v-menu__content {
  background-color: #fff;
}

.v-menu__content .v-list-item__title {
  display: flex;
  line-height: 1.5;
  white-space: inherit;
}

.v-menu__content .v-list-item__title.meta > div:first-child {
  max-width: 200px;
}

.v-menu__content .v-list-item__title.meta > div:last-child {
  text-align: right;
  flex-grow: 1;
  color: #bbb;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

input[type="number"] {
  -moz-appearance: textfield;
}
</style>
