<template>
  <div id="network">
    <ModalItem 
      v-model="itemDialog" v-if="entries.length"
      :entry="entries[0]" :entries="data"
    />
    <ModalGrid
      v-model="gridDialog" v-if="entries.length"
      :entries="entries"
    />

    <div class="canvas"></div>
  </div>
</template>

<script>
import { DataSet } from "vis-data/peer";
import { Network } from "vis-network/peer";
import ModalItem from "@/components/ModalItem.vue";
import ModalGrid from "@/components/ModalGrid.vue";

const Colors = [
  "#F44336", "#2196F3", "#8BC34A", "#FF5722", "#E91E63",
  "#03A9F4", "#CDDC39", "#795548", "#9C27B0", "#00BCD4",
  "#FFEB3B", "#607D8B", "#673AB7", "#009688", "#FFC107",
  "#9E9E9E", "#3F51B5", "#4CAF50", "#FF9800", "#000000",
];

export default {
  data() {
    return {
      itemDialog: false,
      gridDialog: false,
      clickTime: 0,
      entries: [],
      state: {
        drag: false,
        grid: false,
      },
      options: {
        physics: false,
        interaction: {
          multiselect: true,
          dragNodes: false,
          hover: true,
        },
      },
      focusOptions: {
        scale: 25,
        animation: {
          easingFunction: "easeInOutQuad",
          duration: 1000,
        },
      },
    };
  },
  computed: {
    data() {
      return this.$store.state.api.hits;
    },
    settings() {
      return this.$store.state.api.settings;
    },
    drawerSettings() {
      return this.$store.state.user.drawer.settings;
    },
  },
  methods: {
    init() {
      this.container = document.querySelector("#network .canvas");
      this.container.oncontextmenu = function () { return false; };

      this.container.addEventListener("mousemove", this.onMouseMove);
      this.container.addEventListener("mousedown", this.onMouseDown);
      this.container.addEventListener("mouseup", this.onMouseUp);

      this.network = new Network(this.container);
      this.network.setOptions(this.options);

      this.canvas = this.network.canvas.frame.canvas;
      this.ctx = this.canvas.getContext("2d");

      this.network.on("hoverNode", function () {
        this.canvas.body.container.style.cursor = "pointer";
      });

      this.network.on("blurNode", function () {
        this.canvas.body.container.style.cursor = "default";
      });

      this.network.on("afterDrawing", () => {
        if (this.state.drag) {
          const start = this.toCanvas(this.rect.startX, this.rect.startY);
          const end = this.toCanvas(this.rect.endX, this.rect.endY);

          const w = end.x - start.x;
          const h = end.y - start.y;

          this.ctx.setLineDash([]);
          this.ctx.fillStyle = "rgba(29, 53, 87, 0.25)";
          this.ctx.fillRect(start.x, start.y, w, h);
        }
      });

      this.network.on("click", this.onClick);
      this.network.on("doubleClick", this.onDoubleClick);

      window.addEventListener("resize", this.onResize);

      const rObs = new ResizeObserver(this.drawNodes);
      rObs.observe(this.container);
    },
    getSize() {
      const network = document.querySelector("#network");

      if (network) {
        const { bottom } = network.getBoundingClientRect();
        let { clientWidth, clientHeight } = network;

        if (bottom >= window.innerHeight) {
          clientHeight -= (bottom - window.innerHeight + 6);
        }

        return [clientWidth, clientHeight];
      }

      return [0, 0];
    },
    onClick({ nodes }) {
      const t0 = new Date();

      if (t0 - this.clickTime > 250) {
        setTimeout(function () {
          if (t0 - this.clickTime > 250) {
            if (nodes && nodes.length === 1) {
              const item = this.nodes.find(
                ({ id }) => nodes.includes(id)
              );

              this.entries = [item.entry];
              this.itemDialog = true;
            }
          }
        }.bind(this), 250);
      }
    },
    onDoubleClick({ nodes }) {
      this.clickTime = new Date();

      if (nodes && nodes.length === 1) {
        this.network.focus(nodes[0], this.focusOptions);
      }
    },
    onResize() {
      if (this.network) {
        this.network.setOptions({
          height: `${this.getSize()[1]}px`,
        });
      }
    },
    onMouseDown({ button, pageX, pageY }) {
      if (this.network && button === 2) {
        const offset = this.container.getBoundingClientRect();

        this.rect = {
          startX: pageX - offset.left,
          startY: pageY - offset.top,
          endX: pageX - offset.left,
          endY: pageY - offset.top,
        };

        this.container.style.cursor = "crosshair";
        this.state.drag = true;
      }
    },
    onMouseUp({ button }) {
      if (this.network && button === 2) {
        this.container.style.cursor = "default";
        this.state.drag = false;
        this.network.redraw();
        this.selectNodes();
      }
    },
    onMouseMove({ pageX, pageY }) {
      if (this.network && this.state.drag) {
        const offset = this.container.getBoundingClientRect();

        this.rect.endX = pageX - offset.left;
        this.rect.endY = pageY - offset.top;
        this.network.redraw();
      }
    },
    drawNodes() {
      const minSize = Math.min(...this.getSize());
      let [boxSize, { grid }] = [0, this.state];

      if (grid) {
        const x = this.data.map(
          ({ coordinates }) => coordinates[0]
        );
        const nX = [...new Set(x)].length;

        const y = this.data.map(
          ({ coordinates }) => coordinates[1]
        );
        const nY = [...new Set(y)].length;

        boxSize = minSize / Math.max(nX, nY);
      } else {
        let { settings } = this.$store.state.api;
        if (!settings) settings.itemSize = 0;

        boxSize = (settings.itemSize + 8) * 1.25;
      }

      this.nodes = this.data.map((entry) => {
        return {
          id: entry.id,
          shape: "custom",
          image: entry.preview,
          group: entry.cluster,
          x: entry.coordinates[0] * minSize,
          y: entry.coordinates[1] * minSize,
          entry,
          ctxRenderer: ({ ctx, x, y }) => {
            const img = new Image();
            img.src = entry.preview;

            let minImgSize = img.width;
            let maxImgSize = img.height;

            if (img.width > img.height) {
              minImgSize = img.height;
              maxImgSize = img.width;
            }

            return {
              drawNode() {
                if (grid) {
                  ctx.drawImage(
                    img,
                    (img.width - minImgSize) / 2,
                    (img.height - minImgSize) / 2,
                    minImgSize,
                    minImgSize,
                    x - boxSize / 2,
                    y - boxSize / 2,
                    boxSize,
                    boxSize,
                  );

                  if (typeof entry.cluster !== "undefined") {
                    ctx.fillStyle = Colors[entry.cluster];
                    ctx.beginPath();

                    ctx.arc(
                      x + boxSize / 2 - boxSize / 5,
                      y - boxSize / 2 + boxSize / 5,
                      boxSize / 7,
                      0,
                      2 * Math.PI,
                    );

                    ctx.fill();
                  }
                } else {
                  const width = img.width / maxImgSize;
                  const height = img.height / maxImgSize;

                  ctx.drawImage(
                    img,
                    x - (width * boxSize) / 2,
                    y - (height * boxSize) / 2,
                    width * boxSize,
                    height * boxSize,
                  );

                  if (typeof entry.cluster !== "undefined") {
                    ctx.fillStyle = Colors[entry.cluster];
                    ctx.beginPath();

                    ctx.arc(
                      x + (width * boxSize) / 2 - boxSize / 5,
                      y - (height * boxSize) / 2 + boxSize / 5,
                      boxSize / 7,
                      0,
                      2 * Math.PI,
                    );

                    ctx.fill();
                  }
                }
              },
              nodeDimensions: {
                width: boxSize,
                height: boxSize,
              },
            }
          },
        };
      });

      this.network.setData({ nodes: this.nodes });
      this.onResize();
    },
    selectNodes() {
      const start = this.toCanvas(this.rect.startX, this.rect.startY);
      const end = this.toCanvas(this.rect.endX, this.rect.endY);

      const [ startX, endX ] = this.correctRange(start.x, end.x);
      const [ startY, endY ] = this.correctRange(start.y, end.y);

      const selected = this.nodes.filter(({ x, y }) => {
        return x >= startX && x <= endX && y >= startY && y <= endY;
      });

      this.entries = selected.map(({ entry }) => { return entry });
      this.gridDialog = true;
    },
    toCanvas(domX, domY) {
      const values = { x: domX, y: domY };

      return this.network.DOMtoCanvas(values);
    },
    correctRange(x, y) {
      return x < y ? [x, y] : [y, x];
    },
  },
  watch: {
    data() {
      this.drawNodes();
    },
    settings(values) {
      this.state.grid = values.grid;
      this.drawNodes();
    },
    drawerSettings() {
      setTimeout(() => {
        this.onResize();
      }, 250);
    },
  },
  created() {
    const { settings } = this.$store.state.api;

    if (Object.keys(settings).length) {
      this.state.grid = settings.grid;
    }
  },
  mounted() {
    this.init();
  },
  components: {
    ModalItem,
    ModalGrid,
  },
};
</script>

<style>
#network {
  height: 100%;
  width: 100%;
}

#network .vis-network {
  background-color: #e0e0e0;
}

#network .vis-network:focus {
  outline: none;
}
</style>