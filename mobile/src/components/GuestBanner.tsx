import React, { useMemo } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function GuestBanner() {
  const { logout } = useAuth();
  const { colors } = useTheme();

  const styles = useMemo(
    () =>
      StyleSheet.create({
        banner: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.primaryLight,
          paddingHorizontal: 16,
          paddingVertical: 8,
          gap: 8,
        },
        icon: { fontSize: 14 },
        text: { flex: 1, fontSize: 13, color: colors.textSec, fontWeight: '500' },
        loginBtn: {
          backgroundColor: colors.primary,
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 8,
        },
        loginText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
      }),
    [colors],
  );

  const handleLogin = () => {
    Alert.alert(
      '退出试用',
      '返回登录页面？',
      [
        { text: '继续试用', style: 'cancel' },
        { text: '去登录', onPress: logout },
      ],
    );
  };

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>🔍</Text>
      <Text style={styles.text}>试用模式 · 数据仅供演示</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={handleLogin}>
        <Text style={styles.loginText}>去登录</Text>
      </TouchableOpacity>
    </View>
  );
}
