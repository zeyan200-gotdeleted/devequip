import { SITE } from './site';

export interface DiscordServer {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  members: number | null;
  online: number | null;
}

export const inviteCode = SITE.discord.split('/').pop()!;
export const inviteApi = `https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`;

interface InviteResponse {
  guild?: { id: string; name: string; description: string | null; icon: string | null };
  approximate_member_count?: number;
  approximate_presence_count?: number;
}

export function fromInvite(data: InviteResponse): DiscordServer | null {
  const g = data.guild;
  if (!g) return null;
  return {
    id: g.id,
    name: g.name,
    description: g.description,
    icon: g.icon ? `https://cdn.discordapp.com/icons/${g.id}/${g.icon}.png?size=128` : null,
    members: data.approximate_member_count ?? null,
    online: data.approximate_presence_count ?? null,
  };
}

export async function getDiscordServer(): Promise<DiscordServer | null> {
  try {
    const res = await fetch(inviteApi, { signal: AbortSignal.timeout(5000) });
    return res.ok ? fromInvite(await res.json()) : null;
  } catch {
    return null;
  }
}
