import React, { useState } from 'react';
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
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../../api/api';

const colors = {
  primary: '#ff6b6b',
  secondary: '#4ecdc4',
  white: '#ffffff',
  gray: '#666666',
  lightGray: '#f5f5f5',
  black: '#000000',
  success: '#00c851',
  error: '#ff4444',
};

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState('request');
  const [email, setEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleRequestReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      Alert.alert(
        'Check Your Email',
        `We've sent a password reset token to ${email}.\n\nPlease check your inbox and paste the token in the next screen.`,
        [{ text: 'OK', onPress: () => setStep('token') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetToken) {
      Alert.alert('Error', 'Please enter the reset token from your email');
      return;
    }

    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all password fields');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await api.post(`/auth/reset-password/${resetToken}`, { password: newPassword });
      Alert.alert(
        'Success',
        'Password has been reset successfully. You can now log in with your new password.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  const pasteFromClipboard = async () => {
    try {
      const text = await Clipboard.getString();
      if (text && text.length > 10) {
        setResetToken(text);
        Alert.alert('Success', 'Token pasted from clipboard');
      } else {
        Alert.alert('Error', 'No valid token found in clipboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Could not paste from clipboard');
    }
  };

  if (step === 'request') {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Icon name="mail-outline" size={64} color={colors.primary} />
            <Text style={styles.title}>Forgot Password?</Text>
            <Text style={styles.subtitle}>
              Enter your email address and we'll send you a reset token.
            </Text>
          </View>

          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor={colors.gray}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRequestReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <Text style={styles.buttonText}>Send Reset Token</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.link}>Back to Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('request')}>
          <Icon name="arrow-back" size={24} color={colors.primary} />
        </TouchableOpacity>

        <View style={styles.header}>
          <Icon name="key-outline" size={64} color={colors.primary} />
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter the token from your email and your new password.
          </Text>
        </View>

        <View style={styles.form}>
          {/* Token Input with Paste Button */}
          <View style={styles.tokenContainer}>
            <Text style={styles.label}>Reset Token</Text>
            <View style={styles.tokenInputWrapper}>
              <TextInput
                style={styles.tokenInput}
                placeholder="Paste the token from email"
                placeholderTextColor={colors.gray}
                value={resetToken}
                onChangeText={setResetToken}
                autoCapitalize="none"
                multiline
              />
              <TouchableOpacity
                style={styles.pasteButton}
                onPress={pasteFromClipboard}
              >
                <Icon name="copy-outline" size={20} color={colors.primary} />
                <Text style={styles.pasteText}>Paste</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.tokenHint}>
              Check your email inbox for the reset token
            </Text>
          </View>

          {/* New Password */}
          <View style={styles.passwordContainer}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter new password"
                placeholderTextColor={colors.gray}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Icon
                  name={showNewPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm New Password */}
          <View style={styles.passwordContainer}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordInputContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Confirm new password"
                placeholderTextColor={colors.gray}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Icon
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color={colors.gray}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={styles.button}
            onPress={handleResetPassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <Text style={styles.buttonText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 20,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: colors.gray,
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  button: {
    backgroundColor: colors.primary,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: colors.white,
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: colors.primary,
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
  tokenContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    color: colors.black,
  },
  tokenInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tokenInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 15,
    fontSize: 14,
    backgroundColor: colors.white,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  pasteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    gap: 5,
  },
  pasteText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  tokenHint: {
    fontSize: 12,
    color: colors.gray,
    marginTop: 8,
  },
  passwordContainer: {
    marginBottom: 16,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.lightGray,
    borderRadius: 10,
    padding: 15,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: colors.white,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
  },
});

export default ForgotPasswordScreen;