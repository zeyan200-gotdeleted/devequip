import type { IconName } from './productStyle';

export const ICON_MARKUP: Record<IconName, string> = {
  shield:
    '<path d="M12 2.5 4.5 5.5v5.75c0 4.7 3.1 8.6 7.5 10.25 4.4-1.65 7.5-5.55 7.5-10.25V5.5L12 2.5Z" /><path d="m9 12 2.25 2.25L15.25 10" />',
  heart:
    '<path d="M12 20.5s-8-4.6-8-10.5A4.5 4.5 0 0 1 12 7.2 4.5 4.5 0 0 1 20 10c0 5.9-8 10.5-8 10.5Z" />',
  terminal:
    '<rect x="2.5" y="4" width="19" height="16" rx="2" /><path d="m6.5 9.5 3 2.5-3 2.5M12 15h5" />',
  layout:
    '<rect x="3" y="3.5" width="18" height="17" rx="2" /><path d="M3 9h18M9 9v11.5M12.5 13h5M12.5 16.5h3" />',
  puzzle:
    '<path d="M9 4.5a2 2 0 1 1 4 0V6h4a1 1 0 0 1 1 1v4h-1.5a2 2 0 1 0 0 4H18v4a1 1 0 0 1-1 1h-4v-1.5a2 2 0 1 0-4 0V20H5a1 1 0 0 1-1-1v-4h1.5a2 2 0 1 0 0-4H4V7a1 1 0 0 1 1-1h4V4.5Z" />',
  box:
    '<path d="M12 2.5 20.5 7v10L12 21.5 3.5 17V7L12 2.5Z" /><path d="M12 21.5V12M3.5 7l8.5 5 8.5-5" />',
  map:
    '<path d="m9 4.5-5.5 2v13l5.5-2 6 2 5.5-2v-13l-5.5 2-6-2Z" /><path d="M9 4.5v13M15 6.5v13" />',
};
