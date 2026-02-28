import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
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
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const RESEND_COOLDOWN = 60;

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [sendingCode, setSendingCode] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // 入场动画
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const isPhoneValid = /^1[3-9]\d{9}$/.test(phone);
  const isCodeValid = /^\d{6}$/.test(code);

  const startCountdown = () => {
    setCountdown(RESEND_COOLDOWN);
    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendCode = async () => {
    if (!isPhoneValid) {
      Alert.alert('提示', '请输入正确的手机号码');
      return;
    }
    setSendingCode(true);
    try {
      await authApi.sendCode(phone);
      setCodeSent(true);
      startCountdown();
      Alert.alert('验证码已发送', '请查看控制台（开发环境）或短信');
    } catch (err: any) {
      Alert.alert('发送失败', err.message);
    } finally {
      setSendingCode(false);
    }
  };

  const handleLogin = async () => {
    if (!isPhoneValid) {
      Alert.alert('提示', '请输入正确的手机号码');
      return;
    }
    if (!isCodeValid) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }
    setLoggingIn(true);
    try {
      await login(phone, code);
    } catch (err: any) {
      Alert.alert('登录失败', err.message);
    } finally {
      setLoggingIn(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View
            style={[styles.container, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}
          >
            {/* Logo / 标题区 */}
            <View style={styles.header}>
              <View style={styles.logoCircle}>
                <Text style={styles.logoEmoji}>🛡️</Text>
              </View>
              <Text style={styles.appName}>称平安</Text>
              <Text style={styles.tagline}>每日签到，守护平安</Text>
            </View>

            {/* 表单区 */}
            <View style={styles.card}>
              <Text style={styles.formTitle}>手机号登录</Text>

              {/* 手机号输入 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>手机号</Text>
                <TextInput
                  style={styles.input}
                  placeholder="请输入手机号"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="phone-pad"
                  maxLength={11}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              {/* 验证码输入 + 发送按钮 */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>验证码</Text>
                <View style={styles.codeRow}>
                  <TextInput
                    style={[styles.input, styles.codeInput]}
                    placeholder="请输入6位验证码"
                    placeholderTextColor="#9CA3AF"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                  />
                  <TouchableOpacity
                    style={[
                      styles.sendBtn,
                      (!isPhoneValid || countdown > 0 || sendingCode) && styles.sendBtnDisabled,
                    ]}
                    onPress={handleSendCode}
                    disabled={!isPhoneValid || countdown > 0 || sendingCode}
                  >
                    <Text style={[styles.sendBtnText, (!isPhoneValid || countdown > 0) && styles.sendBtnTextDisabled]}>
                      {sendingCode ? '发送中...' : countdown > 0 ? `${countdown}s` : codeSent ? '重新发送' : '获取验证码'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* 登录按钮 */}
              <TouchableOpacity
                style={[styles.loginBtn, (!isPhoneValid || !isCodeValid || loggingIn) && styles.loginBtnDisabled]}
                onPress={handleLogin}
                disabled={!isPhoneValid || !isCodeValid || loggingIn}
              >
                <Text style={styles.loginBtnText}>
                  {loggingIn ? '登录中...' : '登录 / 注册'}
                </Text>
              </TouchableOpacity>

              <Text style={styles.hint}>未注册的手机号将自动创建账号</Text>
            </View>

            {/* 底部说明 */}
            <Text style={styles.footer}>
              登录即代表同意《用户协议》和《隐私政策》
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F0FDF4' },
  scroll: { flexGrow: 1 },
  container: { flex: 1, paddingHorizontal: 24, paddingTop: 48 },

  header: { alignItems: 'center', marginBottom: 40 },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#D1FAE5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  logoEmoji: { fontSize: 36 },
  appName: { fontSize: 32, fontWeight: '700', color: '#065F46', letterSpacing: 2 },
  tagline: { fontSize: 14, color: '#6B7280', marginTop: 6 },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  formTitle: { fontSize: 18, fontWeight: '600', color: '#111827', marginBottom: 24 },

  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: {
    height: 48,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#F9FAFB',
  },
  codeRow: { flexDirection: 'row', gap: 10 },
  codeInput: { flex: 1 },
  sendBtn: {
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: '#D1FAE5',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 100,
  },
  sendBtnDisabled: { backgroundColor: '#F3F4F6' },
  sendBtnText: { fontSize: 13, fontWeight: '600', color: '#059669' },
  sendBtnTextDisabled: { color: '#9CA3AF' },

  loginBtn: {
    height: 52,
    backgroundColor: '#10B981',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  loginBtnDisabled: { backgroundColor: '#A7F3D0', shadowOpacity: 0 },
  loginBtnText: { fontSize: 17, fontWeight: '700', color: '#FFFFFF' },

  hint: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 14 },
  footer: { fontSize: 12, color: '#9CA3AF', textAlign: 'center', marginTop: 32, marginBottom: 24 },
});
