<template>
  <v-dialog :value="value" @input="$emit('input')" max-width="750px">
    <v-card>
      <div class="img-wrapper">
        <v-img :lazy-src="entry.path" :src="entry.path" class="grey lighten-1" max-height="500px" contain>
          <template v-slot:placeholder>
            <v-row class="fill-height ma-0" align="center" justify="center">
              <v-progress-circular indeterminate></v-progress-circular>
            </v-row>
          </template>
        </v-img>

        <v-btn icon @click.native="$emit('input')" absolute top right>
          <v-icon>mdi-close</v-icon>
        </v-btn>

        <v-menu offset-y bottom right>
          <template v-slot:activator="{ attrs, on: menu }">
            <v-fab-transition>
              <v-btn v-bind="attrs" v-on="menu" :title="$t('search.object')" color="accent" fab absolute bottom right large depressed>
                <v-icon color="white">mdi-magnify</v-icon>
              </v-btn>
            </v-fab-transition>
          </template>

          <v-list class="pa-0">
            <v-list-item class="px-0 h44">
              <v-btn @click="query(null, false, 'idx')" text block large>{{ $t('search.new') }}</v-btn>
            </v-list-item>

            <v-list-item class="px-0 h44">
              <v-btn @click="query(null, true, 'idx')" text block large>{{ $t('search.append') }}</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>
      </div>

      <v-card-title class="mb-2">
        <div class="text-h5 max-w mr-12">
          <span v-for="(name, index) in title" :key="index" @click="query(name, true, 'txt')">{{ name }}</span>

          <v-chip v-if="date" class="ml-3">
            <v-icon color="grey darken-1" left>mdi-clock-time-four-outline</v-icon>
            <span>{{ date }}</span>
          </v-chip>
        </div>

        <div class="artist text-h6 max-w font-weight-regular grey--text mt-1">
          <span v-for="(name, index) in artist" :key="index" @click="filter(name, 'artist_name')">{{ name }}<span>
        </div>
      </v-card-title>

      <v-card-text>
        <div v-if="keywords.length" class="mb-2">
          <v-chip v-for="(tag, index) in keywords" :key="index" class="mr-1 mb-2" :text-color="tag.disable ? 'grey lighten-1' : ''" outlined>
            <span class="tag" :title="tag.plugin.replaceAll('_', ' ')">{{ tag.name }}</span>
            <v-icon v-if="tag.disable" class="ml-1 mr-n1" size="14">mdi-help</v-icon>
          </v-chip>

          <v-btn v-if="moreTags" @click="moreTags=false" :title="$t('modal.item.tags.more')" class="mb-2" color="grey lighten-2" icon small depressed>
            <v-icon>mdi-tag-plus</v-icon>
          </v-btn>
          <v-btn v-else @click="moreTags=true" :title="$t('modal.item.tags.less')" class="mb-2" color="grey lighten-2" icon small depressed>
            <v-icon>mdi-tag-minus</v-icon>
          </v-btn>
        </div>

        <v-expansion-panels flat accordion multiple>
          <v-expansion-panel v-if="Object.keys(metadata).length">
            <v-expansion-panel-header class="pa-0">
              <v-icon class="mr-3" size="18">mdi-information-outline</v-icon>
              <span class="text-subtitle-1">{{ $t('modal.item.information') }}</span>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row v-for="(values, field, index) in metadata" :key="index" justify="space-around" no-gutters>
                <v-col cols="3">
                  <span class="capitalize">{{ $t('drawer.filter.field')[field] }}</span>
                </v-col>


                <v-col cols="9">
                  <v-chip v-for="(value, index) in values" :key="index" :disabled="value.disable" class="mr-1 mb-2" @click="filter(value.name, field)" :title="$t('drawer.filter.title')" outlined>
                    <span>{{ value.name }}</span>
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel v-if="texts.length">
            <v-expansion-panel-header class="pa-0">
              <v-icon class="mr-3" size="18">mdi-tag-text-outline</v-icon>
              <span class="text-subtitle-1">{{ $t('modal.item.iconclass.text') }}</span>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row justify="space-around" no-gutters>
                <v-col cols="3">
                  <span class="capitalize">{{ $t('modal.item.iconclass.notations') }}</span>
                </v-col>

                <v-col cols="9">
                  <v-chip v-for="(tag, index) in texts" :key="index" class="mr-1 mb-2" :text-color="tag.disable ? 'grey lighten-1' : ''" outlined>
                    <span :title="tag.name" class="clip">{{ tag.name }}</span>
                    <v-icon v-if="tag.disable" class="ml-1 mr-n1" size="14">mdi-help</v-icon>
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel v-if="references.length">
            <v-expansion-panel-header class="pa-0">
              <v-icon class="mr-3" size="18">mdi-link-variant</v-icon>
              <span class="text-subtitle-1">{{ $t('modal.item.references') }}</span>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row v-for="(field, index) in references" :key="index" justify="space-around" no-gutters>
                <v-col cols="3">
                  <span class="capitalize">{{ field.name }}</span>
                </v-col>

                <v-col cols="9">
                  <v-chip class="mr-1 mb-2" :href="field.url" target="_blank" outlined>
                    <span>{{ field.value }}</span>
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: ["value", "entry"],
  data() {
    return {
      moreTags: true,
    };
  },
  methods: {
    query(value, append, type) {
      const { settings } = this.$store.state.api;
      const query = { type, positive: true, value };

      if (type === "idx") {
        query.value = this.entry.id;
        query.weights = settings.weights;
        query.label = this.title.join(" ");
      }

      console.log(JSON.stringify(query));
      if (append) {
        this.$store.commit("addQuery", query);
      } else {
        this.$store.commit("updateQuery", [query]);
      }

      this.$emit("input");
    },
    filter(value, field) {
      this.$store.commit("addFilter", { value, field });
      this.$emit("input");
    },
  },
  computed: {
    title() {
      const title = [];

      this.entry.meta.forEach(({ name, value_str }) => {
        if (name === "title" && value_str) {
          title.push(value_str);
        }
      });

      if (title.length) return title[0].split(" ");
      return [this.$t("griditem.notitle")];
    },
    artist() {
      const artist = [];

      this.entry.meta.forEach(({ name, value_str }) => {
        if (name === "artist_name" && value_str) {
          artist.push(value_str);
        }
      });

      if (artist.length) return artist;
      return [this.$t("griditem.noartist")];
    },
    date() {
      let year_min = null;
      let year_max = null;

      this.entry.meta.forEach(({ name, value_str }) => {
        if (value_str) {
          if (name === "year_min") {
            year_min = value_str;
          } else if (name === "yaer_max") {
            year_max = value_str;
          }
        }
      });

      if (year_min && year_max) {
        if (year_min === year_max) {
          return year_min;
        }

        return `${year_min}–${year_max}`;
      }

      if (year_min) return year_min;
      if (year_max) return year_max;

      return null;
    },
    keywords() {
      let keywords = [];

      this.entry.classifier.forEach(({ plugin, annotations }) => {
        annotations.forEach(({ name, value }) => {
          keywords.push({
            name,
            value,
            plugin,
            disable: value < 0.4,
          });
        });
      });

      keywords.sort((a, b) => b.value - a.value);

      if (this.moreTags && keywords.length >= 7) {
        keywords = keywords.slice(0, 7);
      }

      return keywords;
    },
    texts() {
      // TODO: Iconclass notations
      return [];
    },
    metadata() {
      const selectedFields = [
        "depicts",
        "genre",
        "location",
        "medium",
        "object_type",
        "institution",
      ];

      const metadata = {};
      const counts = {};

      this.$store.state.api.counts.forEach(({ entries, field }) => {
        const field_name = field.split(".")[1];

        entries.forEach(({ name }) => {
          if (Object.prototype.hasOwnProperty.call(counts, field_name)) {
            counts[field_name].push(name);
          } else {
            counts[field_name] = [name];
          }
        });
      });

      this.entry.meta.forEach(({ name, value_str }) => {
        if (selectedFields.includes(name)) {
          const disable = !counts[name].includes(value_str);

          if (Object.prototype.hasOwnProperty.call(metadata, name)) {
            metadata[name].push({ name: value_str, disable });
          } else {
            metadata[name] = [{ name: value_str, disable }];
          }
        }
      });

      return metadata;
    },
    references() {
      const wd = "https://www.wikidata.org/wiki/";
      const references = [];

      this.entry.meta.forEach(({ name, value_str }) => {
        if (name === "wikidata" && value_str) {
          references.push({
            name,
            value: value_str,
            url: wd + value_str,
          });
        }
      });

      return references;
    },
  },
};
</script>

<style>
.v-dialog .max-w {
  width: 100%;
}

.v-dialog .img-wrapper {
  position: relative;
}

.v-dialog .v-expansion-panel-header > :not(.v-expansion-panel-header__icon) {
  flex: initial;
}

.v-dialog .v-expansion-panel-content__wrap {
  padding: 0;
}

.v-dialog .text-h5,
.v-dialog .text-h6 {
  word-break: break-word;
}

.v-dialog .text-h5 > span,
.v-dialog .text-h6 > span,
.v-dialog .v-expansion-panel .capitalize {
  text-transform: capitalize;
}

.v-dialog .text-h6 > span,
.v-dialog .text-h5 > span {
  cursor: pointer;
}

.v-dialog .text-h6 > span:after {
  content: ", ";
}

.v-dialog .text-h6 > span:last-child:after {
  content: "";
}

.v-dialog .text-h5 > span:after {
  content: " ";
}

.v-dialog .text-h5 > span:last-child:after {
  content: "";
}

.v-dialog span.clip {
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 200px;
}

.v-dialog span.tag {
  text-transform: lowercase;
}
</style>
