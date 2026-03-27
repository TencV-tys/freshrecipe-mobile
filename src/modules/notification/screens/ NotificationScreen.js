import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import NotificationService from '../services/notification.service';
import NotificationCard from '../components/NotificationCard';
import EmptyNotifications from '../components/EmptyNotifications';
import colors from '../../shared/constants/colors';

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

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMode, setSelectedMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Animation values
  const headerAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Helper to get notification ID (handles both id and _id)
  const getNotificationId = (notification) => {
    return notification?.id || notification?._id;
  };

  const fetchNotifications = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setError(null);
    
    try {
      const result = await NotificationService.getNotifications();
      if (result.success) {
        const validNotifications = (result.data || []).filter(n => {
          const id = getNotificationId(n);
          if (!id) {
            console.warn('Notification missing ID:', n);
            return false;
          }
          return true;
        });
        
        setNotifications(validNotifications);
        const unread = validNotifications.filter(n => !n.isRead).length;
        setUnreadCount(unread);
        
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      } else {
        setError(result.error || 'Failed to load notifications');
      }
    } catch (err) {
      setError('Network error. Please check your connection.');
      console.error('Fetch error:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    // Header entrance animation
    Animated.spring(headerAnim, { toValue: 1, tension: 50, friction: 9, useNativeDriver: true }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      setSelectedMode(false);
      setSelectedIds([]);
      fadeAnim.setValue(0);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications(false);
    setRefreshing(false);
    setSelectedMode(false);
    setSelectedIds([]);
  };

  const handleRetry = () => {
    fetchNotifications();
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await NotificationService.markAsRead(notificationId);
    if (result.success) {
      setNotifications(prev =>
        prev.map(n => {
          const id = getNotificationId(n);
          return id === notificationId ? { ...n, isRead: true } : n;
        })
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const handleMarkAllAsRead = async () => {
    if (unreadCount === 0) {
      Alert.alert('Info', 'No unread notifications');
      return;
    }
    
    Alert.alert(
      'Mark All as Read',
      `Mark all ${unreadCount} unread notifications as read?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark All',
          onPress: async () => {
            const result = await NotificationService.markAllAsRead();
            if (result.success) {
              setNotifications(prev =>
                prev.map(n => ({ ...n, isRead: true }))
              );
              setUnreadCount(0);
              Alert.alert('Success', 'All notifications marked as read');
            }
          },
        },
      ]
    );
  };

  const handleDelete = async (notificationId) => {
    Alert.alert(
      'Delete Notification',
      'Are you sure you want to delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await NotificationService.deleteNotification(notificationId);
            if (result.success) {
              setNotifications(prev =>
                prev.filter(n => {
                  const id = getNotificationId(n);
                  return id !== notificationId;
                })
              );
              const deleted = notifications.find(n => {
                const id = getNotificationId(n);
                return id === notificationId;
              });
              if (deleted && !deleted.isRead) {
                setUnreadCount(prev => Math.max(0, prev - 1));
              }
            }
          },
        },
      ]
    );
  };

  const handleSelect = (notificationId) => {
    setSelectedIds(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    
    Alert.alert(
      'Delete Notifications',
      `Delete ${selectedIds.length} selected notification${selectedIds.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            let successCount = 0;
            for (const id of selectedIds) {
              const result = await NotificationService.deleteNotification(id);
              if (result.success) successCount++;
            }
            if (successCount > 0) {
              setNotifications(prev =>
                prev.filter(n => {
                  const id = getNotificationId(n);
                  return !selectedIds.includes(id);
                })
              );
              const deletedUnread = notifications.filter(n => {
                const id = getNotificationId(n);
                return selectedIds.includes(id) && !n.isRead;
              }).length;
              setUnreadCount(prev => Math.max(0, prev - deletedUnread));
              setSelectedIds([]);
              setSelectedMode(false);
              Alert.alert('Success', `${successCount} notification${successCount > 1 ? 's' : ''} deleted`);
            }
          },
        },
      ]
    );
  };

  const handlePress = (notification) => {
    const notificationId = getNotificationId(notification);
    
    if (selectedMode) {
      handleSelect(notificationId);
    } else {
      if (!notification.isRead) {
        handleMarkAsRead(notificationId);
      }
      if (notification.type === 'warning' || notification.type === 'suspension' || notification.type === 'ban') {
        Alert.alert(notification.title, notification.message);
      }
    }
  };

  const handleLongPress = (notification) => {
    setSelectedMode(true);
    const notificationId = getNotificationId(notification);
    handleSelect(notificationId);
  };

  const exitSelectionMode = () => {
    setSelectedMode(false);
    setSelectedIds([]);
  };

  const headerTranslateY = headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] });

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.white} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={theme.error} />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <PressableScale onPress={handleRetry}>
            <View style={styles.retryButton}>
              <Icon name="refresh-outline" size={20} color={theme.white} />
              <Text style={styles.retryButtonText}>Try Again</Text>
            </View>
          </PressableScale>
        </View>
      </SafeAreaView>
    );
  }

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
        <PressableScale onPress={() => selectedMode ? exitSelectionMode() : navigation.goBack()}>
          <View style={styles.backButton}>
            <Icon name={selectedMode ? "close" : "arrow-back"} size={24} color={theme.dark} />
          </View>
        </PressableScale>
        
        <Text style={styles.headerTitle}>
          {selectedMode ? `${selectedIds.length} selected` : 'Notifications'}
        </Text>
        
        {!selectedMode && unreadCount > 0 && (
          <PressableScale onPress={handleMarkAllAsRead}>
            <View style={styles.markAllButton}>
              <Text style={styles.markAllText}>Mark all read</Text>
            </View>
          </PressableScale>
        )}
        
        {selectedMode && selectedIds.length > 0 && (
          <PressableScale onPress={handleDeleteSelected}>
            <View style={styles.deleteButton}>
              <Icon name="trash-outline" size={22} color={theme.error} />
            </View>
          </PressableScale>
        )}
      </Animated.View>

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <FlatList
            data={notifications}
            keyExtractor={(item) => {
              const id = getNotificationId(item);
              return id ? id.toString() : Math.random().toString();
            }}
            renderItem={({ item }) => (
              <NotificationCard
                notification={item}
                onPress={handlePress}
                onLongPress={handleLongPress}
                onMarkRead={handleMarkAsRead}
                onDelete={handleDelete}
                selected={selectedIds.includes(getNotificationId(item))}
                selectMode={selectedMode}
              />
            )}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.primary]}
                tintColor={theme.primary}
              />
            }
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        </Animated.View>
      )}
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
    flex: 1,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  markAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  markAllText: {
    fontSize: 13,
    color: theme.primary,
    fontWeight: '600',
  },
  deleteButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    paddingBottom: 80,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: theme.gray,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.dark,
    marginTop: 16,
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  errorMessage: {
    fontSize: 14,
    color: theme.gray,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    shadowColor: theme.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.white,
  },
});

export default NotificationScreen;