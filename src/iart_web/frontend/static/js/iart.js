// import AnchoredHeading from './AnchoredHeading.vue'
Vue.use(Vuex)

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

store = new Vuex.Store({
  state: {
    query: {},
    suggestions: [],
    entries: [],
    user: null,
    selected: null
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
    }
  },
  actions: {
    refreshAutocompletion(context, parameter) {
      // console.log('start fetch');
      // console.log(parameter.query);
      fetch(url_autocomplete, {
        method: 'POST',
        headers: {
          "X-CSRFToken": csrftoken,
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          query: parameter.query
        })
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        if (data.status == 'ok') {
          // console.log('update suggestions');
          context.commit('updateSuggestions', data['autocompletion']);
        } else {
          console.log('error');
        }
      })
        .catch(error => {
          // console.log('error');
          // console.log(error);
        })
    },
    refreshResults(context, parameter) {
      console.log('start search');
      console.log(parameter.query);
      fetch(url_search, {
        method: 'POST',
        headers: {
          "X-CSRFToken": csrftoken,
          'Content-Type': 'application/json'
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
          query: parameter.query,
          category: parameter.category,
          features: parameter.features,
          id: parameter.reference_id
        })
      }).then(function (res) {
        return res.json();
      }).then(function (data) {
        if (data.status == 'ok') {
          console.log('update entries');
          context.commit('updateEntries', data['entries']);
        } else {
          console.log('error');
        }
      })
        .catch(error => {
          console.log('error');
          console.log(error);
        })
    }
  }
});

Vue.directive('click-outside', {
  bind: function (el, binding, vnode) {
    el.clickOutsideEvent = function (event) {
      // here I check that click was outside the el and his childrens
      if (!(el == event.target || el.contains(event.target))) {
        // and if it did, call method provided in attribute value
        vnode.context[binding.expression](event);
      }
    };
    document.body.addEventListener('click', el.clickOutsideEvent)
  },
  unbind: function (el) {
    document.body.removeEventListener('click', el.clickOutsideEvent)
  },
});

function argMax(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] > r[0] ? a : r))[1];
}

function argMin(array) {
  return array.map((x, i) => [x, i]).reduce((r, a) => (a[0] < r[0] ? a : r))[1];
}

Vue.component('feature-selector-circle', {
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
      features: [{
        name: 'color',
        weight: 0.5
      }, {
        name: 'style',
        weight: 0.5
      }, {
        name: 'year',
        weight: 0.8

      }, {
        name: 'genre',
        weight: 0.8

      }, {
        name: 'genre',
        weight: 0.8

      }],
      dragging: false,
      mousePoint: {
        x: 0,
        y: 0
      },
      height: 250,
      width: 300,
      radius: 100,
      minValue: 0.2,
      maxValue: 0.9,
      selectedFeature: null,
      startingPoint: {
        x: 0,
        y: 0
      },
    }
  },
  methods: {
    startDrag: function (event) {
      // found point
      this.dragging = true;
      console.log('start');

      width = this.width; //this.$refs.svg.getBBox().width;
      height = this.height; // this.$refs.svg.getBBox().height;
      this.mousePoint = this.mouseToPoint(event)
      this.startingPoint = this.mousePoint
      this.selectedFeature = this.pointToFeature(this.mousePoint);

      radial_new = this.pointToRadial(this.mousePoint)


      this.features[this.selectedFeature].weight = Math.min(radial_new.value / this.radius, 1.0);
    },
    moveDrag: function (event) {
      // console.log('move');
      //   console.log(this.dragging);
      if (!this.dragging) {
        return;
      }

      point = this.mouseToPoint(event)
      // console.log(point);
      // console.log(this.mousePoint);
      radial_new = this.pointToRadial(point)
      radial_old = this.pointToRadial(this.startingPoint)
      // console.log(radial_new.value);
      // console.log(radial_old.value);
      console.log({
        i: this.selectedFeature,
        v: this.features[this.selectedFeature].weight,
        n: radial_new.value / this.radius
      });
      var delta_angle = Math.abs(Math.atan2(Math.sin(radial_old.angle - radial_new.angle), Math.cos(radial_old.angle - radial_new.angle)));
      if (delta_angle > 90 / 180 * Math.PI) {
        return
      }


      this.features[this.selectedFeature].weight = Math.min(radial_new.value / this.radius, 1.0);

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
      console.log('stop');
    },
    featureToPoint: function (index, value) {
      var scale = this.radius * value
      var angle = Math.PI * 2 / this.features.length * index
      var cos = Math.cos(angle)
      var sin = Math.sin(angle)
      var tx = scale * sin + this.width / 2
      var ty = scale * cos + this.height / 2
      return {
        x: tx,
        y: ty
      }

    },
    pointToRadial: function (point) {

      var rel_y = point.y - this.height / 2;
      var rel_x = point.x - this.width / 2;
      console.log({
        rel_y: rel_y,
        rel_x: rel_x
      })
      var angle = Math.atan2(-rel_y, rel_x) + Math.PI / 2;
      var o = angle % (2 * Math.PI)
      if (o < 0) {
        angle += 2 * Math.PI;
      }
      var value = Math.sqrt(Math.pow(rel_y, 2) + Math.pow(rel_x, 2));

      return {
        angle: angle,
        value: value
      }
    },
    pointToFeature: function (point) {
      radial = this.pointToRadial(point)

      featuresLength = this.features.length;
      dist = this.features.map(function (element, index) {

        var featureAngle = Math.PI * 2 / featuresLength * index
        return Math.abs(Math.atan2(Math.sin(radial.angle - featureAngle), Math.cos(radial.angle - featureAngle)))
      })
      return argMin(dist)
    },
    mouseToPoint: function (event) {
      var ctm = event.target.getScreenCTM();
      return {
        x: (event.clientX - ctm.e) / ctm.a,
        y: (event.clientY - ctm.f) / ctm.d
      };
    }
  },
  computed: {
    pointsStr: function () {
      return this.points.map(function (point, index) {
        return point.x + ',' + point.y;
      }).join(' ');
    },
    points: function () {
      var results = []
      for (let i = 0; i < this.features.length; i++) {
        results.push(this.featureToPoint(i, this.features[i].weight));
      }
      return results;
    },
    markers: function () {
      var results = []
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
          anchor: anchor
        });
      }
      return results;
    }
  }
})



