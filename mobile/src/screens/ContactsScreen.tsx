import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Contact, contactsApi } from '../services/api';
import type { ContactsStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<ContactsStackParamList, 'ContactsList'>;

const RELATIONSHIP_LABELS: Record<string, string> = {
  family: '家人',
  friend: '朋友',
  colleague: '同事',
  other: '其他',
};

export default function ContactsScreen() {
  const navigation = useNavigation<Nav>();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchContacts = useCallback(async () => {
    try {
      const list = await contactsApi.list();
      setContacts(list);
    } catch (err: any) {
      Alert.alert('加载失败', err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', fetchContacts);
    return unsubscribe;
  }, [navigation, fetchContacts]);

  const handleDelete = (contact: Contact) => {
    Alert.alert(
      '确认删除',
      `确定要删除紧急联系人 ${contact.name} 吗？`,
      [
        { text: '取消', style: 'cancel' },
        {
          text: '删除',
          style: 'destructive',
          onPress: async () => {
            try {
              await contactsApi.remove(contact.id);
              setContacts((prev) => prev.filter((c) => c.id !== contact.id));
            } catch (err: any) {
              Alert.alert('删除失败', err.message);
            }
          },
        },
      ],
    );
  };

  const canAdd = contacts.length < 1; // 首版限制1个

  return (
    <SafeAreaView style={styles.safe}>
      {/* 标题栏 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>紧急联系人</Text>
          <Text style={styles.subtitle}>连续2天未签到将通知此联系人</Text>
        </View>
        {canAdd && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('AddContact', undefined)}
          >
            <Text style={styles.addBtnText}>+ 添加</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchContacts(); }} tintColor="#10B981" />}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.emptyText}>加载中...</Text>
        ) : contacts.length === 0 ? (
          <EmptyState onAdd={() => navigation.navigate('AddContact', undefined)} />
        ) : (
          contacts.map((contact) => (
            <ContactCard
              key={contact.id}
              contact={contact}
              onEdit={() => navigation.navigate('AddContact', { contact })}
              onDelete={() => handleDelete(contact)}
            />
          ))
        )}

        {contacts.length >= 1 && (
          <View style={styles.limitHint}>
            <Text style={styles.limitText}>💡 当前版本最多支持1个紧急联系人</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactCard({ contact, onEdit, onDelete }: { contact: Contact; onEdit: () => void; onDelete: () => void }) {
  const relLabel = RELATIONSHIP_LABELS[contact.relationship] ?? contact.relationship;
  const initial = contact.name.charAt(0).toUpperCase();

  return (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <View style={styles.cardInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{contact.name}</Text>
            <View style={styles.relTag}>
              <Text style={styles.relText}>{relLabel}</Text>
            </View>
            {contact.isVerified && (
              <View style={styles.verifiedTag}>
                <Text style={styles.verifiedText}>已验证</Text>
              </View>
            )}
          </View>
          <Text style={styles.phone}>{contact.phone}</Text>
          {contact.email ? <Text style={styles.email}>{contact.email}</Text> : null}
        </View>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Text style={styles.editText}>编辑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Text style={styles.deleteText}>删除</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>👥</Text>
      <Text style={styles.emptyTitle}>还没有紧急联系人</Text>
      <Text style={styles.emptyDesc}>添加一位你信任的人，当你连续2天未签到时，他们将收到通知</Text>
      <TouchableOpacity style={styles.emptyAddBtn} onPress={onAdd}>
        <Text style={styles.emptyAddText}>+ 立即添加</Text>
      </TouchableOpacity>
    </View>
  );
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
    backgroundColor: '#F0FDF4',
  },
  title: { fontSize: 22, fontWeight: '700', color: '#065F46' },
  subtitle: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  addBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: '600', fontSize: 14 },

  scroll: { paddingHorizontal: 20, paddingBottom: 24, paddingTop: 8, gap: 12 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  cardLeft: { flexDirection: 'row', gap: 14, marginBottom: 12 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 20, fontWeight: '700', color: '#059669' },
  cardInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  name: { fontSize: 17, fontWeight: '600', color: '#111827' },
  relTag: { backgroundColor: '#F0FDF4', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  relText: { fontSize: 12, color: '#059669', fontWeight: '500' },
  verifiedTag: { backgroundColor: '#EFF6FF', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 },
  verifiedText: { fontSize: 12, color: '#3B82F6', fontWeight: '500' },
  phone: { fontSize: 14, color: '#374151' },
  email: { fontSize: 13, color: '#6B7280', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 10, justifyContent: 'flex-end' },
  actionBtn: {
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  deleteBtn: { backgroundColor: '#FEF2F2' },
  editText: { fontSize: 13, color: '#374151', fontWeight: '500' },
  deleteText: { fontSize: 13, color: '#EF4444', fontWeight: '500' },

  limitHint: { backgroundColor: '#FEF3C7', borderRadius: 12, padding: 12 },
  limitText: { fontSize: 13, color: '#92400E', textAlign: 'center' },

  emptyContainer: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 64, marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontWeight: '600', color: '#111827', marginBottom: 10 },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  emptyAddBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  emptyAddText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#6B7280', paddingTop: 60 },
});
