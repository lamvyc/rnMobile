import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CheckinRecord } from '../services/api';

interface Props {
  records: CheckinRecord[];
}

const WEEKDAYS = ['日', '一', '二', '三', '四', '五', '六'];

export default function CheckinCalendar({ records }: Props) {
  const checkedDates = useMemo(
    () => new Set(records.map((r) => r.checkinDate.slice(0, 10))),
    [records],
  );

  // 生成最近 35 天（5行 × 7列）
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result: { date: Date; dateStr: string; isToday: boolean; isFuture: boolean }[] = [];

    // 找到35天前的起始周日
    const start = new Date(today);
    start.setDate(today.getDate() - 34);
    // 对齐到周日
    const dayOfWeek = start.getDay();
    start.setDate(start.getDate() - dayOfWeek);

    for (let i = 0; i < 35; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      const dateStr = d.toISOString().slice(0, 10);
      result.push({
        date: d,
        dateStr,
        isToday: d.getTime() === today.getTime(),
        isFuture: d > today,
      });
    }
    return result;
  }, []);

  // 月份标题（取中间那行的月份）
  const monthLabel = useMemo(() => {
    const mid = days[17];
    return `${mid.date.getFullYear()}年${mid.date.getMonth() + 1}月`;
  }, [days]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>签到记录</Text>
      <Text style={styles.month}>{monthLabel}</Text>

      {/* 星期表头 */}
      <View style={styles.row}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={styles.cell}>
            <Text style={styles.weekday}>{w}</Text>
          </View>
        ))}
      </View>

      {/* 日期格子（5行） */}
      {[0, 1, 2, 3, 4].map((week) => (
        <View key={week} style={styles.row}>
          {days.slice(week * 7, week * 7 + 7).map((item) => {
            const checked = checkedDates.has(item.dateStr);
            return (
              <View key={item.dateStr} style={styles.cell}>
                <View
                  style={[
                    styles.dot,
                    item.isToday && styles.dotToday,
                    checked && styles.dotChecked,
                    item.isFuture && styles.dotFuture,
                  ]}
                >
                  <Text
                    style={[
                      styles.dayText,
                      item.isToday && styles.dayTextToday,
                      checked && styles.dayTextChecked,
                      item.isFuture && styles.dayTextFuture,
                    ]}
                  >
                    {item.date.getDate()}
                  </Text>
                </View>
                {checked && <View style={styles.greenDot} />}
              </View>
            );
          })}
        </View>
      ))}

      {/* 图例 */}
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.legendText}>已签到</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, styles.legendToday]} />
          <Text style={styles.legendText}>今天</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#E5E7EB' }]} />
          <Text style={styles.legendText}>未签到</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 4 },
  month: { fontSize: 13, color: '#6B7280', marginBottom: 12 },

  row: { flexDirection: 'row', marginBottom: 6 },
  cell: { flex: 1, alignItems: 'center' },
  weekday: { fontSize: 12, color: '#9CA3AF', fontWeight: '500', marginBottom: 4 },

  dot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dotToday: { borderWidth: 2, borderColor: '#10B981' },
  dotChecked: { backgroundColor: '#10B981' },
  dotFuture: { opacity: 0.3 },

  dayText: { fontSize: 13, color: '#374151', fontWeight: '400' },
  dayTextToday: { color: '#10B981', fontWeight: '700' },
  dayTextChecked: { color: '#FFFFFF', fontWeight: '600' },
  dayTextFuture: { color: '#D1D5DB' },

  greenDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#10B981',
    marginTop: 2,
  },

  legend: { flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendToday: { borderWidth: 2, borderColor: '#10B981', backgroundColor: 'transparent' },
  legendText: { fontSize: 12, color: '#6B7280' },
});
