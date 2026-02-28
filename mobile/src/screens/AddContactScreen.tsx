import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { contactsApi } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';
import type { ContactsStackParamList } from '../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<ContactsStackParamList, 'AddContact'>;
type Route = RouteProp<ContactsStackParamList, 'AddContact'>;

const RELATIONSHIPS = [
  { value: 'family', label: '家人' },
  { value: 'friend', label: '朋友' },
  { value: 'colleague', label: '同事' },
  { value: 'other', label: '其他' },
];

export default function AddContactScreen() {
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { colors } = useTheme();
  const existingContact = route.params?.contact;
  const isEditing = !!existingContact;

  const [name, setName] = useState(existingContact?.name ?? '');
  const [phone, setPhone] = useState(existingContact?.phone ?? '');
  const [email, setEmail] = useState(existingContact?.email ?? '');
  const [relationship, setRelationship] = useState(existingContact?.relationship ?? 'family');
  const [saving, setSaving] = useState(false);

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safe: { flex: 1, backgroundColor: colors.bg },
        navbar: {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 16,
          paddingVertical: 12,
          backgroundColor: colors.bg,
        },
        backBtn: { padding: 4 },
        backText: { fontSize: 16, color: colors.primary, fontWeight: '500' },
        navTitle: { fontSize: 17, fontWeight: '600', color: colors.textPri },

        scroll: { paddingHorizontal: 20, paddingBottom: 40, gap: 16 },

        infoBanner: {
          flexDirection: 'row',
          gap: 10,
          backgroundColor: colors.primaryLight,
          borderRadius: 14,
          padding: 14,
          alignItems: 'flex-start',
        },
        infoIcon: { fontSize: 16 },
        infoText: { flex: 1, fontSize: 13, color: colors.textSec, lineHeight: 20 },

        form: {
          backgroundColor: colors.card,
          borderRadius: 20,
          padding: 20,
          gap: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
          elevation: 3,
        },
        fieldGroup: {},
        label: { fontSize: 14, fontWeight: '500', color: colors.textSec, marginBottom: 8 },
        input: {
          height: 48,
          borderWidth: 1.5,
          borderColor: colors.border,
          borderRadius: 12,
          paddingHorizontal: 16,
          fontSize: 16,
          color: colors.textPri,
          backgroundColor: colors.fieldBg,
        },
        inputError: { borderColor: '#EF4444' },
        errorText: { fontSize: 12, color: '#EF4444', marginTop: 4 },

        relRow: { flexDirection: 'row', gap: 10 },
        relOption: {
          flex: 1,
          height: 40,
          borderRadius: 10,
          borderWidth: 1.5,
          borderColor: colors.border,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: colors.fieldBg,
        },
        relOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight },
        relOptionText: { fontSize: 14, color: colors.textSec, fontWeight: '500' },
        relOptionTextActive: { color: colors.primary, fontWeight: '600' },

        saveBtn: {
          height: 52,
          backgroundColor: colors.primary,
          borderRadius: 14,
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.35,
          shadowRadius: 10,
          elevation: 4,
        },
        saveBtnDisabled: { backgroundColor: colors.primaryLight, shadowOpacity: 0 },
        saveBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },
      }),
    [colors],
  );

  const isPhoneValid = /^1[3-9]\d{9}$/.test(phone);
  const isEmailValid = email === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const canSave = name.trim().length >= 2 && isPhoneValid && isEmailValid && !saving;

  const handleSave = async () => {
    if (!canSave) return;
    setSaving(true);
    try {
      const data = { name: name.trim(), phone, email: email.trim() || undefined, relationship };
      if (isEditing) {
        await contactsApi.update(existingContact.id, data);
      } else {
        await contactsApi.create(data);
      }
      navigation.goBack();
    } catch (err: any) {
      Alert.alert(isEditing ? '更新失败' : '添加失败', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.navbar}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← 返回</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>{isEditing ? '编辑联系人' : '添加联系人'}</Text>
          <View style={{ width: 64 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.infoBanner}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>当您连续2天未签到时，此联系人将收到短信/邮件提醒</Text>
          </View>

          <View style={styles.form}>
            <InputField
              label="联系人姓名 *"
              placeholder="请输入姓名（至少2个字）"
              value={name}
              onChangeText={setName}
              maxLength={20}
              colors={colors}
              styles={styles}
            />
            <InputField
              label="手机号码 *"
              placeholder="请输入11位手机号"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              maxLength={11}
              error={phone.length > 0 && !isPhoneValid ? '请输入正确的手机号' : undefined}
              colors={colors}
              styles={styles}
            />
            <InputField
              label="邮箱地址（可选）"
              placeholder="用于备用通知渠道"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              error={email.length > 0 && !isEmailValid ? '请输入正确的邮箱格式' : undefined}
              colors={colors}
              styles={styles}
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>与您的关系 *</Text>
              <View style={styles.relRow}>
                {RELATIONSHIPS.map((r) => (
                  <TouchableOpacity
                    key={r.value}
                    style={[styles.relOption, relationship === r.value && styles.relOptionActive]}
                    onPress={() => setRelationship(r.value)}
                  >
                    <Text style={[styles.relOptionText, relationship === r.value && styles.relOptionTextActive]}>
                      {r.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave}
          >
            <Text style={styles.saveBtnText}>
              {saving ? '保存中...' : isEditing ? '保存修改' : '添加联系人'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function InputField({
  label,
  placeholder,
  value,
  onChangeText,
  keyboardType,
  maxLength,
  error,
  autoCapitalize,
  colors,
  styles,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
  keyboardType?: any;
  maxLength?: number;
  error?: string;
  autoCapitalize?: any;
  colors: any;
  styles: ReturnType<typeof StyleSheet.create>;
}) {
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, error ? styles.inputError : null]}
        placeholder={placeholder}
        placeholderTextColor={colors.textTer}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        autoCapitalize={autoCapitalize ?? 'words'}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}
