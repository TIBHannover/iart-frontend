<template>
  <v-app id="search">
    <v-app-bar app flat>
      <v-layout row>
        <div class="logo ml-3 mr-5" @click="reset">
          <img :title="appName" src="/assets/images/logo.png" />
        </div>

        <SearchBar />

        <v-btn
          :title="$t('drawer.filter.title')"
          @click="toggleDrawer('filter')"
          class="ml-1"
          icon
        >
          <span id="filter-general">
            <v-badge v-if="nFilters" color="accent" :content="nFilters">
              <v-icon>mdi-tune</v-icon>
            </v-badge>
            <v-icon v-else>mdi-tune</v-icon>
          </span>
        </v-btn>

        <v-btn
          :title="$t('drawer.settings.title')"
          @click="toggleDrawer('settings')"
          class="ml-n2"
          icon
        >
          <span id="settings-general">
            <v-icon>mdi-cog-outline</v-icon>
          </span>
        </v-btn>

        <History />
        <UserMenu />
      </v-layout>
    </v-app-bar>

    <DrawerSettings />
    <Main />
    <DrawerFilter />
    <HelpButton />
    <Footer />
  </v-app>
</template>

<script>
import { keyInObj, isEqual } from "@/plugins/helpers";
import Main from "@/components/Main.vue";
import History from "@/components/History.vue";
import UserMenu from "@/components/UserMenu.vue";
import SearchBar from "@/components/SearchBar.vue";
import HelpButton from "@/components/HelpButton.vue";
import DrawerFilter from "@/components/DrawerFilter.vue";
import DrawerSettings from "@/components/DrawerSettings.vue";
import Footer from "@/components/Footer.vue";
export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
    };
  },
  methods: {
    load() {
      this.$store.dispatch("api/load");
    },
    reset() {
      this.$store.commit("api/removeAllFilters");
      this.$store.commit("api/updateQuery", []);
      this.$store.dispatch("api/load");
    },
    toggleDrawer(value) {
      this.$store.commit("user/toggleDrawer", value);
    },
  },
  computed: {
    filters() {
      return this.$store.state.api.filters;
    },
    nFilters() {
      const { filters, dateRange, fullText } = this.$store.state.api;
      let total = Object.values(filters).reduce(
        (t, values) => t + values.length,
        0
      );
      if (dateRange.length) total += 1;
      total += fullText.length;
      return total;
    },
    dateRange() {
      return this.$store.state.api.dateRange;
    },
    fullText() {
      return this.$store.state.api.fullText;
    },
    settings() {
      return this.$store.state.api.settings;
    },
    bookmarks() {
      return this.$store.state.bookmark.toggle;
    },
  },
  watch: {
    filters: {
      handler() {
        this.load();
      },
      deep: true,
    },
    nFilters() {
      this.load();
    },
    dateRange() {
      this.load();
    },
    fullText() {
      this.load();
    },
    bookmarks() {
      this.load();
    },
    settings: {
      handler(newValues, oldValues) {
        if (keyInObj("n", newValues.cluster)) {
          if (
            !keyInObj("n", oldValues.cluster) ||
            newValues.cluster.n !== oldValues.cluster.n ||
            newValues.cluster.type !== oldValues.cluster.type
          ) {
            this.load();
            return;
          }
        }
        if (keyInObj("viewType", newValues.layout)) {
          if (
            newValues.layout.viewType === "umap" &&
            (oldValues.layout.viewType !== "umap" ||
              newValues.layout.viewGrid !== oldValues.layout.viewGrid)
          ) {
            this.load();
            return;
          }
        }
        if (
          !isEqual(newValues.weights, oldValues.weights) &&
          (!isEqual(newValues.weights, { clip_embedding_feature: 1 }) ||
            !isEqual(oldValues.weights, {}))
        ) {
          this.load();
          return;
        }
      },
      deep: true,
    },
  },
  mounted() {
    window.onpopstate = () => {
      this.$store.dispatch("api/setState", this.$route.query);
      this.$store.commit("api/toggleBackBtn");
    };
  },
  components: {
    Main,
    History,
    UserMenu,
    SearchBar,
    HelpButton,
    DrawerFilter,
    DrawerSettings,
    Footer,
  },
};
</script>

<style>
#search .logo {
  align-items: center;
  cursor: pointer;
  display: flex;
}

#search .logo > img {
  max-height: 28px;
}
</style>