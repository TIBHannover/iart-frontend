// import AnchoredHeading from './AnchoredHeading.vue'
Vue.use(Vuex);
Vue.use(Vuetify);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

store = new Vuex.Store({
  state: {
    suggestions: [],
    entries: [],
    user: null,
    selected: null,
    sorting: null,

    search: {
      job_id: null,
      status: null,
      polling_job: null,
    },

    weights: {
      yuv_histogram_feature: 0.2,
      byol_embedding_feature: 0.7,
      image_net_inception_feature: 0.4,
    },

    query: {},
    categories: [],
    features: [],
    reference: [],
    zoomLevel: 0,
    submit: false,

    layout: {
      width: "auto", 
      height: 200,
    },

    dialog_search_image: false,
  },
  mutations: {
    updateSuggestions(state, suggestions) {
      state.suggestions = suggestions;
    },
    updateQuery(state, query) {
      state.query = query;
    },
    updateEntries(state, entries) {
      state.entries = entries;
    },
    updateSelected(state, entry) {
      state.selected = entry;
    },
    updateReference(state, entry) {
      state.reference = [entry];
    },
    updateSearch(state, search) {
      if (!!state.search.polling_job) {
        clearInterval(state.search.polling_job);
      }
      state.search = search;
    },
    updateZoomLevel(state, level) {
      state.zoomLevel = level;
    },
    updateLayout(state, layout) {
      state.layout = layout;
    },
    updateWeights(state, weights) {
      state.weights = weights;
    },
    updateSorting(state, sorting) {
      state.sorting = sorting;
    },
    toggleSubmit(state) {
      state.submit = !state.submit;
    },
    toggleDialogSearchImage(state) {
      state.dialog_search_image = !state.dialog_search_image;
    }
  },
  actions: {
    refreshAutocomplete(context, parameter) {
      // console.log('start fetch');
      // console.log(parameter.query);
      fetch(url_autocomplete, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          query: parameter.query,
        }),
      })
        .then(function(res) {
          return res.json();
        })
        .then(function(data) {
          if (data.status == "ok") {
            context.commit("updateSuggestions", data["suggestions"]);
            // console.log('update suggestions');
          } else {
            console.log("error");
          }
        })
        .catch((error) => {
          // console.log('error');
          // console.log(error);
        });
    },
    search(context, parameter) {
      var that = this;
      console.log("search", parameter);

      fetch(url_search, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          queries: parameter.queries,
          sorting: parameter.sorting
        }),
      })
        .then(function(res) {
          return res.json();
        })
        .then(function(data) {
          if (data.status == "ok") {
            polling_job = setInterval(
              function() {
                // that.listSearchResults();

                that.dispatch("listSearchResults", {
                  // features: this.weights,
                  // reference: this.$store.state.selected
                });
              }.bind(that),
              1000
            );

            console.log("job", polling_job);

            context.commit("updateSearch", {
              job_id: data.job_id,
              status: "running",
              polling_job: polling_job,
            });
          } else {
            console.log("error");
          }
        })
        .catch((error) => {
          console.log("error");
          console.log(error);
        });
    },
    listSearchResults(context, parameter) {
      fetch(url_search_result, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          id: this.state.search.job_id,
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.status == "running") {
            return
          }
          console.log(data);

          context.commit("updateSearch", {
            job_id: null,
            status: null,
            polling_job: null,
          });

          // context.commit('updateReference', parameter.reference)
          context.commit("updateEntries", data["entries"]);
          window.scrollTo(0, 0);
        })
        .catch((error) => {
          console.log("error");
          console.log(error);
        });
    },
  },
});

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function argMin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

function capitalize(x) {
  if (typeof x !== "string") return x;
  return x.charAt(0).toUpperCase() + x.slice(1);
}

