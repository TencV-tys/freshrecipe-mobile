import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
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

// Pressable with scale feedback
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

const NotificationCard = ({ notification, onPress, onLongPress, onMarkRead, onDelete, selected, selectMode }) => {
  const cardAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(cardAnim, {
      toValue: 1,
      tension: 55,
      friction: 9,
      useNativeDriver: true,
    }).start();
  }, []);

  const getIcon = (type, severity) => {
    if (type === 'warning') return 'warning-outline';
    if (type === 'suspension') return 'time-outline';
    if (type === 'ban') return 'ban-outline';
    if (type === 'unban') return 'checkmark-circle-outline';
    if (type === 'report') return 'camera-outline';
    return 'notifications-outline';
  };

  const getIconColor = (severity) => {
    switch (severity) {
      case 'danger': return theme.error;
      case 'warning': return theme.secondary;
      case 'success': return theme.teal;
      default: return theme.primary;
    }
  };

  const getBgColor = (severity) => {
    switch (severity) {
      case 'danger': return '#fee2e2';
      case 'warning': return '#fef3c7';
      case 'success': return '#d1fae5';
      default: return theme.primaryFaint;
    }
  };

  const cardTranslateY = cardAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 0],
  });

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 200,
      friction: 10,
      useNativeDriver: true,
    }).start();
  };

  // Helper to get date from either createdAt or created_at
  const getNotificationDate = () => {
    const dateString = notification.createdAt || notification.created_at;
    if (!dateString) return 'Date not available';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid date';
    return `${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Helper to get id from either id or _id
  const getNotificationId = () => {
    return notification.id || notification._id;
  };

  const iconName = getIcon(notification.type, notification.severity);
  const iconColor = getIconColor(notification.severity);
  const bgColor = getBgColor(notification.severity);

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          opacity: cardAnim,
          transform: [{ translateY: cardTranslateY }],
        },
      ]}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        <TouchableOpacity
          style={[
            styles.card,
            !notification.isRead && styles.unread,
            selected && styles.selected,
          ]}
          onPress={() => onPress(notification)}
          onLongPress={() => onLongPress && onLongPress(notification)}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          activeOpacity={0.9}
          delayLongPress={500}
        >
          {selectMode && (
            <View style={styles.checkbox}>
              <Icon
                name={selected ? "checkbox" : "square-outline"}
                size={22}
                color={selected ? theme.primary : theme.gray}
              />
            </View>
          )}

          <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
            <Icon name={iconName} size={24} color={iconColor} />
          </View>

          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={1}>
              {notification.title}
            </Text>
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
            <View style={styles.dateContainer}>
              <Icon name="time-outline" size={10} color={theme.gray} />
              <Text style={styles.date}>
                {getNotificationDate()}
              </Text>
            </View>
          </View>

          {!selectMode && !notification.isRead && (
            <PressableScale onPress={() => onMarkRead(getNotificationId())}>
              <View style={styles.markReadButton}>
                <Icon name="ellipse" size={12} color={theme.primary} />
              </View>
            </PressableScale>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: theme.white,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.lightGray,
  },
  unread: {
    backgroundColor: theme.primaryFaint,
    borderColor: theme.primaryLight,
  },
  selected: {
    backgroundColor: theme.secondaryFaint,
    borderColor: theme.secondary,
  },
  checkbox: {
    marginRight: 12,
    justifyContent: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.dark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  message: {
    fontSize: 13,
    color: theme.gray,
    lineHeight: 18,
    marginBottom: 6,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  date: {
    fontSize: 11,
    color: theme.gray,
    fontWeight: '500',
  },
  markReadButton: {
    padding: 8,
    alignSelf: 'center',
  },
});

export default NotificationCard;