<template>
  <div class="progress-bar" :class="{'large':large}">
    <div class="progress-bar-progress" :style="{'width': percentage}"></div>
    <div
      class="progress-bar-text-white"
      v-if="large"
      :style="{'clip-path': `polygon(0% 0%, ${percentage} 0%, ${percentage} 100%, 0% 100%)`}"
    >{{value}}/{{max}}</div>
    <div
      class="progress-bar-text-black"
      v-if="large"
      :style="{'clip-path': `polygon(100% 0%, ${percentage} 0%, ${percentage} 100%, 100% 100%)`}"
    >{{value}}/{{max}}</div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  computed,
  ref,
  watch,
  watchEffect,
  toRefs
} from "vue";

export default defineComponent({
  props: {
    max: {
      type: Number,
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    large: {
      type: Boolean,
      default: false
    }
  },
  setup(props, context) {
    const { max, value, large } = toRefs(props);

    const percentage = computed(
      () => (max ? (value.value / max.value) * 100 : 0) + "%"
    );

    return {
      max,
      value,
      large,
      percentage
    };
  }
});
</script>
<style scoped>
.large {
  height: 20px;
}
.progress-bar {
  display: flex;
  flex-direction: column;
  height: 4px;
  position: relative;
}
.progress-bar-progress {
  background-color: #19a187;
  flex-grow: 1;
}
.progress-bar-text-white {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  color: white;
}
.progress-bar-text-black {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  text-align: center;
  color: black;
}
</style>