Vue.component("feature-selector-circle", {
  template: `
  <div class="svg-container">
    <svg
      class="feature-selector"
      ref="svg"
      v-bind:viewBox="'0 0 ' + this.width+ ' '+ this.height"
      v-on:mousedown="startDrag"
      v-on:mouseup="stopDrag"
      v-on:mouseleave="stopDrag"
      v-on:mousemove="moveDrag">
      <polygon :points="pointsStr" class="line"></polygon>
      <circle v-bind:cx="width/2" v-bind:cy="height/2" v-bind:r="radius" class="border"></circle>
      <circle
        v-for="point in points"
        v-bind:cx="point.x"
        v-bind:cy="point.y"
        class="drag-point"

      ></circle>
      <circle
        v-bind:cx="mousePoint.x"
        v-bind:cy="mousePoint.y"
        r="5"
        fill="#ffffff"
      ></circle>
      <text
        v-for="(marker, marker_index) in markers"
        v-bind:x="marker.point.x"
        v-bind:y="marker.point.y"
        v-bind:text-anchor="marker.anchor"
        v-bind:alignment-baseline="marker.baseline"
      >{{ marker.name }}</text>
    </svg>
  </div>`,
  // props:['features'],
  data: function() {
    return {
      features: [
        {
          name: "color",
          weight: 0.5,
        },
        {
          name: "style",
          weight: 0.5,
        },
        {
          name: "year",
          weight: 0.8,
        },
        {
          name: "genre",
          weight: 0.8,
        },
        {
          name: "genre",
          weight: 0.8,
        },
      ],
      dragging: false,
      mousePoint: {
        x: 0,
        y: 0,
      },
      height: 250,
      width: 300,
      radius: 100,
      minValue: 0.2,
      maxValue: 0.9,
      selectedFeature: null,
      startingPoint: {
        x: 0,
        y: 0,
      },
    };
  },
  methods: {
    startDrag: function(event) {
      // found point
      this.dragging = true;
      console.log("start");

      var width = this.width; //this.$refs.svg.getBBox().width;
      var height = this.height; // this.$refs.svg.getBBox().height;
      this.mousePoint = this.mouseToPoint(event);
      this.startingPoint = this.mousePoint;
      this.selectedFeature = this.pointToFeature(this.mousePoint);

      radial_new = this.pointToRadial(this.mousePoint);

      this.features[this.selectedFeature].weight = Math.min(
        radial_new.value / this.radius,
        1.0
      );
    },
    moveDrag: function(event) {
      // console.log('move');
      //   console.log(this.dragging);
      if (!this.dragging) {
        return;
      }

      var point = this.mouseToPoint(event);
      // console.log(point);
      // console.log(this.mousePoint);
      var radial_new = this.pointToRadial(point);
      var radial_old = this.pointToRadial(this.startingPoint);
      // console.log(radial_new.value);
      // console.log(radial_old.value);
      console.log({
        i: this.selectedFeature,
        v: this.features[this.selectedFeature].weight,
        n: radial_new.value / this.radius,
      });
      var delta_angle = Math.abs(
        Math.atan2(
          Math.sin(radial_old.angle - radial_new.angle),
          Math.cos(radial_old.angle - radial_new.angle)
        )
      );
      if (delta_angle > (90 / 180) * Math.PI) {
        return;
      }

      this.features[this.selectedFeature].weight = Math.min(
        radial_new.value / this.radius,
        1.0
      );

      // renorm
      // sum = this.features.reduce(function(all, current) {
      //   return all + current.weight
      // }, 0.0)
      // console.log('################')
      // console.log(sum)
      //
      // norm = 1 / (sum);
      // console.log(norm)
      // for (let i = 0; i < this.features.length; i++) {
      //   this.features[i].weight = this.features[i].weight * norm;
      // }

      //debug
      this.mousePoint = point;
    },
    stopDrag: function(event) {
      this.dragging = false;
      console.log("stop");
    },
    featureToPoint: function(index, value) {
      var scale = this.radius * value;
      var angle = ((Math.PI * 2) / this.features.length) * index;
      var cos = Math.cos(angle);
      var sin = Math.sin(angle);
      var tx = scale * sin + this.width / 2;
      var ty = scale * cos + this.height / 2;
      return {
        x: tx,
        y: ty,
      };
    },
    pointToRadial: function(point) {
      var rel_y = point.y - this.height / 2;
      var rel_x = point.x - this.width / 2;
      console.log({
        rel_y: rel_y,
        rel_x: rel_x,
      });
      var angle = Math.atan2(-rel_y, rel_x) + Math.PI / 2;
      var o = angle % (2 * Math.PI);
      if (o < 0) {
        angle += 2 * Math.PI;
      }
      var value = Math.sqrt(Math.pow(rel_y, 2) + Math.pow(rel_x, 2));

      return {
        angle: angle,
        value: value,
      };
    },
    pointToFeature: function(point) {
      var radial = this.pointToRadial(point);

      var featuresLength = this.features.length;
      var dist = this.features.map(function (element, index) {
        var featureAngle = ((Math.PI * 2) / featuresLength) * index;
        return Math.abs(
          Math.atan2(
            Math.sin(radial.angle - featureAngle),
            Math.cos(radial.angle - featureAngle)
          )
        );
      });
      return argMin(dist);
    },
    mouseToPoint: function(event) {
      var ctm = event.target.getScreenCTM();
      return {
        x: (event.clientX - ctm.e) / ctm.a,
        y: (event.clientY - ctm.f) / ctm.d,
      };
    },
  },
  computed: {
    pointsStr: function() {
      return this.points
        .map(function (point, index) {
          return point.x + "," + point.y;
        })
        .join(" ");
    },
    points: function() {
      var results = [];
      for (let i = 0; i < this.features.length; i++) {
        results.push(this.featureToPoint(i, this.features[i].weight));
      }
      return results;
    },
    markers: function() {
      var results = [];
      for (let i = 0; i < this.features.length; i++) {
        var point = this.featureToPoint(i, 1.1);
        var baseline = "middle";
        if (point.y - this.height / 2 > 10) {
          baseline = "hanging";
        }
        if (point.y - this.height / 2 < -10) {
          baseline = "baseline";
        }
        var anchor = "middle";
        if (point.x - this.width / 2 > 10) {
          anchor = "start";
        }
        if (point.x - this.width / 2 < -10) {
          anchor = "end";
        }
        results.push({
          name: this.features[i].name,
          weight: this.features[i].weight,
          point: point,
          baseline: baseline,
          anchor: anchor,
        });
      }
      return results;
    },
  },
});

