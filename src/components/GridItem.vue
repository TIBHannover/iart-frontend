<template>
  <div class="grid-item" :disabled="disabled" :style="getCss">
    <ItemModal v-model="dialog" :entry="entry" />
    <img :src="entry.path" v-on:error="onError">

    <div class="overlay">
      <div class="view">
        <v-btn icon @click="query" title="Search Object">
          <v-icon color="white" class="shadow">mdi-magnify</v-icon>
        </v-btn>

        <v-btn icon @click="dialog=true" title="View Object" class="ml-n1">
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
import ItemModal from '@/components/ItemModal.vue';

export default {
  data() {
    return {
      height: '200px',
      width: 'auto',
      dialog: false,
      disabled: false,
    };
  },
  props: ['entry'],
  methods: {
    query() {
      const query = [{
        type: 'idx',
        positive: true,
        value: this.entry.id,
      }];

      this.$store.commit('updateQuery', query);
    },
    onError() {
      this.disabled = true;
    },
    updateSize() {
      if (Object.keys(this.settings).length) {
        const pixels = this.settings.zoomLevel * 25;

        if (this.settings.layout === 'flexible') {
          this.height = `${200 + pixels}px`;
          this.width = 'auto';
        } else {
          this.height = `${200 + pixels}px`;
          this.width = `${200 + pixels}px`;
        }
      }
    },
  },
  computed: {
    update() {
      return this.entry;
    },
    title() {
      try {
        return this.entry.meta.title[0];
      } catch {
        return 'No title';
      }
    },
    artist() {
      try {
        return this.entry.meta.artist_name.join(', ');
      } catch {
        return 'Unknown';
      }
    },
    settings() {
      return this.$store.state.api.settings;
    },
    getCss() {
      return {
        height: this.height,
        width: this.width,
      };
    },
  },
  watch: {
    update() {
      this.disabled = false;
    },
    settings: {
      handler() {
        this.updateSize();
      },
      deep: true,
    },
  },
  created() {
    this.updateSize();
  },
  components: {
    ItemModal,
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

.grid-item > img {
  transition: transform .5s ease;
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
  transition: opacity .25s ease;
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
  text-shadow: 0 0 5px black;
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
