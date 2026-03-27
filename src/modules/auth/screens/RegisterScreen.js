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
  Image,
  Animated,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';

const colors = {
  primary: '#ff6b6b',
  primaryDark: '#e85555',
  white: '#ffffff',
  gray: '#8a8a9a',
  lightGray: '#f0f0f7',
  dark: '#1a1a2e',
  error: '#ff4444',
  errorBg: '#fff0f0',
  errorBorder: '#ffcccc',
  success: '#00c9a7',
  successBg: '#f0fdf9',
  strengthWeak: '#ff4444',
  strengthFair: '#ff9f43',
  strengthGood: '#ffd32a',
  strengthStrong: '#00c9a7',
};

// --- Password strength analyzer ---
const analyzePassword = (password) => {
  if (!password) return { score: 0, label: '', color: 'transparent', checks: [] };

  const checks = [
    { label: 'At least 6 characters', pass: password.length >= 6 },
    { label: 'Uppercase letter (A-Z)', pass: /[A-Z]/.test(password) },
    { label: 'Number (0-9)', pass: /\d/.test(password) },
    { label: 'Special character (!@#$…)', pass: /[^A-Za-z0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;

  let label = '', color = '';
  if (passed <= 1) { label = 'Weak'; color = colors.strengthWeak; }
  else if (passed === 2) { label = 'Fair'; color = colors.strengthFair; }
  else if (passed === 3) { label = 'Good'; color = colors.strengthGood; }
  else { label = 'Strong 🔒'; color = colors.strengthStrong; }

  return { score: passed, label, color, checks };
};

const PasswordStrengthMeter = ({ password }) => {
  const analysis = analyzePassword(password);
  const widthAnims = useRef([
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
    new Animated.Value(0),
  ]).current;

  useEffect(() => {
    widthAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i < analysis.score ? 1 : 0,
        duration: 300,
        delay: i * 50,
        useNativeDriver: false,
      }).start();
    });
  }, [analysis.score]);

  if (!password) return null;

  return (
    <View style={pStyles.container}>
      {/* Strength bars */}
      <View style={pStyles.barsRow}>
        {widthAnims.map((anim, i) => (
          <View key={i} style={pStyles.barBg}>
            <Animated.View
              style={[
                pStyles.barFill,
                {
                  flex: anim,
                  backgroundColor: analysis.color,
                },
              ]}
            />
          </View>
        ))}
        <Text style={[pStyles.strengthLabel, { color: analysis.color }]}>{analysis.label}</Text>
      </View>

      {/* Checklist */}
      <View style={pStyles.checks}>
        {analysis.checks.map((check, i) => (
          <View key={i} style={pStyles.checkRow}>
            <Icon
              name={check.pass ? 'checkmark-circle' : 'ellipse-outline'}
              size={14}
              color={check.pass ? colors.success : colors.gray}
            />
            <Text style={[pStyles.checkText, check.pass && pStyles.checkTextPassed]}>
              {check.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const pStyles = StyleSheet.create({
  container: { marginBottom: 16, marginTop: -4 },
  barsRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 10 },
  barBg: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.lightGray, overflow: 'hidden' },
  barFill: { height: 5, borderRadius: 3 },
  strengthLabel: { fontSize: 12, fontWeight: '700', minWidth: 60, textAlign: 'right' },
  checks: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 4, width: '45%' },
  checkText: { fontSize: 11, color: colors.gray },
  checkTextPassed: { color: colors.success },
});

// --- Animated Input ---
const AnimatedInput = ({ icon, placeholder, value, onChangeText, secureTextEntry, keyboardType, rightElement, hasError, multiline }) => {
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

  return (
    <Animated.View style={[iStyles.wrapper, { borderColor }]}>
      <Icon name={icon} size={18} color={isFocused ? colors.primary : colors.gray} style={iStyles.icon} />
      <TextInput
        style={[iStyles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
        placeholder={placeholder}
        placeholderTextColor={colors.gray}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize="none"
        onFocus={handleFocus}
        onBlur={handleBlur}
        multiline={multiline}
      />
      {rightElement}
    </Animated.View>
  );
};

const iStyles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderRadius: 14, marginBottom: 14,
    paddingHorizontal: 14, paddingVertical: 2,
    backgroundColor: colors.white,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0, shadowRadius: 8, elevation: 2,
  },
  icon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: colors.dark, paddingVertical: 11 },
});

