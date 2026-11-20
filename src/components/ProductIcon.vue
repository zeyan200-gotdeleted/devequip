<script setup lang="ts">
import { ICON_MARKUP } from '../lib/icons';
import type { IconName } from '../lib/productStyle';

defineProps<{ icon: IconName; color: string }>();
</script>

<template>
  <svg viewBox="0 0 24 24" fill="none" :stroke="color" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" v-html="ICON_MARKUP[icon]"></svg>
</template>
