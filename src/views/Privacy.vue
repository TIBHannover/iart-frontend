<template>
  <v-app id="privacy">
    <div class="logo" @click="reset" style="cursor: pointer">
      <img src="/assets/images/logo.png" />
    </div>
    <div class="note">
      <h1>Privacy Statement</h1>

      <p>
        Data protection is of high priority for the Technische
        Informationsbibliothek (TIB). As a general rule, the use of TIB’s
        services does not require the provision of any personal data. However,
        the processing of personal data may be required where a data subject
        wants to use special services via the TIB’s web pages. Where the
        processing of personal data is required and where there is no legal
        basis for such processing, we shall obtain the data subject’s consent.
        The processing of personal data, such as for example the data subject’s
        name, address, email address, or telephone number shall always be
        carried out in accordance with the General Data Protection Regulation
        (GDPR) and the state and institution-specific data protection rules and
        regulations applicable to the TIB. This privacy statement serves to
        inform the public about the nature, scope and purpose of the personal
        data we collect, use and process, as well as of the rights data subjects
        are entitled to. The terms used in this privacy statement are to be
        understood within the meaning of the European General Data
        <a
          href="https://eur-lex.europa.eu/legal-content/DE/TXT/?uri=CELEX%3A32016R0679"
          >Protection Regulation (GDPR).</a
        >
      </p>
      <h2>Name and address of the controller</h2>
      <p>
        The controller under data protection law shall be:<br /><br />

        Technische Informationsbibliothek (TIB)<br />
        Welfengarten 1 B<br />
        30167 Hannover<br />
        Germany<br />

        Phone: +49 511 762-8989<br />
        Email: information@tib.eu<br />
        Website: www.tib.eu
      </p>

      <h2>Name and address of the data protection officer</h2>
      <p>
        The data protection officer of the controller shall be: <br />

        Elke Brehm<br />
        Phone: +49 511 762-8138<br />
        Email: datenschutz@tib.eu<br />
      </p>
      <h3>Postal address:</h3>
      <p>
        Technische Informationsbibliothek (TIB)<br />
        data protection officer<br />
        Welfengarten 1 B<br />
        30167 Hannover<br />
        Germany
      </p>
      <h3>Visiting Address:</h3>
      <p>
        TIB Conti-Campus<br />
        Königsworther Platz 1 B<br />
        30167 Hannover<br />

        Any data subject may contact our data protection officer directly
        regarding any and all questions and suggestions regarding data
        protection at any time.
      </p>
      <h2>Contact possibility via the web pages</h2>
      <p>
        The TIB’s web pages contain information and forms that enable quick
        electronic contacting via contact form or by email providing name and
        email address also for customers not registered with the TIB. The
        indication of name and email address is necessary to establish contact
        following clarification of the data subject’s concerns. The personal
        data transmitted by the data subject to the TIB via email or via a
        contact form are automatically stored internally and only for the
        purpose of processing or contacting the data subject.
      </p>
      <h2>Cookies</h2>
      <p>This website does not use cookies.</p>
      <h2>Use of web analysis tools</h2>
      <p>
        For the creation of the web statistics we use the open source software
        Matomo (formerly PIWIK) in anonymized form. This means that no personal
        data is processed. The use of cookies in the web analysis software
        Matomo is deactivated. When saving the user IP address, the last two
        octets are not processed. The collection of the user ID is deactivated.
        For the analysis, the following data is collected in addition to the
        access to the site and the anonymized IP address: Date and time of the
        request, page title of the requested page, URL of the previously
        requested page (referrer URL), screen resolution of the client system,
        local time zone, URL of clicked and downloaded files, URL of clicked
        external domains, geolocation of the client (country, region, city),
        main language of the used browser, user agent of the used browser.
      </p>
      <h2>Collection of general data and information (logfiles)</h2>
      <p>Whenever a data subject calls the TIB web pages, these pages automatically collect information in so-called server log files, which your browser automatically transmits to the TIB. This is:
<ul>
<li>Browser type and browser version</li>
<li>Operating system used</li>
<li>Referrer URL</li>
<li>Hostname of the accessing computer</li>
<li>IP address</li>
<li>Internet service provider of the accessing system</li>
<li>Time of the server request</li>
</ul>
As a general rule, this data is not attributable to a particular person. This data will not be merged with other data sources.
      </p>
      <h2>Routine deletion and blocking of personal data</h2>
      <p>The TIB processes and stores the data subject’s personal data only for the period necessary to achieve the purpose of such storage and in accordance with the General Data Protection Regulation and the country and institution-specific data protection regulations applicable to the TIB. Thereafter, the personal data will routinely be blocked or deleted in accordance with the statutory provisions.</p>
      <h2>Rights of the data subject
</h2>
<p>
    You shall at any time be entitled to obtain information about the data stored in this library, its origin and recipient and about the purpose of such data processing, as well as to rectification or erasure or restriction of processing or – to the extent that such processing is based on your consent – a right of withdrawal, possibly a right of objection and the right to data portability. Complaints may be lodged with the above-mentioned supervisory authority. You can contact us at any time for further questions on the subject of personal data.
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
#privacy {
  justify-content: center;
  align-items: center;
  display: flex;
  height: 100%;
}

#privacy .logo {
  margin-left: auto;
  margin-right: auto;
  margin-top: 1em;
}

#privacy .logo > img {
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
