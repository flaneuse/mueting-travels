<template>
    <div class="summary">
        <!-- State-by-state totals -->
    <StateTotals :data="stateTotals" :people="people" v-if="stateTotals" class="my-5" />
    </div>
  </template>
  
  <script>
import store from '@/store';

export default {
  name: 'Home',
  components: {
    StateTotals: () => import( /* webpackPrefetch: true */ `@/components/StateTotals.vue`)
  },
  watch: {
  },
  methods: {
  },
  data() {
    return ({
    })
  },
  computed: {
    people() {
      return store.state.people
    },
    stateTotals() {
      return store.state.stateTotals
    },
  }
}
</script>
<style lang="scss" scoped>
</style>
