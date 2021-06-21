<template>
  <v-combobox 
    v-model="query" class="mx-1 sbar" @click:clear="remove(-1)"
    :placeholder="$t('home.search.placeholder')" allow-overflow
    @keyup.enter="submit($event, random=false)" rounded solo
    hide-details flat clearable multiple single-line outlined
    v-intro="$t('help.search.general')" v-intro-step="1"
    v-intro-highlight-class="moveClass(true)"
    v-intro-tooltip-class="moveClass(true)"
  >
    <template v-slot:prepend-inner>
      <v-icon :title="$t('button.search')" @click="submit">
        mdi-magnify
      </v-icon>
      <v-icon 
        v-intro="$t('help.search.random')" v-intro-step="3"
        v-intro-highlight-class="moveClass(false)"
        v-intro-tooltip-class="moveClass(false)"
        class="ml-1" :title="$t('search.random')"
        @click="submit($event, random=true)"
      >
        mdi-slot-machine-outline
      </v-icon>
    </template>

    <template v-slot:append>
      <ModalSearch @search="submit" />
    </template>

    <template v-slot:selection="{ attrs, selected, item, index }">
      <v-menu 
        v-model="weightDialog[index]" :close-on-content-click="false" 
        offset-y bottom right open-on-hover
      >
        <template v-slot:activator="{ on }">
          <v-chip 
            v-on="on" v-bind="attrs" :input-value="selected" 
            @click:close="remove(index)" close
          >
            <v-btn 
              v-if="item.positive" @click="toggle(index)" 
              :title="$t('home.search.query.negative')" 
              font-size="18" class="ml-n2" icon small
            >
              <v-icon>mdi-plus</v-icon>
            </v-btn>
            <v-btn 
              v-else @click="toggle(index)" 
              :title="$t('home.search.query.positive')" 
              font-size="18" class="ml-n2" icon small
            >
              <v-icon>mdi-minus</v-icon>
            </v-btn>

            <v-icon v-if="item.type==='idx'" class="mr-1">
              mdi-file-image-outline
            </v-icon>
            <v-icon v-else class="mr-1">
              mdi-file-document-outline
            </v-icon>

            <span v-if="item.type==='idx'" :title="item.label">
              {{ item.label }}
            </span>
            <span v-else :title="item.value">
              {{ item.value }}
            </span>
          </v-chip>
        </template>

        <Weights 
          v-if="item.type==='idx'" :default="item.weights" 
          :local="true" :key="item" :visible="weightDialog[index]"
          @update="updateWeights(index, ...arguments)" 
        />
      </v-menu>
    </template>
  </v-combobox>
</template>

<script>
import { isEqual } from "@/plugins/helpers";

import Weights from "@/components/Weights.vue";
import ModalSearch from "@/components/ModalSearch.vue";

export default {
  data() {
    return {
      weightDialog: {},
      query: this.$store.state.api.query,
    };
  },
  methods: {
    submit(event, random = false) {
      this.$store.commit("api/updateRandom", random);
      this.$store.dispatch("api/load");
    },
    remove(index) {
      if (index === -1) {
        this.query = [];
      } else {
        this.query.splice(index, 1);
      }
    },
    toggle(index) {
      const value = this.query[index].positive;
      this.query[index].positive = !value;
    },
    updateWeights(index, value) {
      this.query[index].weights = value;
    },
    moveClass(less = false) {
      // to get correct position with introjs
      const { path } = this.$router.currentRoute;

      if (path === "/search") {
        if (less) return "move-top7";
        return "move-top12";
      }
    },
  },
  computed: {
    updateQuery() {
      return this.$store.state.api.query;
    },
  },
  watch: {
    query: {
      handler(newValues, oldValues) {
        if (!isEqual(newValues.length, oldValues.length)) {
          this.query = newValues.map((value) => {
            if (typeof value === "string") {
              let positive = true;

              if (value.charAt(0) === "-") {
                value = value.slice(1);
                positive = false;
              }

              value = { type: "txt", positive, value };
            }

            return value;
          });

          this.$store.commit("api/updateQuery", this.query);
        }
      },
      deep: true,
    },
    updateQuery: {
      handler(values) {
        this.query = values;

        if (!this.$store.state.api.random && values.length) {
          this.submit();
        }
      },
      deep: true,
    },
  },
  components: {
    Weights,
    ModalSearch,
  },
};
</script>

<style>
.v-chip .v-avatar {
  padding-top: 3px;
}

.v-input .v-btn {
  letter-spacing: 1;
}

.v-application--is-ltr .v-text-field.v-text-field .v-input__prepend-inner {
  padding-right: 12px;
}

.v-select.v-select--is-menu-active .v-input__icon--append .v-icon {
  transform: rotate(0deg);
}

header .v-autocomplete {
  max-width: calc(100% - 335px);
}

.v-autocomplete:not(.v-input--is-focused).v-select--chips input {
  max-height: 25px !important;
}

header .v-autocomplete .v-text-field.v-text-field--solo .v-input__control input {
  max-width: fit-content;
  min-width: 0;
}

.sbar.v-autocomplete .v-select__selections {
  -ms-overflow-style: none;
  scrollbar-width: none;
  flex-wrap: nowrap;
  overflow-x: auto;
  overflow-y: hidden;
}

.sbar.v-autocomplete .v-select__selections::-webkit-scrollbar {
  height: 0;
  width: 0;
}

.sbar.v-autocomplete .v-select__selections > .v-chip {
  overflow: initial;
}

.theme--light.v-chip,
.theme--light.v-sheet,
.theme--light.v-input input,
.theme--light.v-application,
.theme--light.v-expansion-panels .v-expansion-panel,
.theme--light.v-list-item:not(.v-list-item--active):not(.v-list-item--disabled),
.v-card.login .v-btn.register,
.v-banner .v-btn--text:hover .v-icon {
  color: #1d3557 !important;
}

.theme--light.v-icon,
.v-dialog .v-expansion-panel-content__wrap .capitalize {
  color: rgba(69, 123, 157, 0.54);
}

.v-input__icon--append .theme--light.v-icon:not(.mdi-menu-down),
.v-input__prepend-inner .theme--light.v-icon {
  color: rgba(0, 0, 0, 0.54);
}

.v-main .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
  border: 3px solid;
  color: #f5f5f5;
}

.v-main .v-text-field--outlined.v-input--has-state fieldset, 
.v-main .v-text-field--outlined.v-input--is-focused fieldset {
  border: 3px solid;
  color: #1d3557;
}

header .theme--light.v-text-field--outlined:not(.v-input--is-focused):not(.v-input--has-state) > .v-input__control > .v-input__slot fieldset {
  border: 0px solid;
}

header .v-text-field--outlined.v-input--has-state fieldset, 
header .v-text-field--outlined.v-input--is-focused fieldset {
  border: 0px solid;
}

header .v-text-field--filled > .v-input__control > .v-input__slot, 
header .v-text-field--full-width > .v-input__control > .v-input__slot, 
header .v-text-field--outlined > .v-input__control > .v-input__slot {
  min-height: 48px;
}
</style>
