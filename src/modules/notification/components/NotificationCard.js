import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const NotificationCard = ({ notification, onPress, onLongPress, onMarkRead, onDelete, selected, selectMode }) => {
  const getIcon = (type, severity) => {
    if (type === 'warning') return '⚠️';
    if (type === 'suspension') return '⏰';
    if (type === 'ban') return '🚫';
    if (type === 'unban') return '✅';
    if (type === 'report') return '📸';
    return '🔔';
  };

  const getBgColor = (severity) => {
    switch (severity) {
      case 'danger': return '#fee2e2';
      case 'warning': return '#fef3c7';
      case 'success': return '#d1fae5';
      default: return '#f1f5f9';
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.card,
        !notification.isRead && styles.unread,
        selected && styles.selected
      ]}
      onPress={() => onPress(notification)}
      onLongPress={() => onLongPress && onLongPress(notification)}
      activeOpacity={0.7}
      delayLongPress={500}
    >
      {selectMode && (
        <View style={styles.checkbox}>
          <Icon 
            name={selected ? "checkbox" : "square-outline"} 
            size={22} 
            color={selected ? colors.primary : colors.gray} 
          />
        </View>
      )}
      
      <View style={[styles.iconContainer, { backgroundColor: getBgColor(notification.severity) }]}>
        <Text style={styles.icon}>{getIcon(notification.type, notification.severity)}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>{notification.title}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {notification.message}
        </Text>
        <Text style={styles.date}>
          {new Date(notification.createdAt).toLocaleDateString()} at{' '}
          {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
      
      {!selectMode && !notification.isRead && (
        <TouchableOpacity
          style={styles.markReadButton}
          onPress={() => onMarkRead(notification.id)}
        >
          <Icon name="ellipse" size={12} color={colors.primary} />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: colors.white,
    borderRadius: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: colors.lightGray,
  },
  unread: {
    backgroundColor: '#fef2f2',
    borderColor: colors.primary,
  },
  selected: {
    backgroundColor: '#e0e7ff',
    borderColor: colors.primary,
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
    marginRight: 12,
  },
  icon: {
    fontSize: 24,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: colors.gray,
    lineHeight: 20,
    marginBottom: 8,
  },
  date: {
    fontSize: 11,
    color: colors.gray,
  },
  markReadButton: {
    padding: 8,
    alignSelf: 'center',
  },
});

export default NotificationCard;