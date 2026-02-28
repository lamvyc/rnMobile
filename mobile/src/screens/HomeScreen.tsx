import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { checkinApi, CheckinRecord } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import CheckinCalendar from '../components/CheckinCalendar';

interface CheckinStatus {
  checkedInToday: boolean;
  consecutiveDays: number;
  totalDays: number;
  monthlyDays: number;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const [status, setStatus] = useState<CheckinStatus | null>(null);
  const [history, setHistory] = useState<CheckinRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checking, setChecking] = useState(false);

  // 签到按钮动画
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 未签到时持续脉冲
  useEffect(() => {
    if (status && !status.checkedInToday) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
    pulseAnim.setValue(1);
  }, [status?.checkedInToday]);

  const fetchData = useCallback(async () => {
    try {
      const [s, h] = await Promise.all([
        checkinApi.getStatus(),
        checkinApi.getHistory(),
      ]);
      setStatus(s);
      setHistory(h);
    } catch (err: any) {
      Alert.alert('加载失败', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCheckin = async () => {
    if (status?.checkedInToday || checking) return;
    setChecking(true);

    // 按钮缩放动画
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 100, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    try {
      const res = await checkinApi.doCheckin();
      setStatus((prev) => prev ? { ...prev, checkedInToday: true, consecutiveDays: res.consecutiveDays, totalDays: res.totalDays } : prev);
      // 添加到历史记录
      const today = new Date().toISOString().slice(0, 10);
      setHistory((prev) => [{ id: Date.now().toString(), checkinDate: today, checkinTime: new Date().toISOString() }, ...prev]);
      Alert.alert('签到成功 🎉', `连续签到 ${res.consecutiveDays} 天，继续保持！`);
    } catch (err: any) {
      Alert.alert('签到失败', err.message);
    } finally {
      setChecking(false);
    }
  };

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 6) return '深夜好';
    if (h < 12) return '早上好';
    if (h < 18) return '下午好';
    return '晚上好';
  };

  const displayName = user?.nickname || user?.phone?.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2') || '朋友';

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#6B7280' }}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchData(); }} tintColor="#10B981" />}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部问候 */}
        <View style={styles.topBar}>
          <View>
            <Text style={styles.greeting}>{greeting()}，{displayName}</Text>
            <Text style={styles.date}>{new Date().toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })}</Text>
          </View>
          <View style={styles.shieldBadge}>
            <Text style={styles.shieldIcon}>🛡️</Text>
          </View>
        </View>

        {/* 签到按钮 */}
        <View style={styles.checkinSection}>
          <Animated.View style={{ transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }}>
            <TouchableOpacity
              style={[styles.checkinBtn, status?.checkedInToday && styles.checkinBtnDone]}
              onPress={handleCheckin}
              disabled={status?.checkedInToday || checking}
              activeOpacity={0.85}
            >
              <Text style={styles.checkinEmoji}>
                {status?.checkedInToday ? '✅' : '👋'}
              </Text>
              <Text style={styles.checkinLabel}>
                {checking ? '签到中...' : status?.checkedInToday ? '今日已签到' : '点击签到'}
              </Text>
              {status?.checkedInToday && (
                <Text style={styles.checkinSub}>明天再来哦</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* 统计卡片 */}
        <View style={styles.statsRow}>
          <StatCard icon="🔥" value={status?.consecutiveDays ?? 0} label="连续签到" unit="天" color="#F59E0B" />
          <StatCard icon="📅" value={status?.monthlyDays ?? 0} label="本月签到" unit="天" color="#3B82F6" />
          <StatCard icon="🏆" value={status?.totalDays ?? 0} label="累计签到" unit="天" color="#10B981" />
        </View>

        {/* 安全状态横幅 */}
        <View style={[styles.statusBanner, status?.checkedInToday ? styles.bannerSafe : styles.bannerWarn]}>
          <Text style={styles.bannerIcon}>{status?.checkedInToday ? '✅' : '⚠️'}</Text>
          <Text style={styles.bannerText}>
            {status?.checkedInToday
              ? '今日已签到，紧急联系人放心啦'
              : '今日还未签到，联系人可能收到提醒'}
          </Text>
        </View>

        {/* 签到日历 */}
        <CheckinCalendar records={history} />

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ icon, value, label, unit, color }: { icon: string; value: number; label: string; unit: string; color: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  scroll: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24, gap: 20 },

  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 22, fontWeight: '700', color: '#065F46' },
  date: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  shieldBadge: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shieldIcon: { fontSize: 22 },

  checkinSection: { alignItems: 'center', paddingVertical: 10 },
  checkinBtn: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  checkinBtnDone: {
    backgroundColor: '#6EE7B7',
    shadowOpacity: 0.15,
  },
  checkinEmoji: { fontSize: 48, marginBottom: 8 },
  checkinLabel: { fontSize: 18, fontWeight: '700', color: '#FFFFFF' },
  checkinSub: { fontSize: 12, color: '#A7F3D0', marginTop: 4 },

  statsRow: { flexDirection: 'row', gap: 12 },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderTopWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 6 },
  statValue: { fontSize: 24, fontWeight: '800' },
  statUnit: { fontSize: 11, color: '#6B7280', marginTop: -2 },
  statLabel: { fontSize: 12, color: '#9CA3AF', marginTop: 4 },

  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    padding: 14,
  },
  bannerSafe: { backgroundColor: '#D1FAE5' },
  bannerWarn: { backgroundColor: '#FEF3C7' },
  bannerIcon: { fontSize: 18 },
  bannerText: { flex: 1, fontSize: 13, color: '#374151', lineHeight: 20 },
});
