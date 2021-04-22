<template>
  <div class="umap">
    <ModalItem v-model="dialog" v-if="entry" :entry="entry" />
    <div class="canvas"></div>
  </div>
</template>

<script>
import * as THREE from "three";
import * as TWEEN from "@tweenjs/tween.js";
import { Interaction } from "three.interaction";
import { TrackballControls } from "three/examples/jsm/controls/TrackballControls";

import ModalItem from "@/components/ModalItem.vue";

export default {
  data() {
    return {
      canvasSize: 100,
      dialog: false,
      entry: null,
      timer: null,
      nStep: 8,
    };
  },
  computed: {
    data() {
      return this.$store.state.api.hits;
    },
    settings() {
      return this.$store.state.user.drawer.settings;
    },
    meshSize() {
      const { settings } = this.$store.state.api;

      if (settings) {
        return 0.5 * (settings.zoomLevel + 7);
      }

      return 1.3;
    },
    zoomStep() {
      return this.canvasSize / this.nStep;
    },
  },
  methods: {
    init() {
      const [width, height] = this.getSize();

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xe0e0e0);

      this.camera = new THREE.PerspectiveCamera(
        0.5 * this.canvasSize,
        width / height
      );

      this.resetCamera(0, 0, 12 * this.zoomStep);

      this.renderer = new THREE.WebGLRenderer({ antialias: true });
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(width, height);

      const canvas = document.querySelector(".umap .canvas");
      canvas.appendChild(this.renderer.domElement);

      window.addEventListener("resize", this.onResize);
      this.interaction = new Interaction(
        this.renderer,
        this.scene,
        this.camera
      );
    },
    controls() {
      this.controls = new TrackballControls(
        this.camera,
        this.renderer.domElement
      );

      const ALT_KEY = 18;
      const CTRL_KEY = 17;
      const CMD_KEY = 91;

      this.controls.dynamicDampingFactor = 0.1;
      this.controls.keys = [ALT_KEY, CTRL_KEY, CMD_KEY];

      this.controls.minDistance = 0 * this.zoomStep;
      this.controls.maxDistance = 14 * this.zoomStep;

      this.controls.mouseButtons = {
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.ZOOM,
        RIGHT: THREE.MOUSE.ROTATE,
      };

      this.renderer.domElement.addEventListener("wheel", this.onWheel, false);
    },
    animate() {
      requestAnimationFrame(this.animate);
      this.controls.update();

      TWEEN.update();
      this.renderScene();
    },
    getTexture(entry) {
      const loader = new THREE.TextureLoader();

      return new Promise((resolve, reject) => {
        loader.load(
          entry.path,
          (texture) => resolve(texture),
          undefined,
          (error) => reject(error)
        );
      });
    },
    addMesh(entry, type) {
      this.getTexture(entry).then((texture) => {
        let { width, height } = texture.image;
        const [x, y, z] = entry.coordinates;

        let geometry = null;

        if (type === "cylinder") {
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.RepeatWrapping;

          if (width > height) {
            texture.repeat.set(height / width, 1);
            texture.offset.x = 0.5 * (1 - height / width);
          } else {
            texture.repeat.set(1, width / height);
            texture.offset.y = 0.5 * (1 - width / height);
          }

          geometry = new THREE.CylinderBufferGeometry(
            this.meshSize,
            this.meshSize,
            0.05,
            48
          );
        } else if (type === "plane") {
          if (width > height) {
            height /= width / this.meshSize;
            width = this.meshSize;
          } else {
            width /= height / this.meshSize;
            height = this.meshSize;
          }

          geometry = new THREE.BoxBufferGeometry(width, height, 0.05, 1, 1, 1);
        }

        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.setX((x - 0.5) * this.canvasSize);
        mesh.position.setY((y - 0.5) * this.canvasSize);

        if (z !== undefined) {
          mesh.position.setZ((z - 0) * this.canvasSize);
        }

        if (type === "cylinder") {
          mesh.rotation.set(Math.PI / 2, Math.PI / 2, 0);
        }

        mesh.entry = entry;
        mesh.cursor = "pointer";
        mesh.on("click", this.onClick);

        this.scene.add(mesh);
      });
    },
    getSize() {
      const umap = document.querySelector(".umap");
      let { clientWidth, clientHeight } = umap;
      const rect = umap.getBoundingClientRect();

      if (rect.bottom >= window.innerHeight) {
        clientHeight -= (rect.bottom - window.innerHeight + 6);
      }

      return [clientWidth, clientHeight];
    },
    renderScene() {
      this.renderer.render(this.scene, this.camera);
    },
    resetCamera(x, y, z) {
      new TWEEN.Tween(this.camera.position)
        .to({ x, y, z }, 750)
        .easing(TWEEN.Easing.Quadratic.In)
        .onComplete(() => {
          this.camera.position.copy({ x, y, z });
        })
        .start();
    },
    resetControls(x, y, z) {
      new TWEEN.Tween(this.controls.target)
        .to({ x, y, z }, 750)
        .easing(TWEEN.Easing.Quadratic.In)
        .onComplete(() => {
          this.controls.target.copy({ x, y, z });
          this.controls.update();
        })
        .start();
    },
    resetScene() {
      while (this.scene.children.length) {
        this.scene.remove(this.scene.children[0]);
      }

      if (this.data !== undefined) {
        this.data.forEach((entry) => {
          if (entry.coordinates) {
            this.addMesh(entry, "plane");
          }
        });
      }
    },
    onResize() {
      if (document.querySelector(".umap") !== null) {
        const [width, height] = this.getSize();

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height);
      }
    },
    onClick(event) {
      if (event.data.originalEvent.detail === 1) {
        this.timer = setTimeout(() => {
          this.entry = event.data.target.entry;
          this.dialog = true;
        }, 250);
      } else {
        clearTimeout(this.timer); TWEEN.removeAll();
        const { x, y, z } = event.data.target.position;

        this.resetCamera(x, y, z + 1.5 * this.meshSize);
        this.resetControls(x, y, 0);
      }
    },
  },
  watch: {
    data() {
      this.resetCamera(0, 0, 12 * this.zoomStep);
      this.resetControls(0, 0, 0);
      this.resetScene();
    },
    settings() {
      setTimeout(() => {
        this.onResize();
      }, 250);
    },
    meshSize() {
      this.resetScene();
    },
  },
  mounted() {
    this.init();
    this.controls();
    this.animate();
  },
  components: {
    ModalItem,
  },
};
</script>

<style>
.umap {
  width: 100%;
  height: 100%;
}
</style>
