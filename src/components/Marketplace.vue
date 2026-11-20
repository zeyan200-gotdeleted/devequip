<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue';
import ProductCard from './ProductCard.vue';
import type { MarketplaceItem } from '../lib/products';
import { url } from '../lib/url';

const props = defineProps<{ products: MarketplaceItem[]; categories: { name: string; count: number }[] }>();

const SORTS = [
  { value: 'popular', label: 'Most downloaded' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'newest', label: 'Recently updated' },
  { value: 'name', label: 'Name A–Z' },
];
const SOURCES = [
  { value: 'all', label: 'All' },
  { value: 'official', label: 'Dev Equip' },
  { value: 'community', label: 'Community' },
];
const filters = reactive({ query: '', category: 'All', sortBy: 'popular', source: 'all' });
const hasCommunity = computed(() => props.products.some((p) => p.community));

const filtered = computed(() => {
  const q = filters.query.trim().toLowerCase();
  let list = [...props.products];
  if (q) list = list.filter((p) => `${p.name} ${p.summary} ${p.category} ${p.developer}`.toLowerCase().includes(q));
  if (filters.category !== 'All') list = list.filter((p) => p.category === filters.category);
  if (filters.source !== 'all') list = list.filter((p) => p.community === (filters.source === 'community'));
  return list.sort((a, b) => {
    if (filters.sortBy === 'rating') return b.rating - a.rating || b.downloads - a.downloads;
    if (filters.sortBy === 'newest') return b.updated.localeCompare(a.updated) || a.name.localeCompare(b.name);
    if (filters.sortBy === 'name') return a.name.localeCompare(b.name);
    return b.downloads - a.downloads;
  });
});

const isFiltered = computed(() => !!filters.query.trim() || filters.category !== 'All' || filters.source !== 'all');

const searchRef = ref<HTMLInputElement | null>(null);

const readUrl = () => {
  const params = new URLSearchParams(location.search);
  const category = params.get('category');
  const sort = params.get('sort');
  const source = params.get('from');
  filters.query = params.get('q') ?? '';
  filters.source = source && SOURCES.some((s) => s.value === source) ? source : 'all';
  filters.category = category && props.categories.some((c) => c.name === category) ? category : 'All';
  filters.sortBy = sort && SORTS.some((s) => s.value === sort) ? sort : 'popular';
};

const writeUrl = () => {
  const params = new URLSearchParams();
  if (filters.query.trim()) params.set('q', filters.query.trim());
  if (filters.category !== 'All') params.set('category', filters.category);
  if (filters.sortBy !== 'popular') params.set('sort', filters.sortBy);
  if (filters.source !== 'all') params.set('from', filters.source);
  const query = params.toString();
  history.replaceState(history.state, '', `${location.pathname}${query ? `?${query}` : ''}${location.hash}`);
};

const onKeydown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
  if (target?.closest('input, textarea, select, [contenteditable]')) return;
  e.preventDefault();
  searchRef.value?.focus();
};

onMounted(() => {
  readUrl();
  watch(filters, writeUrl);
  window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => window.removeEventListener('keydown', onKeydown));

const resetFilters = () => {
  filters.query = '';
  filters.category = 'All';
  filters.sortBy = 'popular';
  filters.source = 'all';
};

const options = computed(() => [{ name: 'All', count: props.products.length }, ...props.categories]);
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[14rem_minmax(0,1fr)] gap-8 lg:gap-10">
    <aside class="min-w-0">
      <template v-if="hasCommunity">
        <h2 class="text-sm font-semibold text-fg mb-2">Made by</h2>
        <div class="grid grid-cols-3 gap-1 p-1 mb-7 rounded-lg border border-line bg-panel" role="group" aria-label="Made by">
          <button
            v-for="s in SOURCES"
            :key="s.value"
            type="button"
            :aria-pressed="filters.source === s.value"
            :class="[
              'h-8 rounded-md text-xs font-semibold cursor-pointer transition-colors',
              filters.source === s.value ? 'bg-navy text-fg shadow-[inset_0_0_0_1px_var(--color-line-2)]' : 'text-fg-3 hover:text-fg',
            ]"
            @click="filters.source = s.value"
          >{{ s.label }}</button>
        </div>
      </template>
      <h2 class="text-sm font-semibold text-fg mb-2">Category</h2>
      <div class="flex lg:flex-col gap-1 lg:gap-0 overflow-x-auto no-scrollbar -mx-4 px-4 lg:mx-0 lg:px-0">
        <button
          v-for="c in options"
          :key="c.name"
          type="button"
          :aria-pressed="filters.category === c.name"
          :class="[
            'shrink-0 flex items-center h-8 px-2.5 rounded text-sm text-left cursor-pointer transition-colors',
            filters.category === c.name ? 'bg-white/[0.08] text-fg' : 'text-fg-3 hover:text-fg',
          ]"
          @click="filters.category = c.name"
        >
          <span class="whitespace-nowrap">{{ c.name === 'All' ? 'All' : c.name }}</span>
          <span class="ml-auto pl-3 text-xs text-fg-3 tabular-nums">{{ c.count }}</span>
        </button>
      </div>
    </aside>

    <div class="min-w-0">
      <div class="flex flex-col sm:flex-row gap-3 mb-5">
        <div class="relative flex-1">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4 text-fg-3 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <input
            ref="searchRef"
            v-model="filters.query"
            type="search"
            aria-label="Search products"
            placeholder="Search products…"
            class="field w-full h-11 pl-10 pr-10 text-sm [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd
            v-if="!filters.query"
            class="hidden sm:block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded border border-line text-[10px] font-mono text-fg-3 pointer-events-none"
            aria-hidden="true"
          >/</kbd>
          <button
            v-else
            type="button"
            class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md text-fg-3 hover:text-fg cursor-pointer"
            aria-label="Clear search"
            @click="filters.query = ''"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <label class="flex items-center gap-2 text-sm text-fg-3">
          <span class="sr-only sm:not-sr-only whitespace-nowrap">Sort by</span>
          <select v-model="filters.sortBy" aria-label="Sort by" class="field h-11 px-3 text-sm cursor-pointer w-full sm:w-auto">
            <option v-for="s in SORTS" :key="s.value" :value="s.value">{{ s.label }}</option>
          </select>
        </label>
      </div>

      <div class="flex items-center justify-between gap-4 mb-5 min-h-6">
        <p class="text-sm text-fg-3" aria-live="polite">
          <span class="text-fg font-semibold">{{ filtered.length }}</span> of {{ products.length }} products
        </p>
        <button v-if="isFiltered" type="button" class="text-sm text-brand-2 hover:text-fg cursor-pointer" @click="resetFilters">
          Clear filters
        </button>
      </div>

      <div v-if="filtered.length > 0" class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-x-5 gap-y-8">
        <ProductCard v-for="product in filtered" :key="product.id" :product="product" :href="url(`/products/${product.id}/`)" />
      </div>

      <div v-else class="card text-center py-16 px-8">
        <p class="text-fg font-semibold mb-1">No products match your search</p>
        <p class="text-fg-3 text-sm mb-6">Try a different word or another category.</p>
        <button type="button" class="btn btn-secondary btn-sm" @click="resetFilters">Reset filters</button>
      </div>
    </div>
  </div>
</template>
