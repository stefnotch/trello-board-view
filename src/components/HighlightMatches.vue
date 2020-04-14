<template>
  <span>
    <span
      v-for="(textPart, index) in textParts"
      :key="index"
      :class="{'highlight': textPart.isMatch}"
    >{{textPart.text}}</span>
  </span>
</template>
<style scoped>
.highlight {
  text-decoration: underline;
  text-decoration-color: var(--foreground-highlight);
  text-decoration-thickness: 2px;
}
</style>
<script lang="ts">
/** Taken from https://github.com/antonreshetov/vue-eva-icons */
import { defineComponent, computed, ref, watch, watchEffect } from "vue";

export default defineComponent({
  props: {
    text: {
      type: String,
      required: true
    },
    highlightText: {
      type: String,
      default: ""
    }
  },
  setup(props, context) {
    const textParts = computed(() => {
      if (props.highlightText.length <= 0) {
        return [
          {
            text: props.text,
            isMatch: false
          }
        ];
      }

      let lowercaseText = props.text.toLowerCase();
      let lowercaseSearchString = props.highlightText.toLowerCase();

      let parts = [] as { text: string; isMatch: boolean }[];
      let lastIndex = 0;
      let index = 0;
      while (true) {
        let index = lowercaseText.indexOf(lowercaseSearchString, lastIndex);
        if (index == -1) break;

        parts.push({
          text: props.text.slice(lastIndex, index),
          isMatch: false
        });
        parts.push({
          text: props.text.slice(index, index + lowercaseSearchString.length),
          isMatch: true
        });
        lastIndex = index + lowercaseSearchString.length;
      }

      parts.push({
        text: props.text.slice(lastIndex, props.text.length),
        isMatch: false
      });

      return parts;
    });
    return {
      textParts
    };
  }
});
</script>