Vue.component('feature-slider', {
  template: `
    <div class="row feature">
      <label class="col-25">{{name}}</label>
      <input type="checkbox" v-model="actived" v-on:change="process()"></input>
      <input type="range" min="0" max="100" value="50" class="slider" v-model="value" v-bind:disabled="!actived" v-on:change="process()"></input>
    </div>`,
  // props:['features'],
  props: ['plugin', 'update'],
  data: function () {
    return {
      value: 0,
      actived: false,
    }
  },
  methods: {
    process: function () {
      if (this.actived) {
        this.update(this.plugin, this.value)
      }
      else {
        this.update(this.plugin, 0)
      }
    }
  },
  computed: {
    name: function () {
      console.log(this.plugin);
      feature_name = {
        yuv_histogram_feature: "color",
        byol_embedding_feature: "content"
      }

      return feature_name[this.plugin]
    },
  },
})


Vue.component('feature-selector-slider', {
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
      weights: {}
    }
  },
  methods: {
    search: function (event) {

      event.preventDefault();
      // features
      // reference_id


      this.$store.dispatch('refreshResults', {
        features: this.weights,
        reference_id: this.$store.state.selected.id
      });
    },
    update: function (plugin, value) {
      this.weights[plugin] = value / 100;
      if (this.weights[plugin] == 0.0) {
        delete this.weights[plugin];
      }
      console.log(this.weights);
    }
  },
  computed: {
    selected: function () {
      return this.$store.state.selected;
    },
  }
})

// {{selected}}
// {{disabled}}


Vue.component('detail-view', {
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
        <div class="details-item">
          <div class="badge-wall">
            <span v-for="(tag, tag_index) in tags" class="badge">{{tag.name}}</span>
          </div>
        </div>
        <div class="details-item">
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
      hidden: true
    }
  },
  computed: {
    selected: function () {
      return this.$store.state.selected;
    },
    disabled: function () {
      return (this.$store.state.selected != null);
    },
    tags: function () {
      tags = []
      var i = 0;
      for (let i = 0; i < this.selected.classifier.length; i++) {
        var j = 0;
        for (let j = 0; j < this.selected.classifier[i].annotations.length; j++) {
          tags.push({
            name: this.selected.classifier[i].annotations[j].name,
            value: this.selected.classifier[i].annotations[j].value
          });
        }
        return tags;

      }
    }
  },
  methods: {
    toggle: function () {
      console.log(this.hidden);
      this.hidden = !this.hidden;
    },
    expand: function () {
      console.log('expand');
    }
  },
  watch: {
    selected: function () {
      console.log('show');
      this.hidden = false;
    }
  }
})

Vue.component('gallery-item', {
  template: `
  <div v-on:click="showDetail" class="grid-item">
    <img v-bind:src="entry.path" class="grid-item-image"></img>
    <div class="grid-item-overlay">
      <div class="info">
        <div v-if="entry.meta.title" class="title">{{entry.meta.title}}</div>
        <div v-if="entry.meta.artist_name" class="artist">by {{entry.meta.artist_name}}</div>
      </div>
    </div>
  </div>`,

  props: ['entry'],
  methods: {
    showDetail: function () {
      this.$store.commit('updateSelected', this.entry);
    }
  }
})

Vue.component('gallery', {
  template: `
  <div class="grid-view open">
    <gallery-item v-for="(entry, entry_index) in entries" v-bind:key="entry.id" v-bind:entry="entry"/>
  </div>`,
  computed: {
    entries: function () {
      return this.$store.state.entries;
    }
  }
})

