<template>
  <i class="eva-hover icon">
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
  </i>
</template>
<style scoped>
.icon {
  vertical-align: middle;
  padding-left: 2px;
  padding-right: 2px;
}
</style>
<script lang="ts">
/** Taken from https://github.com/antonreshetov/vue-eva-icons */
import { defineComponent, computed, ref, watch, watchEffect } from "vue";
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
      default: 18
    },
    height: {
      type: [String, Number],
      default: 18
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
    const iconSvg = ref<HTMLElement>();

    const iconHtml = computed(() =>
      eva.icons[props.icon]
        ? eva.icons[props.icon].contents
        : (console.error(`Unknown icon ${props.icon}`), undefined)
    );

    return {
      iconHtml
    };
  }
});
</script>