Vue.component("gallery", {
  template: `
    <div class="grid-view open pa-1">
      <gallery-item v-for="entry in entries" :key="entry.id" :entry="entry"/>
    </div>`,
  computed: {
    entries: function() {
      return this.$store.state.entries;
    },
  },
});

Vue.component("gallery-item", {
  template: `
    <div class="grid-item" :disabled="disabled" :style="getCss">
      <img :src="entry.path" v-on:error="onError"></img>

      <div class="overlay">
        <div class="view">
          <detail-view :key="entry.id" :entry="entry" :isWide="isWide"/>
        </div>

        <div class="meta">
          <div v-if="entry.meta.title" class="text-subtitle-1" :title="entry.meta.title">{{entry.meta.title}}</div>
          <div v-if="entry.meta.artist_name" class="text-caption" :title="entry.meta.artist_name">{{entry.meta.artist_name}}</div>
        </div>
      </div>
    </div>`,
  props: ["entry"],
  data: function() {
    return {
      disabled: false,
      isWide: true,
    };
  },
  computed: {
    updateHeight: function() {
      var height = this.$store.state.layout.height;

      return height + this.$store.state.zoomLevel * 25;
    },
    updateWidth: function() {
      var width = this.$store.state.layout.width;
      var height = this.$store.state.layout.height;

      if (typeof width === "string") return width;

      if (width == height) {
        width += this.$store.state.zoomLevel * 25;
      }
      
      return width + "px";
    },
    getCss: function() {
      return {
        "--item-height": this.updateHeight + "px",
        "--item-width": this.updateWidth,
      }
    },
  },
  methods: {
    onError: function(element) {
      this.disabled = true;
    },
  },
  mounted: function() {
    var img = this.$el.querySelector("img");
    this.isWide = img.naturalWidth > 1.25 * img.naturalHeight;
  },
});

