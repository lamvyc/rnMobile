import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '../contexts/AuthContext';
import type { ProfileStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<ProfileStackParamList, 'Settings'>;

const APP_VERSION = '1.0.0';

export default function SettingsScreen() {
  const navigation = useNavigation<Nav>();
  const { logout, user } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      '退出登录',
      '确认退出当前账号？',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: logout,
        },
      ],
    );
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(() => Alert.alert('无法打开链接'));
  };

  const maskedPhone = user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1 **** $2') ?? '';

  return (
    <SafeAreaView style={styles.safe}>
      {/* 导航栏 */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← 返回</Text>
        </TouchableOpacity>
        <Text style={styles.navTitle}>设置</Text>
        <View style={{ width: 64 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* 账号信息 */}
        <SectionHeader title="账号" />
        <View style={styles.group}>
          <InfoItem icon="📱" label="当前账号" value={maskedPhone} />
        </View>

        {/* 关于 */}
        <SectionHeader title="关于" />
        <View style={styles.group}>
          <ActionItem
            icon="📄"
            label="用户协议"
            onPress={() => Alert.alert('用户协议', '用户协议内容（即将上线）')}
          />
          <Divider />
          <ActionItem
            icon="🔒"
            label="隐私政策"
            onPress={() => Alert.alert('隐私政策', '隐私政策内容（即将上线）')}
          />
          <Divider />
          <ActionItem
            icon="ℹ️"
            label="关于称平安"
            value={`v${APP_VERSION}`}
            onPress={() =>
              Alert.alert(
                '关于称平安',
                '称平安 是一款面向独居人群的轻量化安全工具，通过每日签到机制守护您的平安。\n\n版本：' + APP_VERSION,
              )
            }
          />
        </View>

        {/* 帮助 */}
        <SectionHeader title="帮助" />
        <View style={styles.group}>
          <ActionItem
            icon="💬"
            label="意见反馈"
            onPress={() => Alert.alert('意见反馈', '感谢您的反馈！您可以通过邮件联系我们（功能即将上线）')}
          />
          <Divider />
          <ActionItem
            icon="⭐"
            label="给我们评分"
            onPress={() => Alert.alert('感谢支持', '上线后可在应用商店为我们评分，感谢您的支持！')}
          />
        </View>

        {/* 危险区域 */}
        <View style={{ height: 8 }} />
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        <Text style={styles.versionFooter}>称平安 v{APP_VERSION} · 让每一天都安心</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function SectionHeader({ title }: { title: string }) {
  return <Text style={styles.sectionHeader}>{title}</Text>;
}

function InfoItem({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

function ActionItem({ icon, label, value, onPress }: { icon: string; label: string; value?: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.item} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.itemIcon}>{icon}</Text>
      <Text style={styles.itemLabel}>{label}</Text>
      <View style={styles.itemRight}>
        {value ? <Text style={styles.itemValue}>{value}</Text> : null}
        <Text style={styles.chevron}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: { padding: 4 },
  backText: { fontSize: 16, color: '#10B981', fontWeight: '500' },
  navTitle: { fontSize: 17, fontWeight: '600', color: '#065F46' },

  scroll: { paddingHorizontal: 20, paddingBottom: 40 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 16,
  },
  itemIcon: { fontSize: 18, marginRight: 12, width: 24 },
  itemLabel: { flex: 1, fontSize: 15, color: '#111827' },
  itemValue: { fontSize: 14, color: '#6B7280' },
  itemRight: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  chevron: { fontSize: 20, color: '#D1D5DB', fontWeight: '300' },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 50 },

  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderRadius: 14,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: '#EF4444' },

  versionFooter: {
    textAlign: 'center',
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 24,
  },
});
