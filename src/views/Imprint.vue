<template>
  <v-app>
    <v-main>
      <v-container>
        <v-row class="mt-4 mb-8">
          <div class="logo" @click="reset" style="cursor: pointer">
            <img src="/assets/images/logo.png" />
          </div>
        </v-row>

        <v-row align-content="center">
          <v-col
            cols="6"
            class="mx-auto"
          >
            <v-card flat>
              <v-card-text>
                <p class="text-h4 text--primary">Imprint</p>
                <p>
                  Legal notice for this website – also serves as provider identification according to § 5 Telemediengesetz (TMG).
                </p>

                <p class="text-h6">Provider</p>
                <p>
                  Technische Informationsbibliothek (TIB)<br />
                  Welfengarten 1 B, 30167 Hannover<br />
                  Postfach 6080, 30060 Hannover
                </p>

                <p class="text-h6">Authorised Representative</p>
                <p>
                  Prof. Dr. Sören Auer (Director of TIB)<br />
                  Technische Informationsbibliothek (TIB) is a foundation of public law of the state of Lower Saxony.
                </p>

                <p class="text-h6">Responsible Supervisory Authority</p>
                <p>Ministry for Science and Culture of Lower Saxony</p>

                <p class="text-h6">Contact</p>
                <p>
                  Customer service phone: +49 511 762-8989<br />
                  Central information desk phone: +49 511 762-2268 <br />
                  Fax: +49 511 762-4076<br />
                  Email: information@tib.eu
                </p>

                <p class="text-h6">VAT Registration Number</p>
                <p>DE 214931803</p>

                <p class="text-h6">Editorial Office</p>
                <p>
                  Dr. Sandra Niemeyer<br />
                  Email: sandra.niemeyer@tib.eu
                </p>

                <p class="text-h6">Copyright</p>
                <p>
                  The layout of this website is protected under copyright, as are the graphics and all other contents contained in the website.
                </p>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
export default {
  methods: {
    reset() {
      this.$router.push('/');
    },
  },
};
</script>

<style scoped>
.logo {
  margin-left: auto;
  margin-right: auto;
  margin-top: 1em;
}

.logo > img {
  max-height: 56px;
}
</style>
