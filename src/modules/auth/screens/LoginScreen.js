import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const colors = {
  primary: '#ff6b6b',
  primaryDark: '#e85555',
  primaryLight: '#ff8e8e',
  secondary: '#ff9f43',
  white: '#ffffff',
  gray: '#8a8a9a',
  lightGray: '#f0f0f7',
  dark: '#1a1a2e',
  card: '#ffffff',
  error: '#ff4444',
  errorBg: '#fff0f0',
  errorBorder: '#ffcccc',
  warning: '#ff9f43',
  warningBg: '#fff8f0',
  warningBorder: '#ffddb3',
};

// Error type classifier - maps backend errors to user-friendly UI
const classifyError = (errorMsg) => {
  if (!errorMsg) return null;
  const msg = errorMsg.toLowerCase();

  if (msg.includes('banned')) {
    return {
      type: 'banned',
      icon: 'ban-outline',
      title: 'Account Banned',
      message: errorMsg,
      color: colors.error,
      bg: colors.errorBg,
      border: colors.errorBorder,
    };
  }
  if (msg.includes('suspended')) {
    return {
      type: 'suspended',
      icon: 'pause-circle-outline',
      title: 'Account Suspended',
      message: errorMsg,
      color: colors.warning,
      bg: colors.warningBg,
      border: colors.warningBorder,
    };
  }
  if (msg.includes('password') || msg.includes('incorrect') || msg.includes('invalid credentials')) {
    return {
      type: 'password',
      icon: 'key-outline',
      title: 'Wrong Password',
      message: 'The password you entered is incorrect. Please try again.',
      color: colors.error,
      bg: colors.errorBg,
      border: colors.errorBorder,
    };
  }
  if (msg.includes('not found') || msg.includes('no account') || msg.includes('user')) {
    return {
      type: 'email',
      icon: 'mail-outline',
      title: 'Email Not Found',
      message: 'No account found with this email. Did you mean to register?',
      color: colors.error,
      bg: colors.errorBg,
      border: colors.errorBorder,
    };
  }
  if (msg.includes('network') || msg.includes('connection')) {
    return {
      type: 'network',
      icon: 'wifi-outline',
      title: 'Connection Problem',
      message: 'Please check your internet connection and try again.',
      color: colors.warning,
      bg: colors.warningBg,
      border: colors.warningBorder,
    };
  }
  return {
    type: 'generic',
    icon: 'alert-circle-outline',
    title: 'Login Failed',
    message: errorMsg,
    color: colors.error,
    bg: colors.errorBg,
    border: colors.errorBorder,
  };
};