Vue.component("detail-view", {
  template: `
    <v-dialog v-model="dialog" max-width="800px">
      <template v-slot:activator="{ attrs, on: dialog }">
        <v-btn icon v-bind="attrs" v-on="dialog" title="View object">
          <v-icon color="white" class="shadow">mdi-eye-outline</v-icon>
        </v-btn>
      </template>

      <v-card>
        <div class="img-wrapper">
          <v-img 
            :lazy-src="entry.path" class="grey lighten-1" 
            :max-height="isWide? 'auto' : '500px'" contain
          ></v-img>

          <v-btn icon @click="close" absolute top right>
            <v-icon>mdi-close</v-icon>
          </v-btn>

          <v-fab-transition>
            <v-btn 
              title="Search for similar objects" color="primary" 
              @click="searchImage" fab absolute bottom right large
            >
              <v-icon>mdi-image-search-outline</v-icon>
            </v-btn>
          </v-fab-transition>
        </div>

        <v-card-title class="mb-2 mr-16">
          <div class="text-h5 max-w">
            <span v-if="!entry.meta.title">No title</span>

            <span v-else v-for="word in title" @click="search(word, 'meta')">
              <span class="title--click" :title="word">{{word}}</span>
              <span style="display: inline-block;"> </span>
            </span>
          </div>

          <div class="text-h6 max-w font-weight-regular grey--text mt-1">
            <span v-if="!entry.meta.artist_name">Unknown</span>

            <span v-else>
              {{entry.meta.artist_name}}

              <v-btn 
                icon @click="searchArtist(entry.meta.artist_name)" 
                title="Search for the artist" depressed small
                class="ml-1"
              >
                <v-icon size="20">mdi-link-variant</v-icon>
              </v-btn>
            </span>
          </div>
        </v-card-title> 

        <v-card-text v-if="dialog">
          <v-chip v-if="date" class="mr-1 mb-1" :title="date">
            <v-icon left>mdi-clock-time-four-outline</v-icon>{{date}}
          </v-chip>

          <v-chip 
            v-for="tag in tags" :key="tag.id" :title="tag.name" 
            class="mr-1 mb-1" @click:close="search(tag.name)" 
            :text-color="tag.disable ? 'grey lighten-1' : ''"
            outlined close close-icon="mdi-magnify"
          >
            {{tag.name}}<v-icon v-if="tag.disable" size="14" right>mdi-help</v-icon>
          </v-chip>
        </v-card-text>
      </v-card>
    </v-dialog>`,
  props: ["entry", "isWide"],
  data: function() {
    return {
      dialog: false,
    };
  },
  computed: {
    tags: function() {
      var tags = [];

      for (let i = 0; i < this.entry.classifier.length; i++) {
        var classifier = this.entry.classifier[i];

        for (let j = 0; j < classifier.annotations.length; j++) {
          tags.push({
            id: j, disable: classifier.annotations[j].value < 0.6,
            name: capitalize(classifier.annotations[j].name),
          });
        }

        return tags;
      }
    },
    date: function() {
      var year_min = this.entry.meta.year_min,
          year_max = this.entry.meta.yaer_max;

      if (year_min && year_max) {
        if (year_min == year_max) return year_min;
        return year_min + "–" + year_max;
      }

      if (year_min) return year_min;
      if (year_max) return year_max;
    },
    title: function() {
      return this.entry.meta.title.split(' ');
    },
  },
  methods: {
    search(value, group="annotations") {
      this.$store.commit("updateQuery", {
        name: value, group: group,
      });

      this.$store.commit("toggleSubmit");
      this.close();
    },
    searchArtist(value) {
      // TODO
      this.close();
    },
    searchImage() {
      this.$store.commit("updateQuery", {
        name: this.entry, group: "image",
        // add: true,
      });

      this.$store.commit("toggleSubmit");
      this.close();
    },
    close() {
      this.dialog = false;
    }
  },
})

