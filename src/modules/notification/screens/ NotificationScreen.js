import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
  StatusBar,
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
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedMode, setSelectedMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchNotifications = async () => {
    const result = await NotificationService.getNotifications();
    if (result.success) {
      setNotifications(result.data);
      const unread = result.data.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    }
    setLoading(false);
  };

  useFocusEffect(
    useCallback(() => {
      fetchNotifications();
      setSelectedMode(false);
      setSelectedIds([]);
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
    setSelectedMode(false);
    setSelectedIds([]);
  };

  const handleMarkAsRead = async (notificationId) => {
    const result = await NotificationService.markAsRead(notificationId);
    if (result.success) {
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        )
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
                prev.filter(n => n.id !== notificationId)
              );
              // Update unread count if deleted notification was unread
              const deleted = notifications.find(n => n.id === notificationId);
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
                prev.filter(n => !selectedIds.includes(n.id))
              );
              // Update unread count
              const deletedUnread = notifications.filter(
                n => selectedIds.includes(n.id) && !n.isRead
              ).length;
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
    if (selectedMode) {
      handleSelect(notification.id);
    } else {
      if (!notification.isRead) {
        handleMarkAsRead(notification.id);
      }
      // Optional: Navigate based on notification type
      if (notification.type === 'warning' || notification.type === 'suspension' || notification.type === 'ban') {
        Alert.alert(notification.title, notification.message);
      }
    }
  };

  const handleLongPress = (notification) => {
    setSelectedMode(true);
    handleSelect(notification.id);
  };

  const exitSelectionMode = () => {
    setSelectedMode(false);
    setSelectedIds([]);
  };

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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => selectedMode ? exitSelectionMode() : navigation.goBack()} style={styles.backButton}>
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
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <NotificationCard
              notification={item}
              onPress={handlePress}
              onLongPress={handleLongPress}
              onMarkRead={handleMarkAsRead}
              onDelete={handleDelete}
              selected={selectedIds.includes(item.id)}
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
      )}
    </SafeAreaView>
  );
};

export default NotificationScreen;