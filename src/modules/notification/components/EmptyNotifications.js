import React from 'react';
import {
  View,
  Text,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const EmptyNotifications = () => {
  return (
    <View style={styles.container}>
      <Icon name="notifications-off-outline" size={64} color={colors.gray} />
      <Text style={styles.title}>No Notifications</Text>
      <Text style={styles.subtitle}>
        You're all caught up! When you receive notifications, they'll appear here.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.gray,
    textAlign: 'center',
    marginTop: 8,
  },
});

export default EmptyNotifications;