Vue.component('search-bar', {
  template: `
    <div class="search-bar">
      <button v-on:click="submit"><i class="fa fa-search"></i></button>
      <div class="space"></div>
      
      <div class="search-input">
      
      <span class="badge">landscape <i class="fa fa-times-circle"></i></span>
        <input
          v-model="query"
          v-on:paste="suggest"
          v-on:keyup="suggest"
          v-on:keydown="submit"
          id="search-input"
          type="text"
          placeholder="search"
          name="query"
          autocomplete="off"
        ></input>
      </div>

      <div v-if="visible" v-click-outside="hideAutocompletion" class="autocompletion-list">
        <ul v-for="(type, type_index) in suggestions">
          <li v-if="type.type=='annotations'" class="cat-symbol">
            <i v-bind:class="'fa fa-tags'"><span>Tags</span></i>
          </li>
          <li v-if="type.type=='meta'" class="cat-symbol">
            <i v-bind:class="'fa fa-info'"></i><span>Info</span>
          </li>
          <li
            v-for="(option, suggestion_index) in type.options"
            v-bind:class="'autocompletion-item ' + (isItemActive(type_index, suggestion_index)? 'active' : '')"
            v-on:click="search(type.type,option)"
          >{{ option }}</li>
        </ul>
      </div>
    </div>`,
  data: function () {
    return {
      query: '',
      queryHidden: '',
      currentSuggestion: -1,
      hidden: false
    }
  },
  computed: {
    suggestions: function () {
      return this.$store.state.suggestions;
    },
    maxSuggestion: function () {

      var index = 0;
      for (let i = 0; i < this.suggestions.length; i++) {
        index += this.suggestions[i].options.length;
      }
      return index;
    },
    visible: function () {
      if (this.maxSuggestion === 0) {
        return false;
      }
      if (this.queryHidden === '') {
        return false;
      }
      if (this.hidden) {
        return false;
      }
      return true;
    }
  },
  methods: {
    hideAutocompletion() {
      this.hidden = true;
    },
    isItemActive(type_index, options_index) {
      // console.log('active');
      // console.log(type_index);
      // console.log(options_index);
      if (type_index >= this.suggestions.length) {
        return false;
      }
      var index = 0;
      var i;
      for (let i = 0; i < type_index; i++) {
        index += this.suggestions[i].options.length;
      }

      index += options_index;
      // console.log('######################################')
      // console.log(index)
      // console.log(this.currentSuggestion)
      result = (index === this.currentSuggestion);
      // console.log(result)
      return result;
    },
    suggestionQuery(index) {
      // console.log('active');
      if (index === -1) {
        return this.queryHidden;
      }
      var suggestion_index = 0;
      var i;
      for (let i = 0; i < this.suggestions.length; i++) {
        for (let j = 0; j < this.suggestions[i].options.length; j++) {
          if (suggestion_index === index) {
            return this.suggestions[i].options[j];
          }
          suggestion_index += 1;
        }
      }
    },
    suggestionType(index) {
      // console.log('active');
      if (index === -1) {
        return null;
      }
      var suggestion_index = 0;
      var i;
      for (let i = 0; i < this.suggestions.length; i++) {
        for (let j = 0; j < this.suggestions[i].options.length; j++) {
          if (suggestion_index === index) {
            return this.suggestions[i].type;
          }
          suggestion_index += 1;
        }
      }

      index += options_index;
      // console.log('######################################')
      // console.log(index)
      // console.log(this.currentSuggestion)
      result = (index === this.currentSuggestion);
      // console.log(result)
      return result;
    },
    submit(event) {
      if (event instanceof KeyboardEvent) {
        if (event.which != 13) {
          return
        }
      }
      type = this.suggestionType(this.currentSuggestion);
      options = this.suggestionQuery(this.currentSuggestion);
      this.search(type, options);
    },

    search(type, query) {
      this.hidden = true;

      this.$store.dispatch('refreshResults', {
        query: query,
        category: type
      });
      // console.log(JSON.stringify({type:type, options:options}));
    },
    suggest(event) {

      if (event.which == 38) {
        this.currentSuggestion = Math.max(this.currentSuggestion - 1, -1);
        this.query = this.suggestionQuery(this.currentSuggestion);
        return
      }

      if (event.which == 40) {
        this.currentSuggestion = Math.min(this.currentSuggestion + 1, this.maxSuggestion - 1);
        this.query = this.suggestionQuery(this.currentSuggestion);
        return
      }

      // TODO im not sure if this is the best solution
      if (event instanceof KeyboardEvent) {
        if (event.which != 13) {
          this.hidden = false;
        }
      }


      // TODO optimize this
      this.$store.dispatch('refreshAutocompletion', {
        query: this.query
      });
      this.queryHidden = this.query;
    },
  },
})

Vue.component('navbar-menu', {
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
      hidden: true
    }
  },
  methods: {
    toggle(event) {
      this.hidden = !this.hidden
      // this.search(type, options);
    },
    register(event) {
      console.log(this.$store.state.user);
      this.hidden = !this.hidden
      // this.search(type, options);
    },
  },
})

var app = new Vue({
  el: '#app',
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
    this.$store.dispatch('refreshResults', {
      query: 'landscape',
      category: null
    });
  }
})