Vue.component("search-bar", {
  template: `
    <v-container class="py-4 search-bar" align-content="center">
      <v-combobox
        v-model="search" :items="items" :search-input.sync="suggest"
        prepend-inner-icon="mdi-magnify" @click:prepend-inner="submit" 
        append-icon="mdi-image-search-outline" @click:append="searchImage"
        placeholder="Start typing to search" @keyup.enter="submit" rounded 
        item-text="name" item-value="id" clearable solo hide-no-data flat 
        multiple hide-selected menu-props=closeOnClick
      >
        <template v-slot:selection="{ attrs, select, selected, item, index }">
          <v-menu :content-class="item.group" :close-on-content-click="false">
            <template v-slot:activator="{ on }">
              <v-chip 
                v-on="on" v-bind="attrs" :input-value="selected" 
                @click:close="deleteItem(index)" close
              >
                <span v-if="item.group!=null">
                  <v-icon v-if="item.group=='meta'" size="18" left>mdi-information-outline</v-icon>
                  <v-icon v-if="item.group=='annotations'" size="18" left>mdi-tag-text-outline</v-icon>
                  <v-icon v-if="item.group=='image'" size="18" left>mdi-image-outline</v-icon>
                  
                  <span v-if="item.group!='image'" :title="item.name">{{item.name}}</span>
                  <span v-else :title="item.name.meta.title">{{item.name.meta.title}}</span>
                </span>
                <span v-else class="text">{{item}}</span>
              </v-chip>
            </template>

            <v-card v-if="item.group=='image'" width="300">
              <v-img 
                :src="item.name.path" class="grey lighten-1" contain max-height="200"
              ></v-img>

              <v-card-text>
                <feature-selector-local :item="item" :index="index" :update="updateWeights"/>
              </v-card-text>
            </v-card>
          </v-menu>
        </template>

        <template v-slot:item="{ on, item }">
          <v-list-item v-on="on">
            <v-list-item-icon class="my-2 mr-3">
              <v-icon v-if="item.group=='meta'" size=20>mdi-information-outline</v-icon>
              <v-icon v-if="item.group=='annotations'" size=20>mdi-tag-text-outline</v-icon>
            </v-list-item-icon>

            <v-list-item-content>
              <v-list-item-title>{{item.name}}</v-list-item-title>
            </v-list-item-content>
          </v-list-item>
        </template>
      </v-combobox>

      <search-image/>
    </v-container>`,
  data: function() {
    return {
      suggest: null,
      search: [],
      items: [],
    };
  },
  computed: {
    updateItems: function() {
      var state = this.$store.state.suggestions,
          entries = [];  // converted suggestions


      for (let i = 0; i < state.length; i++) {
        var values = state[i].suggestions,
            group = state[i].group;

        for (let j = 0; j < values.length; j++) {
          entries.push({
            id: entries.length, group: group,
            name: capitalize(values[j]),
          });
        }
      }

      return entries;
    },
    updateQuery: function() {
      return this.$store.state.query;
    },
    updateSubmit: function() {
      return this.$store.state.submit;
    },
  },
  methods: {
    submit() {
      var queries = [];

      for (let i = 0; i < this.search.length; i++) {
        if (typeof this.search[i] === "object") {
          if (this.search[i].group == "image") {
            if ("weights" in this.search[i].name) {
              queries.push({
                reference: this.search[i].name.id,
                features: this.search[i].name.weights,
              });
            } else {
              queries.push({
                reference: this.search[i].name.id,
                features: this.$store.state.weights,
              });
            }
          } else {
            queries.push({
              query: this.search[i].name,
              type: this.search[i].group,
            });
          }
        } else {
          queries.push({
            query: this.search[i], type: null,
          });
        }
      }

      this.$store.dispatch("search", {
        queries: queries, 
        sorting: this.$store.state.sorting,
      });
    },
    deleteItem(index) {
      this.search.splice(index, 1);
    },
    updateWeights(index, weights) {
      this.search[index]["weights"] = weights;
    },
    searchImage() {
      this.$store.commit("toggleDialogSearchImage");
    },
  },
  watch: {
    updateQuery: function(query) {
      if ("add" in this.$store.state.query) {
        if (this.$store.state.query.add) {
          this.search.push(query);
          return;
        }
      }

      this.search = [query];
    },
    updateItems: function(items) {
      this.items = items;
    },
    updateSubmit: function(value) {
      if (value) {
        this.submit();  // run updated query
        this.$store.commit("toggleSubmit");
      }
    },
    suggest: function(query) {
      if (query != null) {
        this.$store.dispatch("refreshAutocomplete", {
          query: query,  // get new suggestion
        });
      }
    },
  },
});

