<script setup lang="ts">
import { isFree, type MarketplaceItem } from '../lib/products';

defineProps<{ product: MarketplaceItem; href: string }>();
</script>

<template>
  <a :href="href" class="product-card group flex flex-col">
    <div class="relative aspect-video overflow-hidden rounded-lg border border-line bg-panel-2">
      <img
        :src="product.cover.src"
        :width="product.cover.width"
        :height="product.cover.height"
        :alt="`${product.name} preview`"
        loading="lazy"
        decoding="async"
        class="absolute inset-0 w-full h-full object-cover transition-opacity group-hover:opacity-85"
      />
      <span
        v-if="product.discontinued"
        class="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-rose-950/85 text-[11px] font-medium text-rose-300"
      >Discontinued</span>
    </div>

    <div class="pt-3">
      <div class="flex items-baseline justify-between gap-3">
        <h3 class="font-semibold text-fg truncate group-hover:underline underline-offset-4 decoration-line-2">
          {{ product.name }}
        </h3>
        <span :class="['shrink-0 text-sm', isFree(product.price) ? 'text-fg-3' : 'text-fg font-medium']">{{ product.price }}</span>
      </div>
      <p class="mt-0.5 text-sm text-fg-3 truncate">
        {{ product.category }}<template v-if="product.community"> · by {{ product.developer }}</template>
      </p>
    </div>
  </a>
</template>
