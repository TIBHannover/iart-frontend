<template>
  <div class="grid-item" :disabled="disabled" :style="getCss" @click="bookmark">
    <ModalItem v-model="dialog" :entry="entry" />
    <img :src="entry.path" v-on:error="onError" />

    <div v-if="bookmarked" class="bookmark">
      <v-btn icon>
        <v-icon color="accent" class="shadow">mdi-record-circle-outline</v-icon>
      </v-btn>
    </div>

    <div class="overlay">
      <div class="view">
        <v-menu offset-y bottom right>
          <template v-slot:activator="{ attrs, on: menu }">
            <v-btn icon v-bind="attrs" v-on="menu" :title="$t('search.object')">
              <v-icon color="white" class="shadow">mdi-magnify</v-icon>
            </v-btn>
          </template>

          <v-list class="pa-0">
            <v-list-item class="px-0 h44">
              <v-btn @click="query(false)" text block large>{{
                $t("search.new")
              }}</v-btn>
            </v-list-item>

            <v-list-item class="px-0 h44">
              <v-btn @click="query(true)" text block large>{{
                $t("search.append")
              }}</v-btn>
            </v-list-item>
          </v-list>
        </v-menu>

        <v-btn
          icon
          @click="dialog = true"
          :title="$t('griditem.view')"
          class="ml-n1"
        >
          <v-icon color="white" class="shadow">mdi-eye-outline</v-icon>
        </v-btn>
      </div>

      <div class="meta">
        <div class="text-subtitle-1" :title="title">{{ title }}</div>
        <div class="text-caption" :title="artist">{{ artist }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import ModalItem from "@/components/ModalItem.vue";

export default {
  data() {
    return {
      width: "auto",
      height: "200px",

      dialog: false,
      disabled: false,
      bookmarked: false,
    };
  },
  props: ["entry"],
  methods: {
    query(append) {
      const query = {
        type: "idx",
        positive: true,
        label: this.title,
        value: this.entry.id,
        weights: this.settings.weights,
      };

      if (append) {
        this.$store.commit("api/addQuery", query);
      } else {
        this.$store.commit("api/updateQuery", [query]);
      }
    },
    bookmark(event) {
      if (event.target.nodeName !== "I") {
        if (!this.bookmarked) {
          this.$store.commit("user/addBookmark", this.entry.id);
        } else {
          this.$store.commit("user/removeBookmark", this.entry.id);
        }

        this.bookmarked = !this.bookmarked;
      }
    },
    onError() {
      this.disabled = true;
    },
    updateSize() {
      if (Object.keys(this.settings).length) {
        const pixels = this.settings.zoomLevel * 25;

        if (this.settings.layout === "flexible") {
          this.height = `${200 + pixels}px`;
          this.width = "auto";
        } else {
          this.height = `${200 + pixels}px`;
          this.width = `${200 + pixels}px`;
        }
      }
    },
    isBookmarked() {
      const history = this.$store.state.user.history[0];

      return history.bookmarks.includes(this.entry.id);
    },
  },
  computed: {
    update() {
      return this.entry;
    },
    title() {
      const title = [];

      this.entry.meta.forEach(({ name, value_str }) => {
        if (name === "title" && value_str) {
          title.push(value_str);
        }
      });

      if (title.length) return title[0];
      return this.$t("griditem.notitle");
    },
    artist() {
      const artist = [];

      this.entry.meta.forEach(({ name, value_str }) => {
        if (name === "artist_name" && value_str) {
          artist.push(value_str);
        }
      });

      if (artist.length) return artist.join(", ");
      return this.$t("griditem.noartist");
    },
    settings() {
      return this.$store.state.api.settings;
    },
    getCss() {
      return {
        height: this.height,
        width: this.width,
        cursor: "pointer",
      };
    },
  },
  watch: {
    update(new_entry, old_entry) {
      if (new_entry.id !== old_entry.id) {
        this.bookmarked = this.isBookmarked();
        this.disabled = false;
      }
    },
    settings: {
      handler() {
        this.updateSize();
      },
      deep: true,
    },
  },
  created() {
    this.bookmarked = this.isBookmarked();
    this.updateSize();
  },
  components: {
    ModalItem,
  },
};
</script>

<style>
.grid-item {
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  min-width: 80px;
  display: block;
  flex-grow: 1;
  margin: 2px;
}

.grid-item[disabled] {
  display: none;
}

.grid-item:last-child {
  max-width: 400px;
}

.grid-item i {
  text-shadow: 0 0 5px black;
}

.grid-item > .bookmark {
  transition: opacity 0.25s ease;
  position: absolute;
  padding: 5px;
  opacity: 1;
  top: 0;
}

.grid-item:hover > .bookmark {
  opacity: 0;
}

.grid-item > img {
  transition: transform 0.5s ease;
  transform: scale(1.05);
  object-fit: cover;
  min-width: 100%;
  max-width: 100%;
  height: 100%;
  opacity: 1;
}

.grid-item:hover > img {
  transform: scale(1.4);
}

.grid-item:hover > .overlay {
  opacity: 1;
}

.grid-item > .overlay {
  background: linear-gradient(to top, black, #00000000 50%);
  transform: translate(-50%, -50%);
  transition: opacity 0.25s ease;
  position: absolute;
  object-fit: cover;
  min-width: 100%;
  max-width: 100%;
  color: #ffffff;
  height: 100%;
  opacity: 0;
  left: 50%;
  top: 50%;
}

.grid-item > .overlay .view {
  padding: 5px 5px 0 0;
  text-align: right;
}

.grid-item > .overlay .meta {
  position: absolute;
  padding: 5px 10px;
  width: 100%;
  bottom: 0;
  left: 0;
}

.grid-item > .overlay .meta * {
  text-transform: capitalize;
  text-overflow: ellipsis;
  line-height: 1.35rem;
  white-space: nowrap;
  overflow: hidden;
  font-weight: 400;
}
</style>