Vue.component("search-image", {
  template: `
    <v-dialog v-model="dialog" max-width="350px" persistent>
      <v-card>
        <v-card-title>
          Image search

          <v-btn icon @click="close" absolute right>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-switch v-model="selectFile" class="pt-0" inset label="Upload image from my computer"></v-switch>
          <v-file-input 
            v-if="selectFile" :rules="[rules.isFile]" accept="image/png, image/jpeg, image/gif"
            placeholder="Select image file" prepend-icon="mdi-camera" chips show-size filled
          ></v-file-input>
          <v-text-field 
            v-else :rules="[rules.isUrl]" placeholder="Paste URL to image" 
            prepend-icon="mdi-link-variant" clearable filled
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="px-6 pb-6">
          <v-btn @click="search" color="secondary" block rounded>Search</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>`,
  data: function() {
    return {
      dialog: false,
      selectFile: false,
      rules: {
        isFile(value) {
          if (!value || value.size < 2000000) {
            return true;
          }

          return "Image size should be less than 2 MB.";
        },
        isUrl(value) {
          var pattern = new RegExp(
            "(http|ftp|https)://[\w-]+(\.[\w-]+)+([\w.,@?^" + 
            "=%&amp;:/~+#-]*[\w@?^=%&amp;/~+#-])?"
          );
          
          if (pattern.test(value)) {
            return true;
          }

          return "Requested URL is not valid.";
        },
      },
    };
  },
  computed: {
    updateDialog: function() {
      return this.$store.state.dialog_search_image;
    },
  },
  methods: {
    close() {
      this.$store.commit("toggleDialogSearchImage");
    },
    search() {
      // TODO
      this.close();
    },
  },
  watch: {
    updateDialog: function(value) {
      this.dialog = value;
    },
  },
});

Vue.component("settings", {
  template: `
    <div>
      <v-btn icon @click="toggle">
        <v-icon>mdi-cog-outline</v-icon>
      </v-btn>

      <v-navigation-drawer v-model="drawer" width="300" app absolute right temporary hide-overlay>
        <v-toolbar flat class="v-bar--underline">
          <v-toolbar-title>Settings</v-toolbar-title>

          <v-btn icon @click="close" absolute right>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>

        <v-container>
          <layout-settings/>
          <div class="mt-4 mb-3 mx-n3"><v-divider/></div>
          <feature-selector-global/>
          <div class="mt-4 mb-3 mx-n3"><v-divider/></div>
          <search-settings/>
        </v-container>
      </v-navigation-drawer>
    </div>`,
  data: function() {
    return {
      drawer: false,
    };
  },
  methods: {
    toggle() {
      this.drawer = !this.drawer;
    },
    close() {
      this.drawer = false;
    },
  },
});

Vue.component("feature-selector-global", {
  template: `
    <div class="pl-1">
      <div class="mb-2 text-subtitle-1">Feature weights</div>

      <v-row>
        <feature-slider 
          v-for="(weight, name, id) in weights" :key="id" :name="name" 
          :weight="weight" :updateWeight="updateWeight" hide-details dense
        />
      </v-row>
    </div>`,
  data: function() {
    return {
      weights: this.$store.state.weights,
    };
  },
  methods: {
    updateWeight: function(plugin, value) {
      this.weights[plugin] = value;  // change single weight
      this.$store.commit("updateWeights", this.weights);
    },
  },
});

Vue.component("feature-selector-local", {
  template: `
    <div>
      <v-switch 
        v-model="local" class="pt-0" inset hide-details
        label="Specify local search weights"
      ></v-switch>

      <v-row v-if="local" class="mt-6 mb-n3">
        <feature-slider 
          v-for="(weight, name, id) in weights" :key="id" :name="name" 
          :weight="weight" :updateWeight="updateWeight" hide-details dense
        />
      </v-row>
    </div>`,
  props: ["index", "item", "update"],
  data: function() {
    return {
      local: false,
      weights: {},
    };
  },
  methods: {
    updateWeight: function(plugin, value) {
      this.weights[plugin] = value;
      this.updateWeights();
    },
    updateWeights: function() {
      if (this.local) {
        this.update(this.index, this.weights);
      } else {
        this.update(this.index, {});
      }
    },
  },
  mounted: function() {
    this.weights = this.$store.state.weights;
  },
  watch: {
    local: function(value) {
      this.updateWeights();
    }
  },
});

