<template>
  <v-menu v-model="menu" min-width="300" max-width="300" max-height="600" offset-y bottom left open-on-hover>
    <template v-slot:activator="{ attrs, on: menu }">
      <v-btn icon v-bind="attrs" v-on="menu" class="ml-n2" :title="$t('drawer.history.title')">
        <v-badge v-if="data.length" color="accent" :content="data.length">
          <v-icon>mdi-history</v-icon>
        </v-badge>
        <v-icon v-else>mdi-history</v-icon>
      </v-btn>
    </template>

    <v-list class="pa-0 history" v-if="data.length">
      <v-list-item-group>
        <v-list-item v-for="(item, index) in data">
          <v-list-item-content @click="submit(item, ...arguments)">
            <div style="line-height: 1.25;">
              <span>{{ title(item) }}</span>
              <span class="v-label theme--light"> · {{ date(item) }}</span>
            </div>

            <div :title="filters(item)" class="clip">
              <v-icon size="12" class="mr-2" small>mdi-tune</v-icon>
              <span style="font-size: 12px;">{{ filters(item) }}</span>
            </div>

            <v-btn @click="remove(item)" :title="$t('button.remove')" style="justify-content: center;" icon absolute right>
                <v-icon small>mdi-trash-can-outline</v-icon>
            </v-btn>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
export default {
  data() {
    return {
      menu: false,
    };
  },
  methods: {
    title(item) {
      if (item.random) {
        return this.$t("search.random");
      }

      if (item.query.length) {
        const values = item.query.map((x) => x.value);
        const title = this.$t("drawer.history.query.filled");

        return `${title}: ${values.join(", ")}`;
      }

      return this.$t("drawer.history.query.empty");
    },
    date(item) {
      const date = new Date(item.date);

      const hours = date.getHours();
      const minutes = date.getMinutes();

      if (date.setHours(0, 0, 0, 0) === (new Date()).setHours(0, 0, 0, 0)) {
        return `${hours}:${minutes}`;
      }

      const month = date.toLocaleString("default", { month: "short" });

      return `${date.getDate()}. ${month}.`;
    },
    filters(item) {
      if (Object.keys(item.filters).length) {
        const values = Object.keys(item.filters).map(
          (key) => `${this.$t("drawer.filter.field")[key]}: ${item.filters[key].join(", ")}`
        );

        return `${values.join(" · ")}`;
      }

      return this.$t("drawer.history.filter.empty");
    },
    remove(item) {
      this.$store.commit("user/removeHistory", item);
    },
    submit(item, event) {
      if (event.target.nodeName !== "I") {
        this.$store.commit("api/updateAll", item);
      }
    },
  },
  computed: {
    data() {
      return this.$store.state.user.history.slice(1);
    },
  },
};
</script>

<style>
.v-menu__content:empty {
  box-shadow: none;
}

.v-menu__content .clip {
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
}

.history .v-list-item__content:hover > div {
  max-width: 80%;
}

.history .v-list-item__content > button {
  opacity: 0;
}

.history .v-list-item__content:hover > button {
  opacity: 1;
}
</style>
