<template>
  <v-btn 
    :title="$t('help.title')" @click="help" class="help"
    color="accent" fixed fab large bottom right
  >
    <v-icon>mdi-help</v-icon>
  </v-btn>
</template>

<script>
export default {
  methods: {
    help() {
      const { path } = this.$router.currentRoute;
      this.$store.commit("user/updateAllDrawers", true);

      const steps = [
        {
          intro: this.$t("help.search.general"),
          element: "#search-general",
          tooltipClass: path === "/search" ? "move-top8" : "",
          highlightClass: path === "/search" ? "move-top8" : "",
          disableInteraction: true,
        },
        {
          intro: this.$t("help.search.image"),
          element: "#search-image",
          tooltipClass: path === "/search" ? "move-top12" : "",
          highlightClass: path === "/search" ? "move-top12" : "",
          disableInteraction: true,
        },
        {
          intro: this.$t("help.search.random"),
          element: "#search-random",
          tooltipClass: path === "/search" ? "move-top12" : "",
          highlightClass: path === "/search" ? "move-top12" : "",
          disableInteraction: true,
        },
      ];

      if (path === "/search") {
        steps.push(...[
          {
            intro: this.$t("help.filter.general"),
            element: "#filter-general",
            disableInteraction: true,
          },
          {
            intro: this.$t("help.filter.period"),
            element: ".v-navigation-drawer .date-range",
            disableInteraction: true,
          },
          {
            intro: this.$t("help.settings.general"),
            element: "#settings-general",
            disableInteraction: true,
          },
          {
            intro: this.$t("help.settings.weights"),
            element: "#weights-col",
            disableInteraction: true,
            tooltipClass: "move-right",
            position: "right",
          },
          {
            intro: this.$t("help.settings.layout"),
            element: "#layout-col",
            disableInteraction: true,
            tooltipClass: "move-right",
            position: "right",
          },
          {
            intro: this.$t("help.settings.cluster"),
            element: "#cluster-col",
            disableInteraction: true,
            position: "left",
          },
        ]);
      }

      window.scrollTo(0, 0);

      this.$intro().addSteps(steps)
      .onbeforechange((el) => {
        let modal = { modal: null, value: false };
        this.$store.commit("user/updateAllModals", false);

        switch (el.id) {
          case "weights-col":
            modal = { modal: "weights", value: true };
            this.$store.commit("user/updateModal", modal);

            break;
          case "layout-col":
            modal = { modal: "layout", value: true };
            this.$store.commit("user/updateModal", modal);

            break;
          case "cluster-col":
            modal = { modal: "cluster", value: true };
            this.$store.commit("user/updateModal", modal);
        }
      })
      .onexit(() => {
        this.$store.commit("user/updateAllModals", false);
      })
      .start()
    },
  },
};
</script>

<style>
.help.v-btn {
  z-index: 99;
}

.help.v-btn--fab.v-size--large.v-btn--absolute.v-btn--bottom {
  bottom: 0;
}
</style>
