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

        <v-fab-transition>
          <v-btn @click="query" title="Search Object" color="accent" fab absolute bottom right large depressed>
            <v-icon color="white">mdi-magnify</v-icon>
          </v-btn>
        </v-fab-transition>
      </div>

      <v-card-title class="mb-2">
        <div class="text-h5 max-w">
          <span>{{ title }}</span>

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
            <span>{{ tag.name }}</span>
            <v-icon v-if="tag.disable" class="ml-1 mr-n1" size="14">mdi-help</v-icon>
          </v-chip>

          <v-btn v-if="moreTags" @click="moreTags=false" title="Show More Tags" class="mb-2" color="grey lighten-2" icon small depressed>
            <v-icon>mdi-tag-plus</v-icon>
          </v-btn>
          <v-btn v-else @click="moreTags=true" title="Show Less Tags" class="mb-2" color="grey lighten-2" icon small depressed>
            <v-icon>mdi-tag-minus</v-icon>
          </v-btn>
        </div>

        <v-expansion-panels flat accordion multiple>
          <v-expansion-panel v-if="metadata.length">
            <v-expansion-panel-header class="pa-0">
              <v-icon class="mr-3" size="18">mdi-information-outline</v-icon>
              <span class="text-subtitle-1">Basic Information</span>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row v-for="(field, index) in metadata" :key="index" justify="space-around" no-gutters>
                <v-col cols="3">
                  <span class="capitalize">{{ field.name.replace('_', ' ') }}</span>
                </v-col>

                <v-col cols="9">
                  <v-chip v-for="(value, index) in field.values" :key="index" :disabled="value.disable" class="mr-1 mb-2" @click="filter(value.name, field.name)" title="Refine Results" outlined>
                    <span>{{ value.name }}</span>
                  </v-chip>
                </v-col>
              </v-row>
            </v-expansion-panel-content>
          </v-expansion-panel>

          <v-expansion-panel v-if="texts.length">
            <v-expansion-panel-header class="pa-0">
              <v-icon class="mr-3" size="18">mdi-tag-text-outline</v-icon>
              <span class="text-subtitle-1">Iconclass</span>
            </v-expansion-panel-header>

            <v-expansion-panel-content>
              <v-row justify="space-around" no-gutters>
                <v-col cols="3">
                  <span class="capitalize">Notations</span>
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
              <span class="text-subtitle-1">References</span>
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
  props: ['value', 'entry'],
  data() {
    return {
      moreTags: true,
    };
  },
  methods: {
    query() {
      const query = [{
        type: 'idx',
        positive: true,
        value: this.entry.id,
      }];

      this.$store.commit('updateQuery', query);
      this.$emit('input');
    },
    filter(value, field) {
      this.$store.commit('addFilter', { value, field });
      this.$emit('input');
    },
  },
  computed: {
    title() {
      try {
        return this.entry.meta.title[0];
      } catch {
        return 'No title';
      }
    },
    artist() {
      try {
        const { artist_name } = this.entry.meta;
        if (artist_name.length) return artist_name;

        return ['Unknown'];
      } catch {
        return ['Unknown'];
      }
    },
    date() {
      try {
        const { year_min, year_max } = this.entry.meta;

        if (year_min && year_max) {
          if (year_min === year_max) {
            return year_min;
          }

          return `${year_min}–${year_max}`;
        }

        if (year_min) return year_min;
        if (year_max) return year_max;

        return null;
      } catch {
        return null;
      }
    },
    keywords() {
      try {
        const { labels, values } = this.entry.keywords;
        const keywords = [];

        for (let i = 0; i < labels.length; i += 1) {
          if (!this.moreTags || i < 7) {
            keywords.push({
              name: labels[i],
              disable: values[i] < 0.4,
            });
          }
        }

        return keywords;
      } catch {
        return [];
      }
    },
    texts() {
      try {
        const { labels, values } = this.entry.texts;
        const texts = [];

        for (let i = 0; i < labels.length; i += 1) {
          texts.push({
            name: labels[i],
            disable: values[i] < 0.4,
          });
        }

        return texts;
      } catch {
        return [];
      }
    },
    metadata() {
      const { counts } = this.$store.state.api;
      const metadata = [];

      const selectedFields = [
        'depicts', 'genre', 'location', 'medium',
        'object_type', 'institution',
      ];

      Object.keys(this.entry.meta).forEach((field) => {
        if (selectedFields.includes(field)) {
          const values = this.entry.meta[field];

          metadata.push({
            name: field,
            values: values.map((name) => ({
              name,
              disable: !counts.dct[field].includes(name),
            })),
          });
        }
      });

      return metadata;
    },
    references() {
      const wd = 'https://www.wikidata.org/wiki/';
      const references = [];

      Object.keys(this.entry.meta).forEach((name) => {
        if (name === 'wikidata') {
          const value = this.entry.meta[name];

          references.push({
            name,
            value,
            url: wd + value,
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

.v-dialog .v-expansion-panel-content__wrap .capitalize {
  color: rgba(69, 123, 157, 0.54);
}

.v-dialog .text-h5 > span, .v-dialog .text-h6 > span, .v-dialog .v-expansion-panel .capitalize {
  text-transform: capitalize;
}

.v-dialog .artist.text-h6 > span {
  cursor: pointer;
}

.v-dialog .artist.text-h6 > span:hover {
  border-bottom: 1px dotted #ddd;
}

.v-dialog .artist.text-h6 > span:after {
  content: ', '
}

.v-dialog .artist.text-h6 > span:last-child:after {
  content: ''
}

.v-dialog span.clip {
  text-overflow: ellipsis;
  overflow: hidden;
  max-width: 200px;
}
</style>
