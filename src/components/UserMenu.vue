<template>
  <v-menu v-model="menu" min-width="175" offset-y bottom left open-on-hover>
    <template v-slot:activator="{ attrs, on: menu }">
      <v-btn
        icon v-bind="attrs" v-on="menu" class="ml-n2"
        :title="$t('user.menu.title')"
      >
        <v-icon color="primary">mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <v-list class="pa-0">
      <v-list-item-group>
        <v-list-item v-if="!loggedIn" class="px-0">
          <UserLogin @close="menu=false" />
        </v-list-item>
        <v-list-item v-if="!loggedIn" class="px-0">
          <UserRegister @close="menu=false" />
        </v-list-item>
        <v-list-item v-if="loggedIn" class="px-0">
          <v-btn @click="logout" text block large> Logout </v-btn>
        </v-list-item>
      </v-list-item-group>
    </v-list>
    <v-divider></v-divider>

    <v-list class="pa-0">
      <v-list-item-group>
        <v-list-item v-if="loggedIn" class="px-0">
          <ModalCollectionList @close="menu=false" />
        </v-list-item>
        <v-list-item v-if="loggedIn" class="px-0">
          <ModalCollectionUpload @close="menu=false" />
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import UserLogin from "@/components/UserLogin.vue";
import UserRegister from "@/components/UserRegister.vue";
import ModalCollectionUpload from "@/components/ModalCollectionUpload.vue";
import ModalCollectionList from "@/components/ModalCollectionList.vue";

export default {
  data() {
    return {
      menu: false,
    };
  },
  methods: {
    logout() {
      this.$store.dispatch("user/logout");
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
    collections() {
      this.$store.dispatch("collection/list");
    },
  },
  components: {
    UserLogin,
    UserRegister,
    ModalCollectionUpload,
    ModalCollectionList,
  },
  created() {
    this.$store.dispatch("collection/list").then(function () {
      // setTimeout(
      //   () => self.$store.dispatch("api/setState", self.$route.query),
      //   500
      // );
    });
  },
};
</script>

<style>
.v-menu__content .v-btn:not(.accent) {
  text-transform: capitalize;
  justify-content: left;
}

.v-btn:not(.v-btn--round).v-size--large {
  height: 48px;
}
</style>
