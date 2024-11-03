<template>
<div id="legend" class="d-flex flex-wrap my-4 px-5" :style="{maxWidth: maxWidth + 'px'}">
  <div v-for="(item, idx) in colorPalette" :key="idx" class="d-flex mx-3">
    <div :style="{width: '20px', height: '20px', backgroundColor: item.color, marginRight: '10px'}">
    </div>
    <div>
      {{ item.label}}
    </div>
  </div>
</div>
</template>

<script>
export default {
  name: 'Legend',
  props: {
    colorPalette: Object,
    maxWidth: Number
  }
}
  </script>