Vue.component("feature-slider", {
  template: `
    <v-col cols="12" class="pt-0" :title="title">
      <v-slider v-model="value" @change="process" :prepend-icon="icon">
        <template v-slot:append>
          <v-text-field v-model="value" class="mt-0 pt-0" type="number"></v-text-field>
        </template>
      </v-slider>
    </v-col>`,
  props: ["name", "weight", "updateWeight"],
  data: function() {
    return {
      data: {
        yuv_histogram_feature: {
          icon: "mdi-palette",
          title: "Color Features",
        },
        byol_embedding_feature: {
          icon: "mdi-bank-outline",
          title: "Wikimedia Features",
        },
        image_net_inception_feature: {
          icon: "mdi-earth",
          title: "ImageNet Features"
        },
      },
      value: this.weight * 100,
    };
  },
  computed: {
    icon: function() {
      return this.data[this.name].icon;
    },
    title: function() {
      return this.data[this.name].title;
    },
  },
  methods: {
    process: function() {
      this.updateWeight(this.name, this.value / 100);
    },
  },
});

Vue.component("layout-settings", {
  template: `
    <div class="pl-1">
      <div class="mb-2 text-subtitle-1">Layout</div>

      <v-item-group v-model="selected" mandatory>
        <v-row class="px-2">
          <v-col v-for="item in items" :key="item.id" @click="update" cols="12" md="6" class="pa-1">
            <v-item v-slot="{ active, toggle }">
              <v-card
                @click="toggle" :color="active ? 'primary' : 'grey lighten-3'"
                class="d-flex align-center py-3 px-4" height="60" :dark="active" flat
              >
                <span>{{item.text}}</span>
                <v-icon :dark="active" large>{{item.icon}}</v-icon>
              </v-card>
            </v-item>
          </v-col>
        </v-row>
      </v-item-group>
    </div>`,
  data: function() {
    return {
      selected: 0,
      items: [
        {
          id: 1, height: 200, width: "auto", text: "Flexible", 
          icon: "mdi-view-compact-outline",
        },
        {
          id: 2, height: 200, width: 200, text: "Regular", 
          icon: "mdi-view-comfy-outline", 
        },
      ],
    };
  },
  methods: {
    update: function() {
      var layout = {
        width: this.items[this.selected].width, 
        height: this.items[this.selected].height,
      };

      this.$store.commit("updateLayout", layout);
    },
  },
})

Vue.component("search-settings", {
  template: `
    <div class="pl-1">
      <div class="mb-3 text-subtitle-1">Search results</div>

      <v-row class="mx-1">
        <v-switch 
          v-model="sorting" class="pt-0" inset hide-details
          label="Sort search results randomly" @change="update"
        ></v-switch>
      </v-row>
    </div>`,
  data: function() {
    return {
      sorting: false,
    };
  },
  methods: {
    update: function() {
      if (this.sorting) {
        this.$store.commit("updateSorting", "random");
      } else {
        this.$store.commit("updateSorting", null);
      }
    },
  },
});

Vue.component("user-menu", {
  template: `
    <v-menu offset-y bottom left :close-on-content-click="false">
      <template v-slot:activator="{ attrs, on: menu }">
        <v-btn icon v-bind="attrs" v-on="menu" class="mr-n3">
          <v-icon>mdi-account-details</v-icon>
        </v-btn>
      </template>

      <v-list>
        <v-list-item><user-login/></v-list-item>
        <v-list-item><user-register/></v-list-item>
      </v-list>
    </v-menu>`,
});

Vue.component("user-login", {
  template: `
    <v-dialog v-model="dialog" max-width="350px">
      <template v-slot:activator="{ attrs, on: dialog }">
        <v-btn text v-bind="attrs" v-on="dialog">
          Login
        </v-btn>
      </template>

      <v-card class="login">
        <v-card-title>
          Login

          <v-btn icon @click="close" absolute right>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field 
            placeholder="Username" prepend-icon="mdi-account" 
            clearable hide-details
          ></v-text-field>

          <v-text-field
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            placeholder="Password" prepend-icon="mdi-lock" 
            @click:append="showPassword = !showPassword"
            :type="showPassword ? 'text' : 'password'"
            clearable hide-details
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="px-6 pt-6">
          <v-btn @click="login" color="secondary" block rounded>Login</v-btn>
        </v-card-actions>

        <div class="grey--text px-6 pb-6 text--center">
          Don't have an account? <user-register @closeLogin="close"/>.
        </div>
      </v-card>
    </v-dialog>`,
  data: function() {
    return {
      dialog: false,
      showPassword: false,
    };
  },
  methods: {
    close() {
      this.dialog = false;
    },
    login() {
      // TODO
      this.close();
    }
  },
});

