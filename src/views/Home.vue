<template>
  <v-app>
    <v-app-bar app flat>
      <v-layout row>
        <div class="logo ml-3 mr-5">
          <img src="/assets/images/logo.png" />
        </div>

        <v-combobox v-model="query" @click:clear="remove(-1)" @keyup.enter="submit" placeholder="Start Typing To Search" class="mx-1" rounded solo hide-details flat clearable multiple>
          <template v-slot:prepend-inner>
            <v-icon @click="submit">mdi-magnify</v-icon>
            <v-icon title="Random Search" @click="random" class="ml-1">mdi-slot-machine-outline</v-icon>
          </template>

          <template v-slot:selection="{ attrs, selected, item, index }">
            <v-chip v-on="on" v-bind="attrs" :input-value="selected" @click:close="remove(index)" close>
              <v-btn v-if="item.positive" @click="toggle(index)" title="Set As Negative Query" font-size="18" class="ml-n2" icon small>
                <v-icon>mdi-plus</v-icon>
              </v-btn>
              <v-btn v-else @click="toggle(index)" title="Set As Positive Query" font-size="18" class="ml-n2" icon small>
                <v-icon>mdi-minus</v-icon>
              </v-btn>

              {{ item.value }}
            </v-chip>
          </template>
        </v-combobox>

        <v-btn @click="filterDrawer=!filterDrawer" title="Refine Results" class="ml-1" icon>
          <v-badge v-if="nFilters" color="accent" :content="nFilters">
            <v-icon>mdi-tune</v-icon>
          </v-badge>
          <v-icon v-else>mdi-tune</v-icon>
        </v-btn>

        <v-btn @click="settingsDrawer=!settingsDrawer" title="Settings" class="ml-n2" icon>
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>
      </v-layout>
    </v-app-bar>

    <SettingsDrawer v-model="settingsDrawer" :margin="filterDrawer" />

    <Grid />
    <Loader />

    <FilterDrawer v-model="filterDrawer" />
    <SearchImage v-model="dialog" @search="submit" />
  </v-app>
</template>

<script>
import Grid from '@/components/Grid.vue';
import Loader from '@/components/Loader.vue';
import SearchImage from '@/components/SearchImage.vue';
import FilterDrawer from '@/components/FilterDrawer.vue';
import SettingsDrawer from '@/components/SettingsDrawer.vue';

export default {
  data() {
    return {
      dialog: false,
      filterDrawer: false,
      settingsDrawer: false,
      query: this.$store.state.api.query,
    };
  },
  methods: {
    submit() {
      this.$store.commit('updateRandom', false);
      this.$store.dispatch('load');
    },
    random() {
      this.$store.commit('updateRandom', true);
      this.$store.dispatch('load');
    },
    remove(index) {
      if (index === -1) {
        this.query = [];
      } else {
        this.query.splice(index, 1);
      }
    },
    insert() {
      const params = { data: this.data };
      this.$store.dispatch('insert', params);
    },
    toggle(index) {
      const value = this.query[index].positive;
      this.query[index].positive = !value;
    },
  },
  computed: {
    nFilters() {
      const { filters, dateRange } = this.$store.state.api;
      let total = Object.values(filters).reduce(
        (t, values) => t + values.length, 0,
      );

      if (dateRange.length) total += 1;

      return total;
    },
    dateRange() {
      return this.$store.state.api.dateRange;
    },
    data() {
      return this.$store.state.api.index;
    },
    updateQuery() {
      return this.$store.state.api.query;
    },
  },
  watch: {
    nFilters() {
      this.submit();
    },
    dateRange() {
      this.submit();
    },
    data() {
      this.insert();
      this.submit();
    },
    query: {
      handler(values, prev_values) {
        if (values.length !== prev_values.length) {
          this.query = values.map((value) => {
            if (typeof value === 'string') {
              let positive = true;

              if (value.charAt(0) === '-') {
                value = value.slice(1);
                positive = false;
              }

              value = { type: 'txt', positive, value };
            }

            return value;
          });
        }

        this.$store.commit('updateQuery', this.query);
      },
      deep: true,
    },
    updateQuery: {
      handler(values) {
        this.query = values;

        if (this.$store.state.api.random === null) {
          this.submit();
        }
      },
      deep: true,
    },
  },
  created() {
    this.$store.dispatch('setState', this.$route.query);
  },
  mounted() {
    const self = this;

    window.onpopstate = function () {
      self.$store.dispatch('setState', self.$route.query);
      self.$store.commit('toggleBackBtn');
    };
  },
  components: {
    Grid,
    Loader,
    SearchImage,
    FilterDrawer,
    SettingsDrawer,
  },
};
</script>

<style>
.v-chip .v-avatar {
  padding-top: 3px;
}

.v-input .v-btn {
  letter-spacing: 1;
}

.v-application--is-ltr .v-text-field.v-text-field .v-input__prepend-inner {
  padding-right: 9px;
}

.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
  transform: rotate(0deg);
}

.v-autocomplete:not(.v-input--is-focused).v-select--chips input {
  max-height: 25px !important;
}

.logo {
  align-items: center;
  display: flex;
}

.logo > img {
  max-height: 28px;
}

.theme--light.v-chip,
.theme--light.v-sheet,
.theme--light.v-application,
.theme--light.v-expansion-panels .v-expansion-panel,
.theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled) {
  color: #1D3557 !important;
}

.theme--light.v-icon {
  color: rgba(69, 123, 157, 0.54);
}

.v-input__icon--append .theme--light.v-icon:not(.mdi-menu-down),
.v-input__prepend-inner .theme--light.v-icon {
  color: rgba(0, 0, 0, 0.54);
}
</style>
