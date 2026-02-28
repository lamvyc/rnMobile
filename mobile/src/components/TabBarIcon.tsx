import React from 'react';
import { Text } from 'react-native';

// 使用 Emoji 实现简单图标（无需额外依赖）
const ICONS: Record<string, string> = {
  'check-circle': '✓',
  'people': '👥',
  'person': '👤',
};

interface TabBarIconProps {
  name: string;
  color: string;
  size: number;
}

export function TabBarIcon({ name, color, size }: TabBarIconProps) {
  return (
    <Text style={{ fontSize: size * 0.85, color }}>
      {ICONS[name] ?? '●'}
    </Text>
  );
}
