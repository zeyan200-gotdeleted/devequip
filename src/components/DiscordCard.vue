<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { fromInvite, inviteApi, type DiscordServer } from '../lib/discord';

const props = defineProps<{ initial: DiscordServer | null; invite: string; logo: string }>();

interface WidgetMember {
  id: string;
  username: string;
  status: 'online' | 'idle' | 'dnd';
  avatar_url: string;
}

const server = ref<DiscordServer | null>(props.initial);
const members = ref<WidgetMember[]>([]);
const loading = ref(true);
const SHOWN = 8;

onMounted(async () => {
  try {
    const invite = fromInvite(await (await fetch(inviteApi)).json());
    if (invite) server.value = invite;
    if (!server.value) return;
    const widget = await (await fetch(`https://discord.com/api/guilds/${server.value.id}/widget.json`)).json();
    if (Array.isArray(widget.members)) members.value = widget.members.slice(0, SHOWN);
  } catch {
    return;
  } finally {
    loading.value = false;
  }
});

const STATUS = { online: '#23a55a', idle: '#f0b232', dnd: '#f23f43' } as const;
const fmt = (n: number) => n.toLocaleString('en-US');
</script>

<template>
  <div class="overflow-hidden rounded-xl border border-white/15 bg-[#0b1626]">
    <div class="relative aspect-[3/1] overflow-hidden bg-[#00254c] border-b border-white/10">
      <div class="absolute inset-0 flex items-center justify-center gap-3">
        <img :src="logo" alt="" width="48" height="48" class="w-12 h-12 object-contain" />
        <span class="font-display text-2xl font-bold tracking-tight text-white">Dev Equip</span>
      </div>
    </div>

    <div class="px-5 sm:px-6 pb-6">
      <div class="relative flex items-end justify-between gap-4 -mt-9 mb-4">
        <div class="w-[4.5rem] h-[4.5rem] rounded-2xl border-4 border-[#0b1626] bg-[#00305f] overflow-hidden shrink-0">
          <img v-if="server?.icon" :src="server.icon" alt="" class="w-full h-full object-cover" />
        </div>
        <span class="inline-flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-white/5 border border-white/10 text-[11px] font-semibold text-fg-2">
          <svg viewBox="0 0 24 24" fill="currentColor" class="w-3.5 h-3.5 text-[#8b95f9]" aria-hidden="true">
            <path d="M20.32 4.37A19.8 19.8 0 0 0 15.4 2.84a13.7 13.7 0 0 0-.63 1.29 18.4 18.4 0 0 0-5.53 0 12.6 12.6 0 0 0-.64-1.29 19.7 19.7 0 0 0-4.93 1.53C.54 9.06-.3 13.62.12 18.12a19.9 19.9 0 0 0 6.04 3.05 14.6 14.6 0 0 0 1.29-2.1 12.9 12.9 0 0 1-2.04-.97c.17-.13.34-.26.5-.39a14.2 14.2 0 0 0 12.18 0c.16.14.33.27.5.39-.65.38-1.33.71-2.04.98.37.74.8 1.44 1.3 2.1a19.8 19.8 0 0 0 6.03-3.05c.5-5.2-.84-9.73-3.56-13.76ZM8.02 15.36c-1.18 0-2.16-1.09-2.16-2.42 0-1.34.96-2.43 2.16-2.43 1.21 0 2.18 1.1 2.16 2.43 0 1.33-.96 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.15-1.09-2.15-2.42 0-1.34.95-2.43 2.15-2.43 1.21 0 2.18 1.1 2.16 2.43 0 1.33-.95 2.42-2.16 2.42Z" />
          </svg>
          Discord server
        </span>
      </div>

      <h3 class="font-display text-xl font-bold text-white mb-1.5">{{ server?.name ?? 'Dev Equip' }}</h3>
      <p v-if="server?.description" class="text-sm leading-relaxed text-[#c3d5ea] line-clamp-2 mb-5">{{ server.description }}</p>

      <div v-if="server?.online != null && server?.members != null" class="flex flex-wrap gap-x-5 gap-y-1 text-sm mb-5">
        <span class="inline-flex items-center gap-2 text-white">
          <span class="w-2 h-2 rounded-full bg-[#23a55a]" aria-hidden="true"></span>
          <span><span class="font-semibold">{{ fmt(server.online) }}</span> online</span>
        </span>
        <span class="inline-flex items-center gap-2 text-white">
          <span class="w-2 h-2 rounded-full bg-[#8a9bb3]" aria-hidden="true"></span>
          <span><span class="font-semibold">{{ fmt(server.members) }}</span> members</span>
        </span>
      </div>

      <div v-if="loading" class="flex -space-x-2 mb-6" aria-hidden="true">
        <span v-for="n in SHOWN" :key="n" class="w-8 h-8 rounded-full ring-2 ring-[#0b1626] bg-[#13243d]"></span>
      </div>
      <div v-else-if="members.length" class="flex items-center gap-3 mb-6">
        <ul class="flex -space-x-2" aria-label="Some of the members online now">
          <li v-for="m in members" :key="m.id" class="relative">
            <img :src="m.avatar_url" :alt="m.username" :title="m.username" width="32" height="32" class="w-8 h-8 rounded-full ring-2 ring-[#0b1626] bg-[#00305f]" />
            <span class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full ring-2 ring-[#0b1626]" :style="{ background: STATUS[m.status] ?? STATUS.online }" aria-hidden="true"></span>
          </li>
        </ul>
        <span v-if="server?.online && server.online > members.length" class="text-xs text-[#9fb6d1]">
          +{{ fmt(server.online - members.length) }} more online
        </span>
      </div>

      <a :href="invite" class="btn btn-light w-full !h-11" target="_blank" rel="noopener noreferrer">Join the server</a>
    </div>
  </div>
</template>
