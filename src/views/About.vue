<template>
  <v-app>
    <v-app-bar app flat>
      <v-layout row>
        <div class="logo ml-3 mr-5" @click="reset">
          <img :title="appName" src="/assets/images/logo.png" />
        </div>

        <SearchBar />
        <div style="margin-left: auto"></div>
        <History />
        <UserMenu />
        <v-btn
          to="/about"
          icon
          class="ml-n2"
          :title="$t('drawer.history.title')"
        >
          <v-icon>mdi-information</v-icon>
        </v-btn>
      </v-layout>
    </v-app-bar>

    <v-main>
      <v-layout style="height: 100%" justify-center align-center>
        <v-col cols="10">
          <v-row class="mb-10" justify="center">
            <div class="logo-about">
              <img src="/assets/images/logo_dfg.svg" />
            </div>
            <div class="logo-about">
              <img src="/assets/images/logo_lmu.svg" />
            </div>
            <div class="logo-about">
              <img src="/assets/images/logo_tib.svg" />
            </div>
            <div class="logo-about">
              <img src="/assets/images/logo_paderborn.svg" />
            </div>
          </v-row>
          <v-row class="mb-10" justify="center">
            <v-col justify="center">
              <h2>About the project</h2>
              <p style="text-align: justify">
                Within the project “iART”, an e-research tool is being developed
                for the utilisation and evaluation of image data in
                humanities-related research processes. The aim of “iART” is to
                optimise research in electronic image databases and thus
                increase the performance of existing scientific information
                systems.
              </p>

              <h2>Consortium</h2>
              <h3>TIB</h3>
              <p style="text-align: justify">
                Acting in the capacity of the German National Library of Science
                and Technology, as well as architecture, chemistry, computer
                science, mathematics and physics, the TIB – Leibniz Information
                Centre for Science and Technology and University Library
                provides academia, research and business with literature and
                information. Its remit is to preserve recorded knowledge and to
                provide the latest information, both now and in the future,
                irrespective of the time and the place. TIB is actively engaged
                in promoting Open Access and thus supports unrestricted, free
                access to scientific information. In its capacity as a
                University Library, TIB ensures that all faculties of Leibniz
                Universität Hannover are supplied with information.
              </p>
              <h3>Universität Paderborn</h3>
              <p style="text-align: justify">
                Paderborn University is the University for the Information
                Society. Our strong foundation in computer science and its
                applications, as well as the importance of IT for a growing
                number of disciplines, are the pillars for this claim. But we
                want to achieve more: we want to contribute to the scientific
                and technical development of the information society,
                simultaneously critically reflecting these developments by
                taking into account the history, norms and values of our
                society. To achieve this, we need the spectrum from “hard”
                sciences to the arts and humanities to complement and learn from
                each other.
              </p>
              <h3>Ludwig-Maximilians-Universität München</h3>
              <p style="text-align: justify">
                The Ludwig-Maximilians-Universität München - the University in
                the heart of Munich. LMU is recognized as one of Europe's
                premier academic and research institutions. Since our founding
                in 1472, LMU has attracted inspired scholars and talented
                students from all over the world, keeping the University at the
                nexus of ideas that challenge and change our complex world.
              </p>

              <h2>Acknowledgements</h2>
              <p style="text-align: justify">
                This work was partly funded by the German Research Foundation
                (DFG) under project number 415796915. We thank the participants
                in the retrieval study for their valuable contributions.
              </p>
              <h2>Contacts</h2>
              <p style="text-align: justify">
                Matthias Springstein:
                <a href="mailto:matthias.springstein@tib.eu">
                  matthias.springstein@tib.eu</a
                >
              </p>
            </v-col>
          </v-row>
        </v-col>
      </v-layout>
    </v-main>

    <HelpButton />
    <Footer />
  </v-app>
</template>

<script>
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
  },
  computed: {
    filters() {
      return this.$store.state.api.filters;
    },
  },
  watch: {
    filters: {
      handler() {
        this.load();
      },
      deep: true,
    },
  },
  components: {
    Footer: () => import("@/components/Footer.vue"),
    History: () => import("@/components/History.vue"),
    UserMenu: () => import("@/components/UserMenu.vue"),
    SearchBar: () => import("@/components/SearchBar.vue"),
    HelpButton: () => import("@/components/HelpButton.vue"),
  },
};
</script>

<style scoped>
.logo {
  align-items: center;
  cursor: pointer;
  display: flex;
}

.logo > img {
  max-height: 28px;
}

.logo-about {
  align-items: center;
  cursor: pointer;
  display: flex;
}

h2 {
  margin-bottom: 10px;
  display: block;
}
h3 {
  margin-bottom: 2px;
  display: block;
}

.logo-about > img {
  max-height: 56px;
  margin-left: 7px;
  margin-right: 7px;
}
</style>
