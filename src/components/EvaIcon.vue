<template>
  <i class="eva-hover">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      :width="width"
      :height="height"
      viewBox="0 0 24 24"
      :fill="fill"
      class="eva eva-animation"
      :class="`eva-icon-hover-${animation}`"
      v-html="iconHtml"
    />
    <svg v-html="'abc'">a</svg>
  </i>
</template>
<script lang="ts">
/** Taken from https://github.com/antonreshetov/vue-eva-icons */
import { defineComponent, computed } from "vue";
// @ts-ignore
import * as eva from "eva-icons/eva";

export default defineComponent({
  props: {
    icon: {
      type: String,
      required: true
    },
    width: {
      type: [String, Number],
      default: 24
    },
    height: {
      type: [String, Number],
      default: 24
    },
    animation: {
      type: String,
      default: undefined
    },
    fill: {
      type: String,
      default: "inherit"
    }
  },
  setup(props, context) {
    const iconHtml = computed(() =>
      eva.icons[props.icon]
        ? (console.log(eva.icons[props.icon].contents),
          eva.icons[props.icon].contents)
        : (console.error(`Unknown icon ${props.icon}`), undefined)
    );

    return {
      iconHtml
    };
  }
});
</script>