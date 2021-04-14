<template>
  <v-dialog v-model="dialog" max-width="350px">
    <template v-slot:activator="{ on }">
      <v-btn v-on="on" class="register" text block large>
        {{ $t('user.register.title') }}
      </v-btn>
    </template>

    <v-card class="register">
      <v-card-title>
        {{ $t('user.register.title') }}

        <v-btn icon @click="dialog=false" absolute right>
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <v-text-field v-model="user.name" :placeholder="$t('user.name')" prepend-icon="mdi-account" counter="25" :rules="[checkLength]" clearable></v-text-field>

        <v-text-field v-model="user.email" :placeholder="$t('user.email')" prepend-icon="mdi-email" counter="25" :rules="[checkLength]" clearable></v-text-field>

        <v-text-field v-model="user.password" :append-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'" :placeholder="$t('user.password')" prepend-icon="mdi-lock" @click:append="showPassword=!showPassword" :type="showPassword ? 'text' : 'password'" counter="25" :rules="[checkLength]" clearable></v-text-field>
      </v-card-text>

      <v-card-actions class="px-6 pb-6">
        <v-btn @click="register" :disabled="disabled" color="accent" block rounded depressed>
          {{ $t('user.register.title') }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  data() {
    return {
      user: {},
      dialog: false,
      showPassword: false,
    };
  },
  methods: {
    register() {
      this.$store.dispatch('register', this.user);
      this.dialog = false;
    },
    checkLength(value) {
      if (value) {
        if (value.length < 5) {
          return this.$t('user.register.rules.min');
        }

        if (value.length > 25) {
          return this.$t('user.register.rules.max');
        }

        return true;
      }

      return this.$t('field.required');
    },
  },
  computed: {
    disabled() {
      if (Object.keys(this.user).length) {
        const total = Object.values(this.user).reduce(
          (t, value) => t + (this.checkLength(value) === true), 0,
        );

        if (total === 3) return false;
      }

      return true;
    },
  },
  watch: {
    dialog(value) {
      if (value) {
        this.$emit('close');
      }
    },
  },
};
</script>
