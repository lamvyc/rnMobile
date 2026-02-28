import React, { useState } from 'react';
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
import { usersApi } from '../services/api';
import type { ProfileStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'ProfileMain'>;

export default function ProfileScreen() {
  const navigation = useNavigation<Nav>();
  const { user, refreshUser } = useAuth();
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [saving, setSaving] = useState(false);

  const displayPhone = user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1 **** $2') ?? '';
  const initial = (user?.nickname || user?.phone || '?').charAt(0).toUpperCase();

  const joinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
    : '未知';

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
      {/* 标题栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>我的</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Settings')} style={styles.settingsBtn}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 头像区域 */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
          {editingNickname ? (
            <View style={styles.editRow}>
              <TextInput
                style={styles.nicknameInput}
                value={nickname}
                onChangeText={setNickname}
                placeholder="输入昵称"
                placeholderTextColor="#9CA3AF"
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
            <TouchableOpacity style={styles.nickRow} onPress={() => setEditingNickname(true)}>
              <Text style={styles.nickname}>{user?.nickname || '点击设置昵称'}</Text>
              <Text style={styles.editHint}>✏️</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.phoneDisplay}>{displayPhone}</Text>
        </View>

        {/* 信息卡片 */}
        <View style={styles.infoCard}>
          <InfoRow icon="📱" label="手机号" value={displayPhone} />
          <Divider />
          <InfoRow icon="📅" label="注册时间" value={joinDate} />
          <Divider />
          <InfoRow icon="🔒" label="账号状态" value={user?.status === 'active' ? '正常' : '已限制'} valueColor={user?.status === 'active' ? '#10B981' : '#EF4444'} />
        </View>

        {/* 安全提示 */}
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

function InfoRow({ icon, label, value, valueColor }: { icon: string; label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#065F46' },
  settingsBtn: { padding: 4 },
  settingsIcon: { fontSize: 22 },

  scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 20 },

  avatarSection: { alignItems: 'center', paddingVertical: 16 },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  avatarText: { fontSize: 36, fontWeight: '700', color: '#059669' },
  nickRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  nickname: { fontSize: 22, fontWeight: '700', color: '#111827' },
  editHint: { fontSize: 16 },
  phoneDisplay: { fontSize: 15, color: '#6B7280' },

  editRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  nicknameInput: {
    height: 40,
    borderWidth: 1.5,
    borderColor: '#10B981',
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    color: '#111827',
    minWidth: 160,
    backgroundColor: '#F9FAFB',
  },
  saveNickBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveNickText: { color: '#FFFFFF', fontWeight: '600', fontSize: 13 },
  cancelNickBtn: { paddingHorizontal: 10, paddingVertical: 8 },
  cancelNickText: { color: '#6B7280', fontSize: 13 },

  infoCard: {
    backgroundColor: '#FFFFFF',
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
  infoLabel: { flex: 1, fontSize: 15, color: '#374151' },
  infoValue: { fontSize: 15, color: '#6B7280', fontWeight: '500' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginHorizontal: 14 },

  safeTip: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: '#D1FAE5',
    borderRadius: 16,
    padding: 16,
  },
  safeTipIcon: { fontSize: 24 },
  safeTipTitle: { fontSize: 15, fontWeight: '600', color: '#065F46', marginBottom: 4 },
  safeTipDesc: { fontSize: 13, color: '#047857', lineHeight: 20 },
});
