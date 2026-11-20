export type IconName = 'shield' | 'heart' | 'terminal' | 'layout' | 'puzzle' | 'box' | 'map';

const CATEGORY_ICONS: Record<string, IconName> = {
  'Admin Panel': 'shield',
  'Donation Board': 'heart',
  Script: 'terminal',
  'User Interface': 'layout',
  Plugin: 'puzzle',
  '3D Model': 'box',
  Map: 'map',
};

export const iconFor = (category: string): IconName => CATEGORY_ICONS[category] ?? 'box';
