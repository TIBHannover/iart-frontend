<template>
  <v-menu v-model="menu" min-width="350" max-width="350" max-height="600" offset-y bottom left open-on-hover :close-on-content-click="false">
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
            <div class="query">
              <span :title="title(item)" class="clip mr-1">{{ title(item) }}</span>
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
        const title = this.$t("drawer.history.query.filled");
        const values = [];

        item.query.forEach(({ value, label }) => {
          if (label) {
            values.push(label);
          } else {
            values.push(value);
          }
        });

        return `${title}: ${values.join(", ")}`;
      }

      return this.$t("drawer.history.query.empty");
    },
    date(item) {
      const date = new Date(item.date);
      
      const hours = date.getHours();
      let minutes = date.getMinutes();

      if (date.setHours(0, 0, 0, 0) === (new Date()).setHours(0, 0, 0, 0)) {
        if (minutes < 10) {
          return `${hours}:0${minutes}`;
        }

        return `${hours}:${minutes}`;
      }

      let month = date.toLocaleString("default", { month: "short" });

      if (navigator.language.startsWith("en-")) {
        return `${month}, ${date.getDate()}`;
      }

      return `${date.getDate()}. ${month}`;
    },
    filters(item) {
      let values = [];

      if (item.full_text && item.full_text.length) {
        const title = this.$t("drawer.filter.field")["full.text"];
        values.push(`${title}: ${item.full_text.join(", ")}`);
      }

      if (item.filters && Object.keys(item.filters).length) {
        Object.keys(item.filters).forEach((key) => {
          if (item.filters[key]) {
            const title = this.$t("drawer.filter.field")[key];
            const value = item.filters[key].join(", ");

            values.push(`${title}: ${value}`);
          }
        });
      }

      if (item.date_range && item.date_range.length) {
        const title = this.$t("drawer.filter.field")["meta.period"];
        values.push(`${title}: ${item.date_range.join("–")}`);
      }

      if (values.length) return `${values.join(" · ")}`;

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

.v-menu__content span.clip {
  max-width: 200px;
}

.history .v-list-item__content > button {
  opacity: 0;
}

.history .v-list-item__content:hover > button {
  opacity: 1;
}

.history .v-list-item__content .query {
   line-height: 1.25;
}

.history .v-list-item__content .query > span {
   display: inline-block;
   vertical-align: middle;
   max-width: 210px;
}
</style>
