import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Clipboard,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../../api/api';

const colors = {
  primary: '#ff6b6b',
  white: '#ffffff',
  gray: '#8a8a9a',
  lightGray: '#f0f0f7',
  dark: '#1a1a2e',
  success: '#00c9a7',
  successBg: '#f0fdf9',
  error: '#ff4444',
  errorBg: '#fff0f0',
};

// Step indicator component
const StepIndicator = ({ currentStep }) => (
  <View style={stepStyles.container}>
    {['Email', 'Reset'].map((label, i) => {
      const isActive = i === currentStep;
      const isDone = i < currentStep;
      return (
        <React.Fragment key={i}>
          <View style={stepStyles.stepItem}>
            <View style={[stepStyles.dot, isActive && stepStyles.dotActive, isDone && stepStyles.dotDone]}>
              {isDone
                ? <Icon name="checkmark" size={12} color={colors.white} />
                : <Text style={[stepStyles.dotNum, isActive && stepStyles.dotNumActive]}>{i + 1}</Text>
              }
            </View>
            <Text style={[stepStyles.label, isActive && stepStyles.labelActive]}>{label}</Text>
          </View>
          {i < 1 && <View style={[stepStyles.line, isDone && stepStyles.lineDone]} />}
        </React.Fragment>
      );
    })}
  </View>
);

const stepStyles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', marginBottom: 36, paddingHorizontal: 20 },
  stepItem: { alignItems: 'center', gap: 6 },
  dot: {
    width: 30, height: 30, borderRadius: 15,
    backgroundColor: colors.lightGray, justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#e0e0ea',
  },
  dotActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dotDone: { backgroundColor: colors.success, borderColor: colors.success },
  dotNum: { fontSize: 12, fontWeight: '700', color: colors.gray },
  dotNumActive: { color: colors.white },
  label: { fontSize: 11, color: colors.gray, fontWeight: '500' },
  labelActive: { color: colors.primary },
  line: { flex: 1, height: 2, backgroundColor: '#e0e0ea', marginHorizontal: 8, marginBottom: 16 },
  lineDone: { backgroundColor: colors.success },
});

// Animated input
const AnimatedInput = ({ icon, placeholder, value, onChangeText, keyboardType, secureTextEntry, rightElement, multiline }) => {
  const focusAnim = useRef(new Animated.Value(0)).current;
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(focusAnim, { toValue: 1, useNativeDriver: false, tension: 100, friction: 8 }).start();
  };
  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(focusAnim, { toValue: 0, useNativeDriver: false, tension: 100, friction: 8 }).start();
  };

  const borderColor = focusAnim.interpolate({ inputRange: [0, 1], outputRange: ['#e8e8f0', colors.primary] });

  return (
    <Animated.View style={[aStyles.wrapper, { borderColor }]}>
      <Icon name={icon} size={18} color={isFocused ? colors.primary : colors.gray} style={aStyles.icon} />
      <TextInput
        style={[aStyles.input, multiline && { minHeight: 60, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize="none"
        secureTextEntry={secureTextEntry}
        onFocus={handleFocus}
        onBlur={handleBlur}
        multiline={multiline}
      />
      {rightElement}
    </Animated.View>
  );
};

const aStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14, marginBottom: 16,
    paddingHorizontal: 14, paddingVertical: 2,
    backgroundColor: colors.white,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.dark, paddingVertical: 12 },
});

