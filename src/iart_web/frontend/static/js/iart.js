// import AnchoredHeading from './AnchoredHeading.vue'
Vue.use(Vuex);

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

store = new Vuex.Store({
  state: {
    // query: {},
    suggestions: [],
    entries: [],
    user: null,
    selected: null,

    queries: [],

    search: {
      job_id: null,
      status: null,
      polling_job: null,
    },



    // query: {},
    // categories: [],
    // features: [],
    // reference: [],
  },
  mutations: {
    updateSuggestions(state, suggestions) {
      state.suggestions = suggestions;
    },
    // updateQuery(state, query) {
    //   state.query = query;
    // },
    updateEntries(state, entries) {
      state.entries = entries;
    },
    updateSelected(state, entry) {
      state.selected = entry;
    },
    updateReference(state, entry) {
      state.reference = [entry];
    },
    updateQueries(state, queries) {
      state.queries = queries;
    },
    updateSearch(state, search) {
      if (!!state.search.polling_job) {
        clearInterval(state.search.polling_job);
      }
      state.search = search;
    },
  },
  actions: {
    addQuery(context, query) {
      console.log('ADD_QUERY')
      queries = this.state.queries.concat([query]);
      context.commit("updateQueries", queries);
    },
    removeQuery(context, index) {
      console.log('REMOVE_QUERY')
      var queries = this.state.queries.slice();
      queries.splice(index, 1);
      context.commit("updateQueries", queries);
    },
    removeQueries(context) {
      console.log('REMOVE_QUERIES')
      context.commit("updateQueries", []);
      state.queries = [];
    },
    refreshAutocompletion(context, parameter) {
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
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
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
      // var reference_id = null;
      // if ("reference" in parameter && "id" in parameter.reference) {
      //   reference_id = parameter.reference.id;
      // }
      fetch(url_search, {
        method: "POST",
        headers: {
          "X-CSRFToken": csrftoken,
          "Content-Type": "application/json",
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          queries: parameter.queries,
          // category: parameter.category,
          // features: parameter.features,
          // id: reference_id,
        }),
      })
        .then(function (res) {
          return res.json();
        })
        .then(function (data) {
          if (data.status == "ok") {
            console.log("START SEARCHING");
            polling_job = setInterval(
              function () {
                // that.listSearchResults();

                that.dispatch("listSearchResults", {
                  // features: this.weights,
                  // reference: this.$store.state.selected
                });
              }.bind(that),
              1000
            );
            console.log("job" + polling_job);

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
      console.log("Test");
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

Vue.directive("click-outside", {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his childrens
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener("click", el.clickOutsideEvent);
  },
  unbind: function (el) {
    document.body.removeEventListener("click", el.clickOutsideEvent);
  },
});

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function argMin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
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
  data: function () {
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
    startDrag: function (event) {
      // found point
      this.dragging = true;
      console.log("start");

      width = this.width; //this.$refs.svg.getBBox().width;
      height = this.height; // this.$refs.svg.getBBox().height;
      this.mousePoint = this.mouseToPoint(event);
      this.startingPoint = this.mousePoint;
      this.selectedFeature = this.pointToFeature(this.mousePoint);

      radial_new = this.pointToRadial(this.mousePoint);

      this.features[this.selectedFeature].weight = Math.min(
        radial_new.value / this.radius,
        1.0
      );
    },
    moveDrag: function (event) {
      // console.log('move');
      //   console.log(this.dragging);
      if (!this.dragging) {
        return;
      }

      point = this.mouseToPoint(event);
      // console.log(point);
      // console.log(this.mousePoint);
      radial_new = this.pointToRadial(point);
      radial_old = this.pointToRadial(this.startingPoint);
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
    stopDrag: function (event) {
      this.dragging = false;
      console.log("stop");
    },
    featureToPoint: function (index, value) {
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
    pointToRadial: function (point) {
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
    pointToFeature: function (point) {
      radial = this.pointToRadial(point);

      featuresLength = this.features.length;
      dist = this.features.map(function (element, index) {
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
    mouseToPoint: function (event) {
      var ctm = event.target.getScreenCTM();
      return {
        x: (event.clientX - ctm.e) / ctm.a,
        y: (event.clientY - ctm.f) / ctm.d,
      };
    },
  },
  computed: {
    pointsStr: function () {
      return this.points
        .map(function (point, index) {
          return point.x + "," + point.y;
        })
        .join(" ");
    },
    points: function () {
      var results = [];
      for (let i = 0; i < this.features.length; i++) {
        results.push(this.featureToPoint(i, this.features[i].weight));
      }
      return results;
    },
    markers: function () {
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

Vue.component("feature-slider", {
  template: `
    <div class="row feature">
      <label class="col-25">{{name}}</label>
      <input type="checkbox" v-model="actived" v-on:change="process()"></input>
      <input type="range" min="0" max="100" value="50" class="slider" v-model="value" v-bind:disabled="!actived" v-on:change="process()"></input>
    </div>`,
  // props:['features'],
  props: ["plugin", "update"],
  data: function () {
    return {
      value: 50,
      actived: true,
    };
  },
  created: function () {
    if (this.actived) {
      this.update(this.plugin, this.value);
    } else {
      this.update(this.plugin, 0);
    }
  },
  methods: {
    process: function () {
      if (this.actived) {
        this.update(this.plugin, this.value);
      } else {
        this.update(this.plugin, 0);
      }
    },
  },
  computed: {
    name: function () {
      console.log(this.plugin);
      feature_name = {
        yuv_histogram_feature: "Color",
        byol_embedding_feature: "Wikimedia",
        image_net_inception_feature: "ImageNet",
      };

      return feature_name[this.plugin];
    },
  },
});

Vue.component("feature-selector-slider", {
  template: `
  <form class="feature-selector">
    <feature-slider 
      v-for="feature in selected.feature" 
      v-bind:plugin="feature.plugin" 
      v-bind:key="feature.id"
      v-bind:update="update">
    </feature-slider>
    <button v-on:click="search">Search</button>
  </form>`,
  // props:['features'],
  data: function () {
    return {
      weights: {},
    };
  },
  methods: {
    search: function (event) {
      event.preventDefault();
      // features
      // reference_id

      this.$store.dispatch("search", {
        queries: [{
          features: this.weights,
          reference: this.$store.state.selected.id,
        }]
      });
    },
    update: function (plugin, value) {
      this.weights[plugin] = value / 100;
      if (this.weights[plugin] == 0.0) {
        delete this.weights[plugin];
      }
      console.log(this.weights);
    },
  },
  computed: {
    selected: function () {
      return this.$store.state.selected;
    },
  },
});

Vue.component("detail-view", {
  template: `
  <div v-bind:class="'side-menu ' + (hidden ? 'close': 'open')">
    <div v-if="disabled" v-bind:class="'side-fixed ' + (hidden ? 'close': 'open')">
      <div id="details-view" class="details-view">
        <div class="details-item details-image">

          <img v-bind:src="selected.path"/>
          <div class="overlay">
            <div class="tools">
              <a v-on:click="expand"><i class="fa fa-expand"></i></a>
            </div>
          </div>
        </div>
        <div class="details-item">
          <h3>{{selected.meta.title}}</h3>
          <dl>
            <dt>Artist</dt><dd>{{selected.meta.artist_name}}</dd>
            <dt>Location</dt><dd>{{selected.meta.location}}</dd>
          </dl>
        </div>
        <div class="details-item tags">
          <div class="badge-wall">
            <span v-for="(tag, tag_index) in tags" class="badge">{{tag.name}}</span>
          </div>
        </div>
        <div class="details-item toolbox">
          <feature-selector-slider/>
        </div>
      </div>
      <div v-bind:disabled="disabled" v-on:click="toggle" class="details-button">
        <i class="fa fa-angle-left"></i>
        <i class="fa fa-angle-right"></i>
      </div>
    </div>
  </div>`,
  data: function () {
    return {
      hidden: true,
    };
  },
  computed: {
    selected: function () {
      return this.$store.state.selected;
    },
    disabled: function () {
      return this.$store.state.selected != null;
    },
    tags: function () {
      console.log(this.selected.classifier);
      tags = [];
      var i = 0;
      for (let i = 0; i < this.selected.classifier.length; i++) {
        var j = 0;
        for (
          let j = 0;
          j < this.selected.classifier[i].annotations.length;
          j++
        ) {
          tags.push({
            name: this.selected.classifier[i].annotations[j].name,
            value: this.selected.classifier[i].annotations[j].value,
          });
        }
        return tags;
      }
    },
  },
  methods: {
    toggle: function () {
      console.log(this.hidden);
      this.hidden = !this.hidden;
    },
    expand: function () {
      console.log("expand");
    },
  },
  watch: {
    selected: function () {
      console.log("show");
      this.hidden = false;
    },
  },
});

Vue.component("gallery-item", {
  template: `
  <div v-on:click="showDetail" class="grid-item" v-bind:disabled="disabled" v-bind:style="disabled? 'display:none' : ''">
    <img v-bind:src="entry.path" class="grid-item-image" v-on:error="onError"></img>
    <div class="grid-item-overlay">
      <div class="info">
        <div v-if="entry.meta.title" class="title">{{entry.meta.title}}</div>
        <div v-if="entry.meta.artist_name" class="artist">by {{entry.meta.artist_name}}</div>
      </div>
    </div>
  </div>`,

  props: ["entry"],
  data: function () {
    return {
      disabled: false,
    };
  },
  methods: {
    showDetail: function () {
      this.$store.commit("updateSelected", this.entry);
    },
    onError: function (element) {
      this.disabled = true;
    },
  },
});

Vue.component("gallery", {
  template: `
  <div class="grid-view open">
    <gallery-item v-for="(entry, entry_index) in entries" v-bind:key="entry.id" v-bind:entry="entry"/>
  </div>`,
  computed: {
    entries: function () {
      return this.$store.state.entries;
    },
  },
});

Vue.component("search-bar-badge", {
  template: `
    <span v-bind:class="'badge ' + cssType"> {{text}} <i v-on:click="remove" class="fa fa-times-circle"></i></span>`,
  props: ["type", "text", "index", "delete", "index"],
  computed: {
    cssType: function () {
      if (this.type) {
        return 'badge-' + this.type;
      }
      return ''
    }
  },
  methods: {
    remove: function () {
      this.delete(this.index);
      console.log('delete')
    }
  }
});

Vue.component("search-bar", {
  template: `
    <div class="search-bar">
      <button class="search-start" v-on:click="submit"><i class="fa fa-search"></i></button>
      <button v-on:click="upload"><i class="fa fa-upload"></i></button>
      <div class="space"></div>
      
      <div class="search-input">
        <search-bar-badge
          v-for="(badge, index) in badges"  
          v-bind:key="badge.id"
          v-bind:type="badge.type"
          v-bind:text="badge.query"
          v-bind:index="index"
          v-bind:delete=deleteQueryPart>
        </search-bar-badge>
        <input
          v-model="input.shown"
          v-on:paste="suggest"
          v-on:keyup="suggest"
          v-on:keydown="submit"
          id="search-input"
          type="text"
          placeholder="search"
          name="input"
          autocomplete="off"
          autofocus
        ></input>
      </div>


      <div v-if="visible" v-click-outside="hideAutocompletion" class="autocompletion-list">
        <ul v-for="(type, type_index) in suggestions">
          <li v-if="type.group=='annotations'" class="cat-symbol">
            <i v-bind:class="'fa fa-tags'"><span>Tags</span></i>
          </li>
          <li v-if="type.group=='meta'" class="cat-symbol">
            <i v-bind:class="'fa fa-info'"></i><span>Info</span>
          </li>
          <li
            v-for="(suggestion, suggestion_index) in type.suggestions"
            v-bind:class="'autocompletion-item ' + (isItemActive(type_index, suggestion_index)? 'active' : '')"
            v-on:click="addQuery(type_index, suggestion_index)"
          >{{ suggestion }}</li>
        </ul>
      </div>
    </div>`,
  data: function () {
    return {
      queries: [],

      current: {
        group: null,
        index: null,
      },
      input: {
        shown: null,
        typed: "",
      },

      hidden: false,
    };
  },
  computed: {
    badges: function () {
      return this.$store.state.queries;
    },
    suggestions: function () {
      return this.$store.state.suggestions;
    },
    visible: function () {
      // console.log(JSON.stringify(this.suggestions))
      // console.log('' + this.suggestions.length + ' ' + this.input.typed + ' ' + this.hidden)
      if (this.suggestions.length == 0) {
        return false;
      }
      if (this.input.typed === "") {
        return false;
      }
      if (this.hidden) {
        return false;
      }
      console.log('visible')
      return true;
    },
  },
  methods: {
    hideAutocompletion: function () {
      this.hidden = true;
    },
    isItemActive: function (type_index, options_index) {
      return (type_index == this.current.group && options_index == this.current.index)
    },
    submit: function (event) {
      if (event instanceof KeyboardEvent) {
        var key = event.key;
        if (key == "Enter") {
          // Add a therm to the query
          if (this.input.shown) {
            if (this.current.group === null || this.current.group === undefined) {
              // this.queries.push({ type: null, query: this.input.shown });
              this.$store.dispatch("addQuery", { type: null, query: this.input.shown });
            }
            else {
              // this.queries.push({ type: this.suggestions[this.current.group].group, query: this.suggestions[this.current.group].suggestions[this.current.index] });
              this.$store.dispatch("addQuery", { type: this.suggestions[this.current.group].group, query: this.suggestions[this.current.group].suggestions[this.current.index] });
            }
            this.input.shown = '';
            this.input.typed = '';
            this.current.group = null;
            this.current.index = null;
          }
          else {
            // var type = null;
            // if (this.current.group) {
            //   type = this.suggestions[this.current.group].group;
            // }

            // var text = null;
            // if (this.current.group) {
            //   text = this.suggestions[this.current.group].suggestions[this.current.index];
            // }
            this.$store.dispatch("search", {
              queries: this.$store.state.queries,
            });

          }
        }
      }
      console.log('SearchBar: g:' + this.current.group + ' i:' + this.current.index + ' s:' + this.input.shown + ' t:' + this.input.typed + ' q:' + JSON.stringify(this.$store.state.queries))
    },
    deleteQueryPart: function (index) {
      this.$store.dispatch("removeQuery", index);
      // this.queries.splice(index, 1);
    },
    upload: function (event) { },

    addQuery: function (group, index) {
      this.$store.dispatch("addQuery", { type: this.suggestions[group].group, query: this.suggestions[group].suggestions[index] });
      this.input.shown = '';
      this.input.typed = '';
    },
    suggest: function (event) {
      // press down
      if (event instanceof KeyboardEvent) {
        var key = event.key;
        if (key == "ArrowUp") {
          if (this.current.index > 0) {
            this.current.index -= 1;
          }
          else if (this.current.group > 0) {
            this.current.group -= 1;
            this.current.index = this.suggestions[this.current.group].suggestions.length - 1;
          }
          else if (this.current.group === 0 && this.current.index === 0) {
            this.current.group = null;
            this.current.index = null;
          }
          console.log(!this.current.group === null)

          if (this.current.group === null || this.current.group === undefined) {

            this.input.shown = this.input.typed;
          }
          else {
            this.input.shown = this.suggestions[this.current.group].suggestions[this.current.index];
          }

        }
        //press up
        else if (key == "ArrowDown") {
          if (this.current.group === null || this.current.group === undefined) {
            if (this.suggestions.length > 0) {
              // TODO check empty group
              this.current.group = 0
              this.current.index = 0
            }
          }
          else {
            if (this.current.index < this.suggestions[this.current.group].suggestions.length - 1) {
              this.current.index += 1;

            }
            else if (this.current.group < this.suggestions.length - 1) {

              this.current.group += 1
              this.current.index = 0

            }
          }

          this.input.shown = this.suggestions[this.current.group].suggestions[this.current.index]
        }
        // change content
        else {
          this.input.typed = this.input.shown;
          this.$store.dispatch("refreshAutocompletion", {
            query: this.input.shown,
          });
        }
      }
      if (this.input.shown) {
        this.hidden = false;
      }
      console.log('SearchBar: g:' + this.current.group + ' i:' + this.current.index + ' s:' + this.input.shown + ' t:' + this.input.typed + ' q:' + JSON.stringify(this.$store.state.queries))
    },
  },
});

Vue.component("navbar-menu", {
  template: `
  <div class="navbar-menu">

    <button v-on:click="toggle"><i class="fa fa-bars"></i></button>
    <div v-bind:class="'navbar-content ' + (hidden ? 'close': 'open')"">
      <a v-on:click="register" href="javascript:void(0)">Register</a>
      <a href="#">Login</a>
    </div>
  </div>
  `,
  data: function () {
    return {
      hidden: true,
    };
  },
  methods: {
    toggle(event) {
      this.hidden = !this.hidden;
      // this.search(type, options);
    },
    register(event) {
      console.log(this.$store.state.user);
      this.hidden = !this.hidden;
      // this.search(type, options);
    },
  },
});

var app = new Vue({
  el: "#app",
  template: `
    <div>
      <div class="topnav">
        <a class="active" href="#home"><img src="static/img/logo.svg" /></a>
        <search-bar/>
        <navbar-menu/>
      </div>
      <div class="main">
        <detail-view/>
        <gallery/>
      </div>
    </div>`,
  store,
  mounted: function () {
    // TODO start screen with some cool images :-)
    this.$store.dispatch("search", {
      queries: [{ query: "landscape", type: null }]
      // query: ,
      // category: null,
    });
  },
});
