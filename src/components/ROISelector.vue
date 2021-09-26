<template>
  <v-img
    v-bind="computedProps"
    ref="imageElement"
    v-on="listeners$"
    v-on:load="loaded"
  >
    <template v-slot:placeholder>
      <slot name="placeholder"></slot>
    </template>
    <div
      v-bind:style="{
        height: imageHeight + 'px',
        width: imageWidth + 'px',
        position: 'relative',
        margin: 'auto',
        zIndex: 100,
      }"
    >
      <canvas
        ref="canvas"
        class="canvas"
        @mousedown="mouseDown"
        @mouseup="mouseUp"
        @mousemove="mouseMove"
        @mouseleave="mouseUp"
        @click="mouseClick"
        v-click-outside="clickOutside"
      >
      </canvas>
      <v-menu
        :value="showMenu"
        :position-x="x"
        :position-y="y"
        :close-on-click="false"
        transition="fade-transition"
        absolute
        offset-y
      >
        <slot name="context"></slot>
      </v-menu>
    </div>
  </v-img>
</template>

<script>
import { keyInObj } from "@/plugins/helpers";
import { VImg } from "vuetify/lib";

export default {
  extends: VImg,
  name: "roi-selector",
  props: {
    ...VImg.props,
    value: Object,
  },
  data: function () {
    return {
      ...VImg.data,
      roi: null,
      showMenu: false,
      image: null,
      canvas: null,
      ctx: null,
      x: null,
      y: null,
      mouse: {
        start: null,
        down: null,
      },
    };
  },
  computed: {
    computedProps: function () {
      return {
        ...this.$props,
      };
    },
    imageHeight: function () {
      if (this.image) {
        return this.scaleSelector().height;
      }
      return 0;
    },
    imageWidth: function () {
      if (this.image) {
        return this.scaleSelector().width;
      }
      return 100;
    },
  },

  methods: {
    scaleSelector() {
      let current_height = this.$el.clientHeight;
      let element_height = this.image.naturalHeight;
      let current_width = this.$el.clientWidth;
      let element_width = this.image.naturalWidth;

      let height_scale = 1.0;
      let width_scale = 1.0;
      // if (element_height > current_height) {
      height_scale = current_height / element_height;
      // }
      // if (element_width > current_width) {
      width_scale = current_width / element_width;
      // }
      let scale = Math.min(height_scale, width_scale);

      return {
        height: element_height * scale,
        width: element_width * scale,
      };
    },
    loaded(src) {
      const image = new Image();

      image.onload = () => {
        /* istanbul ignore if */
        if (image.decode) {
          image.decode();
        } else {
          this.onLoad();
        }
      };
      image.src = src;
      this.image = image;
    },

    computeRect(pos1, pos2) {
      return {
        x: Math.min(pos1.x, pos2.x),
        y: Math.min(pos1.y, pos2.y),
        width: Math.max(pos1.x, pos2.x) - Math.min(pos1.x, pos2.x),
        height: Math.max(pos1.y, pos2.y) - Math.min(pos1.y, pos2.y),
      };
    },
    clickOutside(evt) {
      this.mouse.down = false;
      this.showMenu = false;
    },
    mouseClick(evt) {
      evt.preventDefault();
      console.log("click");
    },
    mouseDown(evt) {
      console.log("Down");
      evt.preventDefault();
      let event_pos = this.mousePos(evt);
      this.mouse.start = event_pos;
      this.mouse.down = true;

      this.showMenu = false;

      if (this.ctx) {
        this.ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
        this.ctx.fillStyle = "#bdbdbdaa";
        this.ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);
      }
    },
    mouseUp(evt) {
      console.log("UP");
      let event_pos = this.mousePos(evt);
      if (this.ctx && this.mouse.down) {
        this.mouse.down = false;
        let rect = this.computeRect(this.mouse.start, event_pos);

        // area to small
        if (rect.width * rect.height < 20) {
          // set roi
          this.$emit("input", null);
          this.ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
          return;
        }

        // draw selected area
        this.ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
        this.ctx.fillStyle = "#bdbdbdaa";
        this.ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);

        this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.beginPath();
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.stroke();

        // set roi
        this.$emit("input", {
          x: rect.x / this.imageWidth,
          y: rect.y / this.imageHeight,
          width: rect.width / this.imageWidth,
          height: rect.height / this.imageHeight,
        });

        this.showMenu = false;
        this.x = evt.clientX;
        this.y = evt.clientY;
        this.$nextTick(() => {
          this.showMenu = true;
        });
      }

      // disable tracking
    },
    mouseMove(evt) {
      let event_pos = this.mousePos(evt);
      if (this.ctx && this.mouse.down) {
        let rect = this.computeRect(this.mouse.start, event_pos);
        this.ctx.clearRect(0, 0, this.imageWidth, this.imageHeight);
        this.ctx.fillStyle = "#bdbdbdaa";
        this.ctx.fillRect(0, 0, this.imageWidth, this.imageHeight);

        this.ctx.clearRect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.beginPath();
        this.ctx.rect(rect.x, rect.y, rect.width, rect.height);
        this.ctx.stroke();
      }
    },
    mousePos(evt) {
      var rect = this.canvas.getBoundingClientRect(),
        scaleX = this.canvas.width / rect.width,
        scaleY = this.canvas.height / rect.height;

      return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY,
      };
    },
  },
  mounted() {
    var canvas = this.$refs.canvas;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
  },
  watch: {
    imageHeight() {
      if (this.ctx) {
        this.ctx.canvas.width = this.imageWidth;
        this.ctx.canvas.height = this.imageHeight;
      }
    },
    imageWidth() {
      if (this.ctx) {
        this.ctx.canvas.width = this.imageWidth;
        this.ctx.canvas.height = this.imageHeight;
      }
    },
    showMenu() {
      console.log("############");
      console.log(this.showMenu);
    },
  },
};
</script>

<style>
.canvas {
  width: 100%;
  height: 100%;
}
</style>