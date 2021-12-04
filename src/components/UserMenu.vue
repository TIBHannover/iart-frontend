<template>
  <v-menu
    v-model="menu"
    min-width="175"
    offset-y
    bottom
    left
    open-on-hover
  >
    <template v-slot:activator="{ attrs, on: menu }">
      <v-btn
        icon
        v-bind="attrs"
        v-on="menu"
        class="ml-n2"
        :title="$t('user.menu.title')"
      >
        <v-badge
          v-if="loggedIn"
          color="accent"
          dot
        >
          <v-icon color="primary">mdi-account-circle</v-icon>
        </v-badge>
        <v-icon
          v-else
          color="primary"
        >mdi-account-circle</v-icon>
      </v-btn>
    </template>

    <UserAccount v-if="loggedIn" />

    <v-list
      v-if="loggedIn"
      class="pa-0"
    >
      <v-list-item-group>
        <v-list-item class="px-0" >
          <ModalCollectionUpload @close="menu = false" />
        </v-list-item>
        <v-list-item
          v-if="collections.length"
          class="px-0"
        >
          <ModalCollectionList @close="menu = false" />
        </v-list-item>
      </v-list-item-group>
    </v-list>

    <v-list
      v-else
      class="pa-0"
    >
      <v-list-item-group>
        <v-list-item class="px-0">
          <UserLogin @close="menu = false" />
        </v-list-item>
        <v-list-item class="px-0">
          <UserRegister @close="menu = false" />
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-menu>
</template>

<script>
import UserLogin from '@/components/UserLogin.vue';
import UserAccount from '@/components/UserAccount.vue';
import UserRegister from '@/components/UserRegister.vue';
import ModalCollectionList from '@/components/ModalCollectionList.vue';
import ModalCollectionUpload from '@/components/ModalCollectionUpload.vue';

export default {
  data() {
    return {
      menu: false,
    };
  },
  computed: {
    loggedIn() {
      return this.$store.state.user.loggedIn;
    },
    collections() {
      return this.$store.state.collection.collections;
    },
  },
  components: {
    UserLogin,
    UserAccount,
    UserRegister,
    ModalCollectionList,
    ModalCollectionUpload,
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
