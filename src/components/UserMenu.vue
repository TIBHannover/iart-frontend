<template>
  <v-menu v-model="menu" min-width="175" offset-y bottom left open-on-hover>
    <template v-slot:activator="{ attrs, on: menu }">
      <v-btn icon v-bind="attrs" v-on="menu" class="ml-n2" :title="$t('user.menu.title')">
        <v-icon color="primary">mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <v-list class="pa-0">
      <v-list-item v-if="!loggedIn" class="px-0 h44"><UserLogin @close="menu=false" /></v-list-item>
      <v-list-item v-if="!loggedIn" class="px-0 h44"><UserRegister @close="menu=false" /></v-list-item>

      <v-list-item v-if="loggedIn" class="px-0 h44">
        <v-btn @click="logout" text block large>
          Logout
        </v-btn>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import UserLogin from '@/components/UserLogin.vue';
import UserRegister from '@/components/UserRegister.vue';

export default {
  data() {
    return {
      menu: false,
    };
  },
  methods: {
    logout() {
      this.$store.dispatch('logout');
    },
  },
  computed: {
    loggedIn() {
      const { userData } = this.$store.state.user;

      if (Object.keys(userData).length) {
        return userData.login;
      }

      return false;
    },
  },
  components: {
    UserLogin,
    UserRegister,
  },
};
</script>

<style>
.v-menu__content .v-btn:not(.accent) {
  text-transform: capitalize;
  justify-content: left;
}

.v-list-item.h44 {
  min-height: 44px;
}
</style>