// ---- Main Screen ----
const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(0); // 0 = email, 1 = reset
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const iconBounce = useRef(new Animated.Value(0)).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 70, friction: 9, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    animateIn();
  }, [step]);

  useEffect(() => {
    // Bounce icon on load
    Animated.loop(
      Animated.sequence([
        Animated.timing(iconBounce, { toValue: -8, duration: 800, useNativeDriver: true }),
        Animated.timing(iconBounce, { toValue: 0, duration: 800, useNativeDriver: true }),
      ])
    ).start();
  }, [step]);

  const handleRequestReset = async () => {
    if (!email) { Alert.alert('Email Required', 'Please enter your email address.'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setEmailSent(true);
      setStep(1);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send reset email. Please check the email address and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken) { Alert.alert('Token Required', 'Please paste the reset token from your email.'); return; }
    if (!newPassword || !confirmPassword) { Alert.alert('Missing Fields', 'Please fill in both password fields.'); return; }
    if (newPassword !== confirmPassword) { Alert.alert('Password Mismatch', 'The passwords you entered do not match.'); return; }
    if (newPassword.length < 6) { Alert.alert('Weak Password', 'Your new password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${resetToken}`, { password: newPassword });
      Alert.alert(
        '✅ Password Reset!',
        'Your password has been updated successfully. Please sign in with your new password.',
        [{ text: 'Sign In', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Invalid Token', error.response?.data?.message || 'The reset token is invalid or has expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text && text.length > 10) { setResetToken(text); }
      else { Alert.alert('No Token Found', 'Copy the token from your email first, then tap Paste.'); }
    } catch (e) {
      Alert.alert('Could not paste', 'Try manually typing or copying the token.');
    }
  };

  const iconEmoji = step === 0 ? '📧' : '🔑';
  const passwordsMatch = confirmPassword && newPassword === confirmPassword;
  const passwordsDontMatch = confirmPassword && newPassword !== confirmPassword;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Back button */}
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => step === 1 ? setStep(0) : navigation.goBack()}
        >
          <Icon name="arrow-back" size={18} color={colors.primary} />
        </TouchableOpacity>

        <StepIndicator currentStep={step} />

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Icon */}
          <View style={styles.iconSection}>
            <Animated.View style={[styles.iconBg, { transform: [{ translateY: iconBounce }] }]}>
              <Text style={styles.iconEmoji}>{iconEmoji}</Text>
            </Animated.View>
          </View>

          {step === 0 ? (
            <>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                No worries! Enter your email and we'll send you a reset token right away.
              </Text>

              <AnimatedInput
                icon="mail-outline"
                placeholder="Your email address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
              />

              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRequestReset} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <><ActivityIndicator color={colors.white} size="small" /><Text style={[styles.btnText, { marginLeft: 8 }]}>Sending…</Text></>
                  : <><Icon name="send" size={18} color={colors.white} style={{ marginRight: 8 }} /><Text style={styles.btnText}>Send Reset Token</Text></>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backLink}>
                <Icon name="arrow-back-outline" size={14} color={colors.primary} />
                <Text style={styles.backLinkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.title}>Reset Password</Text>
              <Text style={styles.subtitle}>
                Check <Text style={{ color: colors.primary, fontWeight: '600' }}>{email}</Text> for your token and set a new password.
              </Text>

              {/* Email sent confirmation badge */}
              {emailSent && (
                <View style={styles.sentBadge}>
                  <Icon name="checkmark-circle" size={16} color={colors.success} />
                  <Text style={styles.sentText}>Token sent to your email</Text>
                </View>
              )}

              {/* Token input with paste button */}
              <Text style={styles.fieldLabel}>Reset Token</Text>
              <View style={styles.tokenRow}>
                <Animated.View style={[aStyles.wrapper, { flex: 1, borderColor: '#e8e8f0', marginBottom: 0 }]}>
                  <Icon name="key-outline" size={18} color={colors.gray} style={aStyles.icon} />
                  <TextInput
                    style={[aStyles.input, { fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 13 }]}
                    placeholder="Paste token from email"
                    placeholderTextColor={colors.gray}
                    value={resetToken}
                    onChangeText={setResetToken}
                    autoCapitalize="none"
                    multiline
                  />
                </Animated.View>
                <TouchableOpacity style={styles.pasteBtn} onPress={pasteFromClipboard}>
                  <Icon name="clipboard-outline" size={16} color={colors.primary} />
                  <Text style={styles.pasteText}>Paste</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.hint}>💡 Open your email, copy the token, then tap Paste</Text>

              <Text style={[styles.fieldLabel, { marginTop: 16 }]}>New Password</Text>
              <AnimatedInput
                icon="lock-closed-outline"
                placeholder="Enter new password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                rightElement={
                  <TouchableOpacity onPress={() => setShowNewPassword(!showNewPassword)} style={{ padding: 4 }}>
                    <Icon name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray} />
                  </TouchableOpacity>
                }
              />

              <Text style={styles.fieldLabel}>Confirm New Password</Text>
              <AnimatedInput
                icon="shield-checkmark-outline"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                rightElement={
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    {passwordsMatch && <Icon name="checkmark-circle" size={16} color={colors.success} />}
                    {passwordsDontMatch && <Icon name="close-circle" size={16} color={colors.error} />}
                    <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                      <Icon name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.gray} />
                    </TouchableOpacity>
                  </View>
                }
              />
              {passwordsDontMatch && <Text style={styles.matchError}>⚠️ Passwords do not match</Text>}
              {passwordsMatch && <Text style={styles.matchSuccess}>✓ Passwords match</Text>}

              <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleResetPassword} disabled={loading} activeOpacity={0.85}>
                {loading
                  ? <><ActivityIndicator color={colors.white} size="small" /><Text style={[styles.btnText, { marginLeft: 8 }]}>Resetting…</Text></>
                  : <><Icon name="refresh-circle-outline" size={18} color={colors.white} style={{ marginRight: 8 }} /><Text style={styles.btnText}>Reset Password</Text></>
                }
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backLink}>
                <Icon name="log-in-outline" size={14} color={colors.primary} />
                <Text style={styles.backLinkText}>Back to Sign In</Text>
              </TouchableOpacity>
            </>
          )}
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef6f6' },
  bgCircle1: { position: 'absolute', top: -80, right: -80, width: 240, height: 240, borderRadius: 120, backgroundColor: '#ffeded', opacity: 0.7 },
  bgCircle2: { position: 'absolute', bottom: 80, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: '#fff3f3', opacity: 0.5 },
  scroll: { padding: 24, paddingTop: 54 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },

  iconSection: { alignItems: 'center', marginBottom: 24 },
  iconBg: {
    width: 88, height: 88, borderRadius: 26, backgroundColor: colors.primary,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35, shadowRadius: 20, elevation: 12,
  },

  iconEmoji: { fontSize: 38 },
  title: { fontSize: 26, fontWeight: '800', color: colors.dark, textAlign: 'center', marginBottom: 10, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: colors.gray, textAlign: 'center', lineHeight: 22, marginBottom: 28, paddingHorizontal: 10 },

  sentBadge: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    backgroundColor: '#f0fdf9', borderRadius: 10, padding: 10, marginBottom: 20, gap: 6,
    borderWidth: 1, borderColor: '#b3f0e0',
  },
  sentText: { fontSize: 13, color: colors.success, fontWeight: '600' },

  fieldLabel: { fontSize: 13, fontWeight: '600', color: colors.dark, marginBottom: 8 },

  tokenRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  pasteBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: '#fff0f0', paddingHorizontal: 14, paddingVertical: 14,
    borderRadius: 14, borderWidth: 1.5, borderColor: '#ffd0d0',
  },
  pasteText: { fontSize: 13, color: colors.primary, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.gray, marginBottom: 4 },

  matchError: { fontSize: 12, color: colors.error, marginTop: -8, marginBottom: 12, marginLeft: 4 },
  matchSuccess: { fontSize: 12, color: colors.success, marginTop: -8, marginBottom: 12, marginLeft: 4, fontWeight: '500' },

  btn: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 20, gap: 5, paddingBottom: 30 },
  backLinkText: { fontSize: 14, color: colors.primary, fontWeight: '500' },
});

export default ForgotPasswordScreen;