import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/api';
import { BASE_IP } from '../../../api/apiConfig';

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
const AnimatedInput = ({ label, value, onChangeText, placeholder, keyboardType, autoCapitalize, delay = 0 }) => {
  const [animValue] = useState(new Animated.Value(0));
  const [isFocused, setIsFocused] = useState(false);
  
  useEffect(() => {
    Animated.spring(animValue, {
      toValue: 1,
      tension: 55,
      friction: 9,
      delay,
      useNativeDriver: true,
    }).start();
  }, [delay]);
  
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
      <View style={[styles.inputContainer, { borderColor }]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.gray}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
      </View>
    </Animated.View>
  );
};

const EditProfileScreen = ({ navigation }) => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
  });
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const avatarAnim = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Update form when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
      });
      setAvatar(user.avatar || null);
    }
  }, [user]);

  useEffect(() => {
    // Entrance animations
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
    Animated.spring(avatarAnim, { toValue: 1, tension: 55, friction: 9, delay: 100, useNativeDriver: true }).start();
    Animated.spring(contentAnim, { toValue: 1, tension: 55, friction: 9, delay: 150, useNativeDriver: true }).start();
    Animated.spring(buttonAnim, { toValue: 1, tension: 55, friction: 9, delay: 200, useNativeDriver: true }).start();
  }, []);

  const getImageUrl = () => {
    if (!avatar) return null;
    if (avatar.startsWith('http')) return avatar;
    return `${BASE_IP}${avatar}`;
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant permission to access your photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
      await uploadAvatar(result.assets[0].uri);
    }
  };

  const uploadAvatar = async (imageUri) => {
    setUploadingAvatar(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('profileImage', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'avatar.jpg',
      });
      
      const uploadRes = await api.post('/users/upload/avatar', formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (uploadRes.data.user && setUser) {
        setUser(uploadRes.data.user);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      Alert.alert('Error', 'Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    
    try {
      const response = await api.put('/users/profile', {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
      });
      
      if (setUser && response.data) {
        setUser(response.data);
      }
      
      Alert.alert('Success', 'Profile updated successfully');
      navigation.goBack();
    } catch (error) {
      console.error('Update error:', error.response?.data);
      const errorMessage = error.response?.data?.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });
  const avatarScale = avatarAnim.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] });
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </Animated.View>

      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Avatar Section */}
        <Animated.View 
          style={[
            styles.avatarContainer,
            { opacity: avatarAnim, transform: [{ scale: avatarScale }] }
          ]}
        >
          <PressableScale onPress={pickImage} disabled={uploadingAvatar}>
            <View style={styles.avatarWrapper}>
              {uploadingAvatar ? (
                <View style={styles.avatarPlaceholder}>
                  <ActivityIndicator size="large" color={theme.white} />
                </View>
              ) : getImageUrl() ? (
                <Image 
                  source={{ uri: getImageUrl() }} 
                  style={styles.avatar} 
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Icon name="camera" size={32} color={theme.white} />
                </View>
              )}
              <View style={styles.editAvatarIcon}>
                <Icon name="pencil" size={14} color={theme.white} />
              </View>
            </View>
          </PressableScale>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </Animated.View>

        {/* Form Fields */}
        <Animated.View style={{ opacity: contentAnim }}>
          <AnimatedInput
            label="Username"
            value={formData.username}
            onChangeText={(text) => setFormData({ ...formData, username: text })}
            placeholder="Username"
            delay={0}
          />

          <AnimatedInput
            label="Email"
            value={formData.email}
            onChangeText={(text) => setFormData({ ...formData, email: text })}
            placeholder="Email"
            keyboardType="email-address"
            autoCapitalize="none"
            delay={50}
          />

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <AnimatedInput
                label="First Name"
                value={formData.firstName}
                onChangeText={(text) => setFormData({ ...formData, firstName: text })}
                placeholder="First Name"
                delay={100}
              />
            </View>
            <View style={styles.halfWidth}>
              <AnimatedInput
                label="Last Name"
                value={formData.lastName}
                onChangeText={(text) => setFormData({ ...formData, lastName: text })}
                placeholder="Last Name"
                delay={150}
              />
            </View>
          </View>
        </Animated.View>

        {/* Save Button */}
        <Animated.View 
          style={[
            styles.buttonWrapper,
            { opacity: buttonAnim, transform: [{ translateY: buttonTranslateY }] }
          ]}
        >
          <PressableScale onPress={handleSave} disabled={loading}>
            <View style={[styles.saveButton, loading && styles.saveButtonDisabled]}>
              {loading ? (
                <ActivityIndicator color={theme.white} />
              ) : (
                <>
                  <Icon name="save-outline" size={20} color={theme.white} />
                  <Text style={styles.saveButtonText}>Save Changes</Text>
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: theme.primary,
    backgroundColor: theme.white,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editAvatarIcon: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: theme.primary,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  avatarHint: {
    fontSize: 12,
    color: theme.gray,
    marginTop: 12,
    fontWeight: '500',
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: theme.dark,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: theme.lightGray,
    borderRadius: 14,
    backgroundColor: theme.white,
    overflow: 'hidden',
  },
  input: {
    padding: 14,
    fontSize: 15,
    color: theme.dark,
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

export default EditProfileScreen;