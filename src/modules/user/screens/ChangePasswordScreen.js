import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../../api/api';

const { width } = Dimensions.get('window');

const theme = {
  primary: '#ff6b6b',
  primaryDark: '#e85555', 
  primaryFaint: '#fff0f0',
  primaryLight: '#ff8e8e',
  secondary: '#ff9f43',
  secondaryFaint: '#fff8f0',
  teal: '#00c9a7',
  tealFaint: '#f0fdf9',
  blue: '#33b5e5',
  blueFaint: '#f0f8ff',
  dark: '#1a1a2e',
  gray: '#8a8a9a',
  lightGray: '#f4f4f8',
  white: '#ffffff',
  black: '#1a1a2e',
  error: '#ff4444',
};

// Pressable with scale feedback (same as all screens)
const PressableScale = ({ onPress, style, children, activeOpacity = 0.82 }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const onPressIn = () => Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, tension: 200, friction: 10 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, tension: 200, friction: 10 }).start();
  return (
    <Animated.View style={[{ transform: [{ scale }] }, style]}>
      <TouchableOpacity onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} activeOpacity={activeOpacity}>
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Input Component
const AnimatedInput = ({ label, value, onChangeText, placeholder, secureTextEntry, onToggleVisibility, showPassword }) => {
  const [animValue] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay: 100,
      useNativeDriver: true,
    }).start();
  }, []);
  
  const translateY = animValue.interpolate({ 
    inputRange: [0, 1], 
    outputRange: [15, 0]
  });
  
  const borderColor = isFocused ? theme.primary : theme.lightGray;
  
  return (
    <Animated.View 
      style={[
        styles.formGroup,
        { opacity: animValue, transform: [{ translateY }] }
      ]}
    >
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.passwordContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={!showPassword}
          placeholder={placeholder}
          placeholderTextColor={theme.gray}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <PressableScale onPress={onToggleVisibility}>
          <View style={styles.eyeIcon}>
            <Icon 
              name={showPassword ? "eye-off" : "eye"} 
              size={20} 
              color={theme.gray} 
            />
          </View>
        </PressableScale>
      </View>
    </Animated.View>
  );
};

const ChangePasswordScreen = ({ navigation }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(buttonAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, []);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.put('/users/change-password', {
        currentPassword,
        newPassword,
      });
      Alert.alert('Success', 'Password changed successfully', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const contentTranslateY = contentAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });
  const buttonTranslateY = buttonAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
      
      {/* Soft decorative blobs */}
      <View style={styles.blob1} />
      <View style={styles.blob2} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          { opacity: headerAnim, transform: [{ translateY: headerTranslateY }] }
        ]}
      >
        <PressableScale onPress={() => navigation.goBack()}>
          <View style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={theme.dark} />
          </View>
        </PressableScale>
        <Text style={styles.headerTitle}>Change Password</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Info Box */}
        <Animated.View 
          style={[
            styles.infoBox,
            { opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }
          ]}
        >
          <Icon name="information-circle-outline" size={20} color={theme.primary} />
          <Text style={styles.infoText}>
            Choose a strong password with at least 6 characters
          </Text>
        </Animated.View>

        {/* Form Fields */}
        <AnimatedInput
          label="Current Password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          placeholder="Enter current password"
          secureTextEntry={!showCurrent}
          showPassword={showCurrent}
          onToggleVisibility={() => setShowCurrent(!showCurrent)}
        />

        <AnimatedInput
          label="New Password"
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="Enter new password"
          secureTextEntry={!showNew}
          showPassword={showNew}
          onToggleVisibility={() => setShowNew(!showNew)}
        />

        <AnimatedInput
          label="Confirm New Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm new password"
          secureTextEntry={!showConfirm}
          showPassword={showConfirm}
          onToggleVisibility={() => setShowConfirm(!showConfirm)}
        />

        {/* Password Strength Indicator (optional) */}
        {newPassword.length > 0 && (
          <Animated.View 
            style={[
              styles.strengthContainer,
              { opacity: contentAnim, transform: [{ translateY: contentTranslateY }] }
            ]}
          >
            <View style={styles.strengthBarContainer}>
              <View 
                style={[
                  styles.strengthBar,
                  { 
                    width: `${Math.min((newPassword.length / 6) * 100, 100)}%`,
                    backgroundColor: newPassword.length >= 6 ? theme.teal : theme.secondary
                  }
                ]} 
              />
            </View>
            <Text style={styles.strengthText}>
              {newPassword.length >= 6 ? '✓ Strong password' : 'Password should be at least 6 characters'}
            </Text>
          </Animated.View>
        )}

        {/* Save Button */}
        <Animated.View 
          style={[
            styles.buttonWrapper,
            { opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] }
          ]}
        >
          <PressableScale onPress={handleChangePassword} disabled={loading}>
            <View style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <Icon name="lock-closed-outline" size={20} color={theme.white} />
                  <Text style={styles.saveButtonText}>Update Password</Text>
                </>
              )}
            </View>
          </PressableScale>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  // Background blobs (matching all screens)
  blob1: {
    position: 'absolute',
    top: -70,
    right: -70,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#ffeded',
    opacity: 0.6,
  },
  blob2: {
    position: 'absolute',
    top: 200,
    left: -90,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#fff8f0',
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    borderBottomWidth: 1,
    borderBottomColor: theme.lightGray,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 6,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.dark,
    letterSpacing: -0.3,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primaryFaint,
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    gap: 10,
    borderWidth: 1,
    borderColor: theme.primaryLight,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: theme.gray,
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.dark,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.lightGray,
    borderRadius: 14,
    backgroundColor: theme.white,
    overflow: 'hidden',
  },
  input: {
    flex: 1,
    padding: 14,
    fontSize: 15,
    color: theme.dark,
  },
  eyeIcon: {
    padding: 12,
  },
  strengthContainer: {
    marginTop: 8,
    marginBottom: 20,
  },
  strengthBarContainer: {
    height: 4,
    backgroundColor: theme.lightGray,
    borderRadius: 2,
    overflow: 'hidden',
  },
  strengthBar: {
    height: '100%',
    borderRadius: 2,
  },
  strengthText: {
    fontSize: 11,
    color: theme.gray,
    marginTop: 6,
  },
  buttonWrapper: {
    marginTop: 20,
    marginBottom: 20,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.7,
  },
  saveButtonText: {
    color: theme.white,
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ChangePasswordScreen;