Vue.component("user-register", {
  template: `
    <v-dialog v-model="dialog" max-width="350px">
      <template v-slot:activator="{ attrs, on: dialog }">
        <v-btn text v-bind="attrs" v-on="dialog">
          Register
        </v-btn>
      </template>

      <v-card class="register">
        <v-card-title>
          Register

          <v-btn icon @click="close" absolute right>
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-text-field 
            placeholder="Username" prepend-icon="mdi-account" 
            clearable hide-details
          ></v-text-field>

          <v-text-field 
            placeholder="Email" prepend-icon="mdi-email" 
            clearable hide-details
          ></v-text-field>

          <v-text-field
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            placeholder="Password" prepend-icon="mdi-lock" 
            @click:append="showPassword = !showPassword"
            :type="showPassword ? 'text' : 'password'"
            clearable hide-details
          ></v-text-field>
        </v-card-text>

        <v-card-actions class="pa-6">
          <v-btn @click="register" color="secondary" block rounded>Register</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>`,
  data: function() {
    return {
      dialog: false,
      showPassword: false,
    };
  },
  methods: {
    close() {
      this.dialog = false;
    },
    register() {
      // TODO
      this.close();
    },
  },
  watch: {
    dialog: function(value) {
      if (value) {
        this.$emit("closeLogin");
      }
    }
  },
});

Vue.component("progress-bar", {
  template: `
    <v-progress-linear 
      :style="loading? 'opacity: 1;' : 'opacity: 0'" 
      color="primary" absolute bottom indeterminate
    ></v-progress-linear>`,
  data: function() {
    return {
      loading: false,
    };
  },
  computed: {
    update: function() {
      return this.$store.state.search.status;
    },
  },
  watch: {
    update: function(value) {
      this.loading = value != null;
    }
  }
});

Vue.component("zoom-nav", {
  template: `
    <div class="zoom">
      <v-btn :disabled="!zoomInEnabled" color="primary" class="mr-1" @click="zoomIn" title="Zoom in" fab small>
        <v-icon>mdi-magnify-plus-outline</v-icon>
      </v-btn>

      <v-btn :disabled="!zoomOutEnabled" color="primary" @click="zoomOut" title="Zoom out" fab small>
        <v-icon>mdi-magnify-minus-outline</v-icon>
      </v-btn>
    </div>`,
  data: function() {
    return {
      zoomLevel: 0,
      zoomInEnabled: true,
      zoomOutEnabled: true,
    };
  },
  methods: {
    zoomIn() {
      if (this.zoomLevel < 6) {
        this.zoomOutEnabled = true;
        this.zoomLevel += 1;

        if (this.zoomLevel == 5) {
          this.zoomInEnabled = false;
        } else {
          this.zoomInEnabled = true;
        }

        this.update();
      }
    },
    zoomOut() {
      if (this.zoomLevel > -6) {
        this.zoomInEnabled = true;
        this.zoomLevel -= 1;

        if (this.zoomLevel == -5) {
          this.zoomOutEnabled = false;
        } else {
          this.zoomOutEnabled = true;
        }

        this.update();
      }
    },
    update() {
      this.$store.commit("updateZoomLevel", this.zoomLevel);
    },
  },
});

var app = new Vue({
  el: "#app",
  template: `
    <v-app>
      <v-app-bar class="v-bar--underline" app flat>
        <v-app-bar-nav-icon class="mr-4"></v-app-bar-nav-icon>
        <v-img src="static/img/logo.svg" class="mr-4" max-height="40" max-width="100" contain></v-img>
        
        <search-bar/><settings/><user-menu/>
        <progress-bar/>
      </v-app-bar>

      <v-main>
        <gallery/>
      </v-main>

      <zoom-nav/>
    </v-app>`,
  store,
  mounted: function() {
    this.$store.commit("updateQuery", {
      name: "Landscape", group: "annotations",
    });

    this.$store.commit("toggleSubmit");
  },
  vuetify: new Vuetify({
    theme: {
      themes: {
        light: {
          primary: "#B71C1C",
          secondary: "#D32F2F",
          accent: "#880E4F",
        },
      },
      dark: false,
    },
  }),
});
