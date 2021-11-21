<template>
  <v-app id="lega">
    <div class="logo" @click="reset" style="cursor: pointer">
      <img src="/assets/images/logo.png" />
    </div>
    <div class="note">
      <h1>Legal Notice</h1>

      <p>
        Legal notice for this website – also serves as provider identification
        according to § 5 Telemediengesetz (TMG)
      </p>
      <h2>Provider:</h2>
      <p>
        Technische Informationsbibliothek (TIB)<br />
        Welfengarten 1 B, 30167 Hannover<br />
        Postfach 6080, 30060 Hannover
      </p>
      <h2>Authorised Representative:</h2>
      <p>
        Prof. Dr. Sören Auer (Director of TIB) Technische Informationsbibliothek
        (TIB) is a foundation of public law of the state of Lower Saxony.
      </p>
      <h2>Responsible Supervisory Authority:</h2>
      <p>Ministry for Science and Culture of Lower Saxony</p>
      <h2>Contact:</h2>
      <p>
        Customer service phone: +49 511 762-8989 Central information desk phone:
        +49 511 762-2268 Fax: +49 511 762-4076 Email: informationtibeu
      </p>
      <h2>VAT (sales tax) registration number:</h2>
      <p>DE 214931803</p>
      <h2>Editorial Office:</h2>
      <p>Dr. Sandra Niemeyer; email: sandra.niemeyertibeu</p>
      <h2>Copyright:</h2>
      <p>
        The layout of this website is protected under copyright, as are the
        graphics and all other contents contained in the website.
      </p>
    </div>
  </v-app>
</template>

<script>
export default {
  methods: {
    reset() {
      this.$router.push("/");
    },
  },
};
</script>

<style>
#lega {
  justify-content: center;
  align-items: center;
  display: flex;
  height: 100%;
}

#lega .logo {
  margin-left: auto;
  margin-right: auto;
  margin-top: 1em;
}

#lega .logo > img {
  max-height: 56px;
}

.note {
  margin-top: 1em;
  margin-left: auto;
  margin-right: auto;
  width: 70%;
  min-width: 800px;
}
.note * {
  padding: 0.2em;
}
</style>
