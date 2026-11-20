<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import FileTree from './FileTree.vue';
import { fileStats, type FileNode } from '../lib/products';
import { highlight } from '../lib/highlight';

const props = defineProps<{ files: FileNode; source: string | null }>();

const flatten = (node: FileNode): FileNode[] => (node.type === 'file' ? [node] : (node.children ?? []).flatMap(flatten));
const all = flatten(props.files);
const initial =
  all.find((f) => /^init\.luau?$/i.test(f.name) && !/legacy/i.test(f.name)) ??
  all.find((f) => /\.luau?$/i.test(f.name)) ??
  all[0] ??
  null;

const selectedFile = ref<FileNode | null>(initial);
const stats = fileStats(props.files);

const lineCount = computed(() => selectedFile.value?.content?.split('\n').length ?? 1);
const highlighted = computed(() =>
  selectedFile.value?.content ? highlight(selectedFile.value.content, selectedFile.value.name) : '',
);

const copied = ref(false);
const copyFailed = ref(false);
let copiedTimer: ReturnType<typeof setTimeout> | undefined;
watch(selectedFile, () => {
  copied.value = false;
  copyFailed.value = false;
});

const copyFile = async () => {
  try {
    await navigator.clipboard.writeText(selectedFile.value?.content ?? '');
    copied.value = true;
  } catch {
    copyFailed.value = true;
  }
  clearTimeout(copiedTimer);
  copiedTimer = setTimeout(() => {
    copied.value = false;
    copyFailed.value = false;
  }, 2000);
};
</script>

<template>
  <div class="card overflow-hidden">
    <div class="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-5 h-auto min-h-12 py-2 border-b border-line bg-panel-2">
      <span class="font-mono text-xs text-fg-3">
        {{ stats.files }} {{ stats.files === 1 ? 'file' : 'files' }} · {{ stats.lines.toLocaleString('en-US') }} lines
      </span>
      <a v-if="source" :href="source" target="_blank" rel="noopener noreferrer" class="link-arrow text-xs">
        View on GitHub
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
        </svg>
      </a>
    </div>

    <div :class="['grid grid-cols-1', all.length > 1 ? 'md:grid-cols-[15rem_minmax(0,1fr)]' : '']">
      <div
        v-if="all.length > 1"
        class="border-b md:border-b-0 md:border-r border-line p-3 overflow-y-auto code-scrollbar max-h-[220px] md:max-h-[560px]"
      >
        <FileTree :node="files" :depth="0" :selected-file="selectedFile" @select-file="selectedFile = $event" />
      </div>

      <div class="min-w-0 flex flex-col">
        <div class="flex items-center justify-between gap-3 h-11 pl-4 pr-2 border-b border-line">
          <span class="font-mono text-xs text-fg truncate">{{ selectedFile?.name ?? '' }}</span>
          <div class="flex items-center gap-3 shrink-0">
            <span class="hidden sm:inline font-mono text-[11px] text-fg-3">{{ lineCount }} {{ lineCount === 1 ? 'line' : 'lines' }}</span>
            <button type="button" class="btn btn-secondary btn-sm !h-8 !text-xs" :disabled="!selectedFile?.content" @click="copyFile">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-3.5 h-3.5" aria-hidden="true">
                <path v-if="copied" stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                <path v-else stroke-linecap="round" stroke-linejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
              </svg>
              <span aria-live="polite">{{ copied ? 'Copied' : copyFailed ? 'Copy failed' : 'Copy' }}</span>
            </button>
          </div>
        </div>
        <div class="flex overflow-auto code-scrollbar max-h-[520px] py-4 font-mono text-[12.5px] leading-[20px] bg-page">
          <div class="select-none text-right pr-4 pl-3 text-fg-3/60 w-14 shrink-0" aria-hidden="true">
            <div v-for="n in lineCount" :key="n">{{ n }}</div>
          </div>
          <pre class="flex-grow pr-5 text-fg"><code v-html="highlighted"></code></pre>
        </div>
      </div>
    </div>
  </div>
</template>
