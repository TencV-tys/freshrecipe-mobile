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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import NotificationService from '../services/notification.service';
import NotificationCard from '../components/NotificationCard';
import EmptyNotifications from '../components/EmptyNotifications';
import colors from '../../shared/constants/colors';
import styles from '../styles/notification.styles';

const NotificationScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMode, setSelectedMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
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
        console.log('📱 Notifications received:', result.data?.length || 0);
        
        // Validate each notification has required fields
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
        
        // Fade in animation when data loads
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

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state with retry button
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
        <View style={styles.errorContainer}>
          <Icon name="alert-circle-outline" size={64} color={colors.error} />
          <Text style={styles.errorTitle}>Failed to Load</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Icon name="refresh-outline" size={20} color={colors.white} />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          onPress={() => selectedMode ? exitSelectionMode() : navigation.goBack()} 
          style={styles.backButton}
        >
          <Icon name={selectedMode ? "close" : "arrow-back"} size={24} color={colors.black} />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>
          {selectedMode ? `${selectedIds.length} selected` : 'Notifications'}
        </Text>
        
        {!selectedMode && unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.markAllButton}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
        
        {selectedMode && selectedIds.length > 0 && (
          <TouchableOpacity onPress={handleDeleteSelected} style={styles.deleteButton}>
            <Icon name="trash-outline" size={22} color={colors.error} />
          </TouchableOpacity>
        )}
      </View>

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
                colors={[colors.primary]}
                tintColor={colors.primary}
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

export default NotificationScreen;