<template>
  <v-app>
    <v-app-bar app flat>
      <v-layout row>
        <div class="logo ml-3 mr-5">
          <img src="/assets/images/logo.png" />
        </div>

        <v-combobox 
          v-model="query" @click:clear="remove(-1)" @keyup.enter="submit(random=false)"
          :placeholder="$t('home.search.placeholder')" class="mx-1" allow-overflow 
          rounded solo hide-details flat clearable multiple single-line
        >
          <template v-slot:prepend-inner>
            <v-icon @click="submit">mdi-magnify</v-icon>
            <v-icon 
              :title="$t('search.random')" @click="submit(random=true)" 
              class="ml-1"
            >
              mdi-slot-machine-outline
            </v-icon>
          </template>

          <template v-slot:append>
            <ModalSearch @search="submit" />
          </template>

          <template v-slot:selection="{ attrs, selected, item, index }">
            <v-menu 
              v-model="weightDialog[index]" :close-on-content-click="false" 
              offset-y bottom right open-on-hover
            >
              <template v-slot:activator="{ on }">
                <v-chip 
                  v-on="on" v-bind="attrs" :input-value="selected" 
                  @click:close="remove(index)" close
                >
                  <v-btn 
                    v-if="item.positive" @click="toggle(index)" 
                    :title="$t('home.search.query.negative')" 
                    font-size="18" class="ml-n2" icon small
                  >
                    <v-icon>mdi-plus</v-icon>
                  </v-btn>
                  <v-btn 
                    v-else @click="toggle(index)" 
                    :title="$t('home.search.query.positive')" 
                    font-size="18" class="ml-n2" icon small
                  >
                    <v-icon>mdi-minus</v-icon>
                  </v-btn>

                  <v-icon v-if="item.type==='idx'" class="mr-1">
                    mdi-file-image-outline
                  </v-icon>
                  <v-icon v-else class="mr-1">
                    mdi-file-document-outline
                  </v-icon>

                  <span v-if="item.type==='idx'" :title="item.label">
                    {{ item.label }}
                  </span>
                  <span v-else :title="item.value">
                    {{ item.value }}
                  </span>
                </v-chip>
              </template>

              <Weights 
                v-if="item.type==='idx'" :default="item.weights" 
                :local="true" :key="item" :visible="weightDialog[index]"
                @update="updateWeights(index, ...arguments)" 
              />
            </v-menu>
          </template>
        </v-combobox>

        <v-btn 
          @click="toggleDrawer('filter')" :title="$t('drawer.filter.title')" 
          class="ml-1" icon
        >
          <v-badge v-if="nFilters" color="accent" :content="nFilters">
            <v-icon>mdi-tune</v-icon>
          </v-badge>
          <v-icon v-else>mdi-tune</v-icon>
        </v-btn>

        <v-btn 
          @click="toggleDrawer('settings')" 
          :title="$t('drawer.settings.title')" class="ml-n2" icon
        >
          <v-icon>mdi-cog-outline</v-icon>
        </v-btn>

        <History />
        <UserMenu />
      </v-layout>
    </v-app-bar>

    <DrawerSettings />
    <Main />
    <Loader />
    <DrawerFilter />
    <ModalCookies />
  </v-app>
</template>

<script>
import { isEqual } from "@/plugins/helpers";

import Main from "@/components/Main.vue";
import Loader from "@/components/Loader.vue";
import History from "@/components/History.vue";
import Weights from "@/components/Weights.vue";
import UserMenu from "@/components/UserMenu.vue";
import ModalSearch from "@/components/ModalSearch.vue";
import ModalCookies from "@/components/ModalCookies.vue";
import DrawerFilter from "@/components/DrawerFilter.vue";
import DrawerSettings from "@/components/DrawerSettings.vue";

