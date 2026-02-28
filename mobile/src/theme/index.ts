export type ThemeMode = 'bright' | 'deep' | 'night';

export interface Colors {
  // Backgrounds
  bg: string;
  card: string;
  fieldBg: string;

  // Brand colors
  primary: string;
  primaryLight: string;
  secondary: string;

  // Text
  textPri: string;
  textSec: string;
  textTer: string;

  // Structural
  border: string;
  divider: string;

  // Tab bar
  tabBar: string;
  tabBorder: string;

  // Status bar style
  statusBar: 'dark' | 'light';
}

export const THEMES: Record<ThemeMode, Colors> = {
  bright: {
    bg: '#F5F3FE',
    card: '#FFFFFF',
    fieldBg: '#ECEAFC',

    primary: '#603BDB',
    primaryLight: '#EDE8FC',
    secondary: '#C29BD8',

    textPri: '#1C1240',
    textSec: '#5C5480',
    textTer: '#9E98BC',

    border: '#DDD8F5',
    divider: '#EDE8FC',

    tabBar: '#FFFFFF',
    tabBorder: '#DDD8F5',
    statusBar: 'dark',
  },
  deep: {
    bg: '#130F28',
    card: '#1F1A40',
    fieldBg: '#1A1535',

    primary: '#7B5AE8',
    primaryLight: '#261E52',
    secondary: '#D4A0C8',

    textPri: '#F0EDFF',
    textSec: '#AAA2CC',
    textTer: '#706890',

    border: '#32285A',
    divider: '#261E52',

    tabBar: '#130F28',
    tabBorder: '#32285A',
    statusBar: 'light',
  },
  night: {
    bg: '#0A0818',
    card: '#150F2E',
    fieldBg: '#171130',

    primary: '#9878F2',
    primaryLight: '#1C1540',
    secondary: '#E8B0D8',

    textPri: '#FFFFFF',
    textSec: '#C4BCEE',
    textTer: '#6E6890',

    border: '#241C48',
    divider: '#1C1540',

    tabBar: '#0A0818',
    tabBorder: '#241C48',
    statusBar: 'light',
  },
};

export const THEME_LABELS: Record<ThemeMode, string> = {
  bright: '明亮',
  deep: '深色',
  night: '极夜',
};