// --- RegisterScreen ---
const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', username: '', email: '', password: '', confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const { register } = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 60, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please grant access to your photos'); return; }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) animateAvatarSet(result.assets[0].uri);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission needed', 'Please grant camera permission'); return; }
    const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (!result.canceled) animateAvatarSet(result.assets[0].uri);
  };

  const animateAvatarSet = (uri) => {
    Animated.sequence([
      Animated.timing(avatarScale, { toValue: 0.85, duration: 100, useNativeDriver: true }),
      Animated.spring(avatarScale, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
    setAvatar(uri);
  };

  const showImagePickerOptions = () => {
    Alert.alert('Profile Picture', 'Choose a profile picture', [
      { text: 'Take Photo', onPress: takePhoto },
      { text: 'Choose from Gallery', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const uploadAvatar = async () => {
    if (!avatar) return null;
    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append('profileImage', { uri: avatar, type: 'image/jpeg', name: 'avatar.jpg' });
    try {
      const response = await api.post('/users/upload/avatar', formDataUpload, { headers: { 'Content-Type': 'multipart/form-data' } });
      return response.data.url;
    } catch (error) {
      console.error('Avatar upload failed:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleRegister = async () => {
    const { firstName, lastName, username, email, password, confirmPassword } = formData;
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      Alert.alert('Missing Info', 'Please fill in all fields to continue.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Password Mismatch', 'The passwords you entered do not match. Please re-enter them.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Weak Password', 'Your password needs to be at least 6 characters long.');
      return;
    }
    setLoading(true);
    let avatarUrl = null;
    if (avatar) avatarUrl = await uploadAvatar();
    const result = await register({ firstName, lastName, username, email, password, avatar: avatarUrl });
    setLoading(false);
    if (!result.success) Alert.alert('Registration Failed', result.error);
  };

  const passwordAnalysis = analyzePassword(formData.password);
  const passwordsMatch = formData.confirmPassword && formData.password === formData.confirmPassword;
  const passwordsDontMatch = formData.confirmPassword && formData.password !== formData.confirmPassword;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Back button */}
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Icon name="arrow-back" size={20} color={colors.primary} />
          </TouchableOpacity>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join FreshRecipe today! 🍽️</Text>

          {/* Avatar */}
          <View style={styles.avatarSection}>
            <TouchableOpacity onPress={showImagePickerOptions} activeOpacity={0.85}>
              <Animated.View style={[styles.avatarWrapper, { transform: [{ scale: avatarScale }] }]}>
                {avatar ? (
                  <Image source={{ uri: avatar }} style={styles.avatarImg} />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Icon name="person-add" size={30} color={colors.white} />
                  </View>
                )}
                <View style={styles.avatarBadge}>
                  <Icon name="camera" size={14} color={colors.white} />
                </View>
              </Animated.View>
            </TouchableOpacity>
            <Text style={styles.avatarLabel}>{avatar ? 'Tap to change photo' : 'Add profile photo'}</Text>
          </View>

          {/* Name row */}
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <AnimatedInput icon="person-outline" placeholder="First name" value={formData.firstName} onChangeText={(v) => handleChange('firstName', v)} />
            </View>
            <View style={{ width: 12 }} />
            <View style={{ flex: 1 }}>
              <AnimatedInput icon="person-outline" placeholder="Last name" value={formData.lastName} onChangeText={(v) => handleChange('lastName', v)} />
            </View>
          </View>

          <AnimatedInput icon="at-outline" placeholder="Username" value={formData.username} onChangeText={(v) => handleChange('username', v)} />
          <AnimatedInput icon="mail-outline" placeholder="Email address" value={formData.email} onChangeText={(v) => handleChange('email', v)} keyboardType="email-address" />

          {/* Password with strength */}
          <AnimatedInput
            icon="lock-closed-outline"
            placeholder="Password"
            value={formData.password}
            onChangeText={(v) => handleChange('password', v)}
            secureTextEntry={!showPassword}
            rightElement={
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
                <Icon name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray} />
              </TouchableOpacity>
            }
          />

          {/* Password strength meter — shows only when typing */}
          <PasswordStrengthMeter password={formData.password} />

          {/* Confirm password with match indicator */}
          <AnimatedInput
            icon="shield-checkmark-outline"
            placeholder="Confirm password"
            value={formData.confirmPassword}
            onChangeText={(v) => handleChange('confirmPassword', v)}
            secureTextEntry={!showConfirmPassword}
            hasError={passwordsDontMatch}
            rightElement={
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                {passwordsMatch && <Icon name="checkmark-circle" size={18} color={colors.success} />}
                {passwordsDontMatch && <Icon name="close-circle" size={18} color={colors.error} />}
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={{ padding: 4 }}>
                  <Icon name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.gray} />
                </TouchableOpacity>
              </View>
            }
          />
          {passwordsDontMatch && (
            <Text style={styles.matchError}>⚠️ Passwords do not match</Text>
          )}
          {passwordsMatch && (
            <Text style={styles.matchSuccess}>✓ Passwords match</Text>
          )}

          {/* Sign Up button */}
          <TouchableOpacity
            style={[styles.signUpBtn, (loading || uploading) && styles.signUpBtnDisabled]}
            onPress={handleRegister}
            disabled={loading || uploading}
            activeOpacity={0.85}
          >
            {loading || uploading ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <ActivityIndicator color={colors.white} size="small" />
                <Text style={styles.signUpText}>{uploading ? 'Uploading photo…' : 'Creating account…'}</Text>
              </View>
            ) : (
              <>
                <Text style={styles.signUpText}>Create Account</Text>
                <Icon name="arrow-forward" size={18} color={colors.white} style={{ marginLeft: 6 }} />
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.loginLink}>
            <Text style={styles.loginLinkText}>Already have an account? <Text style={{ fontWeight: '700' }}>Sign In</Text></Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fef6f6' },
  bgCircle1: {
    position: 'absolute', top: -60, right: -60,
    width: 220, height: 220, borderRadius: 110,
    backgroundColor: '#ffeded', opacity: 0.7,
  },
  bgCircle2: {
    position: 'absolute', bottom: 100, left: -80,
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: '#fff3f3', opacity: 0.5,
  },
  scroll: { padding: 24, paddingTop: 50 },
  backBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fff0f0', justifyContent: 'center', alignItems: 'center', marginBottom: 28 },
  title: { fontSize: 28, fontWeight: '800', color: colors.dark, marginBottom: 6, letterSpacing: -0.5, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.gray, marginBottom: 28, textAlign: 'center' },

  avatarSection: { alignItems: 'center', marginBottom: 28 },
  avatarWrapper: { position: 'relative', width: 100, height: 100 },
  avatarImg: { width: 100, height: 100, borderRadius: 28, borderWidth: 3, borderColor: colors.primary },
  avatarPlaceholder: {
    width: 100, height: 100, borderRadius: 28,
    backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8,
  },
  avatarBadge: {
    position: 'absolute', bottom: -2, right: -2,
    width: 30, height: 30, borderRadius: 10, backgroundColor: colors.dark,
    justifyContent: 'center', alignItems: 'center',
    borderWidth: 2, borderColor: '#fef6f6',
  },
  avatarLabel: { marginTop: 10, fontSize: 13, color: colors.primary, fontWeight: '500' },

  row: { flexDirection: 'row' },

  matchError: { fontSize: 12, color: colors.error, marginTop: -10, marginBottom: 12, marginLeft: 4 },
  matchSuccess: { fontSize: 12, color: colors.success, marginTop: -10, marginBottom: 12, marginLeft: 4, fontWeight: '500' },

  signUpBtn: {
    backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 15,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 8,
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  signUpBtnDisabled: { opacity: 0.7 },
  signUpText: { color: colors.white, fontSize: 16, fontWeight: '700' },

  loginLink: { alignItems: 'center', marginTop: 20, paddingBottom: 30 },
  loginLinkText: { fontSize: 14, color: colors.gray },
});

export default RegisterScreen;