export default {
  data() {
    return {
      weightDialog: {},
      query: this.$store.state.api.query,
    };
  },
  methods: {
    submit(random = false) {
      this.$store.commit("api/updateRandom", random);
      this.$store.dispatch("api/load");
    },
    load() {
      this.$store.dispatch("api/load");
    },
    remove(index) {
      if (index === -1) {
        this.query = [];
      } else {
        this.query.splice(index, 1);
      }
    },
    toggle(index) {
      const value = this.query[index].positive;
      this.query[index].positive = !value;
    },
    toggleDrawer(value) {
      this.$store.commit("user/toggleDrawer", value);
    },
    updateWeights(index, value) {
      this.query[index].weights = value;
    },
  },
  computed: {
    nFilters() {
      const { filters, dateRange, fullText } = this.$store.state.api;

      let total = Object.values(filters).reduce(
        (t, values) => t + values.length, 0
      );

      if (dateRange.length) total += 1;
      total += fullText.length

      return total;
    },
    dateRange() {
      return this.$store.state.api.dateRange;
    },
    fullText() {
      return this.$store.state.api.fullText;
    },
    layout() {
      return this.$store.state.api.settings.layout;
    },
    updateQuery() {
      return this.$store.state.api.query;
    },
  },
  watch: {
    nFilters() {
      this.load();
    },
    dateRange() {
      this.load();
    },
    fullText() {
      this.load()
    },
    layout(new_value, old_value) {
      if (new_value !== old_value && new_value === "umap") {
        this.load();
      }
    },
    query: {
      handler(new_values, old_values) {
        if (!isEqual(new_values.length, old_values.length)) {
          this.query = new_values.map((value) => {
            if (typeof value === "string") {
              let positive = true;

              if (value.charAt(0) === "-") {
                value = value.slice(1);
                positive = false;
              }

              value = { type: "txt", positive, value };
            }

            return value;
          });

          this.$store.commit("api/updateQuery", this.query);
        }
      },
      deep: true,
    },
    updateQuery: {
      handler(values) {
        this.query = values;

        if (!this.$store.state.api.random && values.length) {
          this.submit();
        }
      },
      deep: true,
    },
  },
  created() {
    const self = this;
    
    this.$store.dispatch("user/getCSRFToken").then(function () {
      setTimeout(() => self.$store.dispatch("api/setState", self.$route.query), 500);
    });
  },
  mounted() {
    const self = this;

    window.onpopstate = function () {
      self.$store.dispatch("api/setState", self.$route.query);
      self.$store.commit("api/toggleBackBtn");
    };
  },
  components: {
    Main,
    Loader,
    History,
    Weights,
    UserMenu,
    ModalSearch,
    ModalCookies,
    DrawerFilter,
    DrawerSettings,
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

header .v-autocomplete {
  max-width: calc(100% - 335px);
}

.v-autocomplete:not(.v-input--is-focused).v-select--chips input {
  max-height: 25px !important;
}

header
  .v-autocomplete
  .v-text-field.v-text-field--solo
  .v-input__control
  input {
  max-width: fit-content;
  min-width: 0;
}

header .v-autocomplete .v-select__selections {
  -ms-overflow-style: none;
  scrollbar-width: none;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}

header .v-autocomplete .v-select__selections::-webkit-scrollbar {
  height: 0;
  width: 0;
}

header .v-autocomplete .v-select__selections > .v-chip {
  overflow: initial;
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
.theme--light.v-input input,
.theme--light.v-application,
.theme--light.v-expansion-panels .v-expansion-panel,
.theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled),
.v-card.login .v-btn.register,
.v-banner .v-btn--text:hover .v-icon {
  color: #1d3557 !important;
}

.theme--light.v-icon,
.v-dialog .v-expansion-panel-content__wrap .capitalize {
  color: rgba(69, 123, 157, 0.54);
}

.v-input__icon--append .theme--light.v-icon:not(.mdi-menu-down),
.v-input__prepend-inner .theme--light.v-icon {
  color: rgba(0, 0, 0, 0.54);
}
</style>
