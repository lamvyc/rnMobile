import React, { useMemo, useState } from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { usersApi } from '../services/api';
import GuestBanner from '../components/GuestBanner';
import type { ProfileStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refreshUser, isGuest } = useAuth();
  const { colors } = useTheme();
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.bg },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        },
        title: { fontSize: 22, fontWeight: '700', color: colors.textPri },
        settingsBtn: { padding: 4 },
        settingsIcon: { fontSize: 22 },

        scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },

        avatarSection: { alignItems: 'center', paddingVertical: 16 },
        avatarCircle: {
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: colors.primaryLight,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 14,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.25,
          shadowRadius: 10,
          elevation: 4,
        },
        avatarText: { fontSize: 36, fontWeight: '700', color: colors.primary },
        nickRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
        nickname: { fontSize: 22, fontWeight: '700', color: colors.textPri },
        editHint: { fontSize: 16 },
        phoneDisplay: { fontSize: 15, color: colors.textSec },

        editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
        nicknameInput: {
          height: 40,
          borderWidth: 1.5,
          borderColor: colors.primary,
          borderRadius: 10,
          paddingHorizontal: 12,
          fontSize: 16,
          color: colors.textPri,
          minWidth: 160,
          backgroundColor: colors.fieldBg,
        },
        saveNickBtn: {
          backgroundColor: colors.primary,
          paddingHorizontal: 14,
          paddingVertical: 8,
          borderRadius: 8,
        },
        saveNickText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
        cancelNickBtn: { paddingHorizontal: 10, paddingVertical: 8 },
        cancelNickText: { color: colors.textSec, fontSize: 13 },

        infoCard: {
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 6,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        },
        infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 14 },
        infoIcon: { fontSize: 18, marginRight: 12, width: 24 },
        infoLabel: { flex: 1, fontSize: 15, color: colors.textSec },
        infoValue: { fontSize: 15, color: colors.textTer, fontWeight: '500' },
        divider: { height: 1, backgroundColor: colors.divider, marginHorizontal: 14 },

        safeTip: {
          flexDirection: 'row',
          gap: 12,
          backgroundColor: colors.primaryLight,
          borderRadius: 16,
          padding: 16,
        },
        safeTipIcon: { fontSize: 24 },
        safeTipTitle: { fontSize: 15, fontWeight: '600', color: colors.textPri, marginBottom: 4 },
        safeTipDesc: { fontSize: 13, color: colors.textSec, lineHeight: 20 },
      }),
    [colors],
  );

  const displayPhone = isGuest ? '未登录' : (user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1 **** $2') ?? '');
  const initial = isGuest ? '游' : (user?.nickname || user?.phone || '?').charAt(0).toUpperCase();
  const joinDate = isGuest ? '试用中' : (user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '未知');

  const handleSaveNickname = async () => {
    if (!nickname.trim()) {
      Alert.alert('提示', '昵称不能为空');
      return;
    }
    setSaving(true);
    try {
      const updated = await usersApi.updateProfile({ nickname: nickname.trim() });
      refreshUser(updated);
      setEditingNickname(false);
    } catch (err: any) {
      Alert.alert('保存失败', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {isGuest && <GuestBanner />}
      <View style={styles.header}>
        <Text style={styles.title}>我的</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {editingNickname && !isGuest ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nicknameInput}
                value={nickname}
                onChangeText={setNickname}
                placeholder="输入昵称"
                placeholderTextColor={colors.textTer}
                maxLength={20}
                autoFocus
              />
              <TouchableOpacity style={styles.saveNickBtn} onPress={handleSaveNickname} disabled={saving}>
                <Text style={styles.saveNickText}>{saving ? '...' : '保存'}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelNickBtn} onPress={() => { setNickname(user?.nickname ?? ''); setEditingNickname(false); }}>
                <Text style={styles.cancelNickText}>取消</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.nickRow}
              onPress={() => isGuest ? null : setEditingNickname(true)}
              activeOpacity={isGuest ? 1 : 0.7}
            >
              <Text style={styles.nickname}>{isGuest ? '体验用户' : (user?.nickname || '点击设置昵称')}</Text>
              {!isGuest && <Text style={styles.editHint}>✏️</Text>}
            </TouchableOpacity>
          )}
          <Text style={styles.phoneDisplay}>{displayPhone}</Text>
        </View>

        <View style={styles.infoCard}>
          <InfoRow icon="📱" label="手机号" value={displayPhone} styles={styles} />
          <View style={styles.divider} />
          <InfoRow icon="📅" label="注册时间" value={joinDate} styles={styles} />
          <View style={styles.divider} />
          <InfoRow
            icon="🔒"
            label="账号状态"
            value={isGuest ? '试用中' : (user?.status === 'active' ? '正常' : '已限制')}
            valueColor={isGuest ? '#F59E0B' : (user?.status === 'active' ? colors.primary : '#EF4444')}
            styles={styles}
          />
        </View>

        <View style={styles.safeTip}>
          <Text style={styles.safeTipIcon}>🛡️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.safeTipTitle}>安全守护提醒</Text>
            <Text style={styles.safeTipDesc}>每日签到可以让紧急联系人放心。如连续2天未签到，系统将自动发送通知。</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({
  icon,
  label,
  value,
  valueColor,
  styles,
}: {
  icon: string;
  label: string;
  value: string;
  valueColor?: string;
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}