const ErrorBanner = ({ error, onDismiss }) => {
  const slideAnim = useRef(new Animated.Value(-80)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (error) {
      Animated.parallel([
        Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 80, friction: 10 }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: -80, duration: 200, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [error]);

  if (!error) return null;
  const info = classifyError(error);
  if (!info) return null;

  return (
    <Animated.View
      style={[
        styles.errorBanner,
        { backgroundColor: info.bg, borderColor: info.border, transform: [{ translateY: slideAnim }], opacity: opacityAnim },
      ]}
    >
      <Icon name={info.icon} size={20} color={info.color} />
      <View style={styles.errorTextContainer}>
        <Text style={[styles.errorTitle, { color: info.color }]}>{info.title}</Text>
        <Text style={styles.errorMessage}>{info.message}</Text>
        {info.type === 'email' && (
          <Text style={styles.errorHint}>→ Tap "Create Account" below</Text>
        )}
        {info.type === 'password' && (
          <Text style={styles.errorHint}>→ Tap "Forgot Password?" to reset</Text>
        )}
      </View>
      <TouchableOpacity onPress={onDismiss} style={styles.dismissBtn}>
        <Icon name="close" size={16} color={info.color} />
      </TouchableOpacity>
    </Animated.View>
  );
};

const AnimatedInput = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, autoCapitalize, rightElement, hasError }) => {
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

  const borderColor = focusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [hasError ? colors.error : '#e8e8f0', colors.primary],
  });
  const shadowOpacity = focusAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.15] });

  return (
    <Animated.View style={[styles.inputWrapper, { borderColor, shadowOpacity, shadowColor: colors.primary }]}>
      <Icon name={icon} size={20} color={isFocused ? colors.primary : colors.gray} style={styles.inputIcon} />
      <TextInput
        style={styles.textInput}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize || 'none'}
        onFocus={handleFocus}
        onBlur={handleBlur}
      />
      {rightElement}
    </Animated.View>
  );
};

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState(null);
  const { login } = useAuth();

  // Entrance animations
  const logoAnim = useRef(new Animated.Value(0)).current;
  const formAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.stagger(150, [
      Animated.spring(logoAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.spring(formAnim, { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      setLoginError('Please fill in your email and password.');
      return;
    }
    setLoginError(null);

    // Button press animation
    Animated.sequence([
      Animated.timing(buttonAnim, { toValue: 0.96, duration: 80, useNativeDriver: true }),
      Animated.timing(buttonAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
    ]).start();

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setLoginError(result.error);
    }
  };

  const logoTranslateY = logoAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const formTranslateY = formAnim.interpolate({ inputRange: [0, 1], outputRange: [40, 0] });

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      {/* Decorative background */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        {/* Logo section */}
        <Animated.View style={[styles.logoSection, { opacity: logoAnim, transform: [{ translateY: logoTranslateY }] }]}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoEmoji}>🍳</Text>
          </View>
          <Text style={styles.appName}>FreshRecipe</Text>
          <Text style={styles.tagline}>Welcome back, chef! 👨‍🍳</Text>
        </Animated.View>

        {/* Form card */}
        <Animated.View style={[styles.card, { opacity: formAnim, transform: [{ translateY: formTranslateY }] }]}>
          <Text style={styles.cardTitle}>Sign In</Text>

          {/* Error banner - shows specific reason why login failed */}
          <ErrorBanner error={loginError} onDismiss={() => setLoginError(null)} />

          <AnimatedInput
            icon="mail-outline"
            placeholder="Email address"
            value={email}
            onChangeText={(v) => { setEmail(v); setLoginError(null); }}
            keyboardType="email-address"
            hasError={loginError && classifyError(loginError)?.type === 'email'}
          />

          <AnimatedInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={password}
            onChangeText={(v) => { setPassword(v); setLoginError(null); }}
            secureTextEntry={!showPassword}
            hasError={loginError && classifyError(loginError)?.type === 'password'}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray} />
              </TouchableOpacity>
            }
          />

          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotRow}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Animated.View style={{ transform: [{ scale: buttonAnim }] }}>
            <TouchableOpacity style={[styles.signInBtn, loading && styles.signInBtnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Text style={styles.signInText}>Sign In</Text>
                  <Icon name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New here?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity style={styles.registerBtn} onPress={() => navigation.navigate('Register')} activeOpacity={0.8}>
            <Icon name="person-add-outline" size={18} color={colors.primary} style={{ marginRight: 6 }} />
            <Text style={styles.registerText}>Create Account</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef6f6' },
  bgCircle1: {
    position: 'absolute', top: -80, right: -80,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: '#ffeded', opacity: 0.8,
  },
  bgCircle2: {
    position: 'absolute', top: 60, left: -100,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#fff3f3', opacity: 0.6,
  },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logoSection: { alignItems: 'center', marginBottom: 32 },
  logoContainer: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 10,
    marginBottom: 16,
  },
  logoEmoji: { fontSize: 38 },
  appName: { fontSize: 30, fontWeight: '800', color: colors.dark, letterSpacing: -0.5 },
  tagline: { fontSize: 15, color: colors.gray, marginTop: 4 },
  card: {
    backgroundColor: colors.white, borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, shadowRadius: 20, elevation: 6,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: colors.dark, marginBottom: 20 },

  // Error banner
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', padding: 14,
    borderRadius: 14, borderWidth: 1, marginBottom: 16, gap: 10,
  },
  errorTextContainer: { flex: 1 },
  errorTitle: { fontSize: 14, fontWeight: '700', marginBottom: 2 },
  errorMessage: { fontSize: 13, color: colors.gray, lineHeight: 18 },
  errorHint: { fontSize: 12, color: colors.primary, marginTop: 4, fontWeight: '500' },
  dismissBtn: { padding: 2 },

  // Inputs
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14, marginBottom: 14,
    paddingHorizontal: 14, paddingVertical: 4,
    backgroundColor: colors.white,
    shadowOffset: { width: 0, height: 4 }, shadowRadius: 8, elevation: 3,
  },
  inputIcon: { marginRight: 10 },
  textInput: { flex: 1, fontSize: 15, color: colors.dark, paddingVertical: 12 },
  eyeBtn: { padding: 4 },

  forgotRow: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, color: colors.primary, fontWeight: '600' },

  signInBtn: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  signInBtnDisabled: { opacity: 0.7 },
  signInText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  divider: { flexDirection: 'row', alignItems: 'center', marginVertical: 20, gap: 10 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#ebebf0' },
  dividerText: { fontSize: 13, color: colors.gray },

  registerBtn: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: colors.primary, borderRadius: 14,
    paddingVertical: 13,
  },
  registerText: { color: colors.primary, fontSize: 15, fontWeight: '600' },
});

export default LoginScreen;