<template>
  <v-app>
    <v-app-bar
      color="white"
      app
      flat
    >
      <v-layout
        class="mx-n2"
        justify-end
      >
        <History />
        <UserMenu />
      </v-layout>
    </v-app-bar>

    <v-main>
      <v-layout
        style="height: 100%"
        justify-center
        align-center
      >
        <v-col cols="6">
          <v-row
            class="mb-10"
            justify="center"
          >
            <div class="logo">
              <img :title="appName" src="/assets/images/logo.png" />
            </div>
          </v-row>

          <v-row class="mb-4">
            <SearchBar />
          </v-row>
        </v-col>
      </v-layout>
    </v-main>

    <HelpButton />
    <Footer />
  </v-app>
</template>

<script>
import History from '@/components/History.vue';
import UserMenu from '@/components/UserMenu.vue';
import SearchBar from '@/components/SearchBar.vue';
import HelpButton from '@/components/HelpButton.vue';
import Footer from '@/components/Footer.vue';

export default {
  data() {
    return {
      appName: process.env.VUE_APP_NAME,
    };
  },
  components: {
    History,
    UserMenu,
    SearchBar,
    HelpButton,
    Footer,
  },
};
</script>

<style scoped>
.logo > img {
  max-height: 56px;
}
</style>
