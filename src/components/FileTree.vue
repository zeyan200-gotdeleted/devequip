<script setup lang="ts">
import { computed, ref, toRaw } from 'vue';
import type { FileNode } from '../lib/products';

const props = withDefaults(defineProps<{ node: FileNode; depth?: number; selectedFile?: FileNode | null }>(), {
  depth: 0,
  selectedFile: null,
});
const emit = defineEmits<{ 'select-file': [file: FileNode] }>();

const open = ref(true);
const isSelected = computed(() => !!props.selectedFile && toRaw(props.selectedFile) === toRaw(props.node));
</script>

<template>
  <div class="select-none font-mono text-xs">
    <div v-if="node.type === 'directory'">
      <button
        type="button"
        class="w-full text-left flex items-center gap-1.5 h-7 pr-2 rounded-md cursor-pointer text-fg-2 hover:text-fg hover:bg-panel-2 transition-colors"
        :style="{ paddingLeft: `${depth * 12 + 6}px` }"
        :aria-expanded="open"
        @click="open = !open"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" :class="['w-3.5 h-3.5 shrink-0 text-fg-3 transition-transform', { 'rotate-90': open }]" aria-hidden="true">
          <path fill-rule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clip-rule="evenodd" />
        </svg>
        <span class="truncate">{{ node.name }}</span>
      </button>
      <div v-show="open">
        <FileTree
          v-for="child in node.children"
          :key="child.name"
          :node="child"
          :depth="depth + 1"
          :selected-file="selectedFile"
          @select-file="emit('select-file', $event)"
        />
      </div>
    </div>
    <button
      v-else
      type="button"
      :aria-current="isSelected ? 'true' : undefined"
      :class="[
        'w-full text-left flex items-center h-7 pr-2 rounded-md cursor-pointer transition-colors truncate',
        isSelected ? 'bg-navy text-fg font-semibold' : 'text-fg-3 hover:text-fg hover:bg-panel-2',
      ]"
      :style="{ paddingLeft: `${depth * 12 + 26}px` }"
      @click="emit('select-file', node)"
    >
      <span class="truncate">{{ node.name }}</span>
    </button>
  </div>
</template>
