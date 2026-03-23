import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../../context/AuthContext';
import colors from '../../shared/constants/colors';
import styles from '../styles/user.styles';

const ProfileScreen = ({ navigation }) => {
  const { user } = useAuth();

  const MenuItem = ({ icon, title, onPress, color = colors.primary }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <Icon name={icon} size={24} color={color} />
        <Text style={styles.menuTitle}>{title}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={colors.gray} />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        {user?.avatar ? (
          <Image source={{ uri: user.avatar }} style={styles.profileAvatar} />
        ) : (
          <View style={styles.profileAvatarPlaceholder}>
            <Text style={styles.profileAvatarText}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <Text style={styles.profileName}>{user?.username}</Text>
        <Text style={styles.profileEmail}>{user?.email}</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Recipes Saved</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>0</Text>
          <Text style={styles.statLabel}>Recipes Created</Text>
        </View>
      </View>

      <View style={styles.menuSection}>
        <MenuItem
          icon="person-outline"
          title="Edit Profile"
          onPress={() => navigation.navigate('EditProfile')}
        />
        <MenuItem
          icon="bookmark-outline"
          title="Saved Recipes"
          onPress={() => navigation.navigate('SavedRecipes')}
        />
        <MenuItem
          icon="settings-outline"
          title="Settings"
          onPress={() => navigation.navigate('Settings')}
        />
        <MenuItem
          icon="chatbubble-outline"
          title="Chatbot Assistant"
          onPress={() => navigation.navigate('Chat')}
        />
        <MenuItem
          icon="help-circle-outline"
          title="Help & Support"
          onPress={() => {}}
        />
        <MenuItem
          icon="log-out-outline"
          title="Logout"
          color={colors.error}
          onPress={() => {}}
        />
      </View>

      <Text style={styles.version}>Version 1.0.0</Text>
    </ScrollView>
  );
};

export default ProfileScreen;