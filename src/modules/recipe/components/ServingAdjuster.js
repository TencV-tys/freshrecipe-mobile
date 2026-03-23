import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import colors from '../../shared/constants/colors';

const ServingAdjuster = ({ servings, onServingsChange }) => {
  const increment = () => onServingsChange(servings + 1);
  const decrement = () => servings > 1 && onServingsChange(servings - 1);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Servings</Text>
      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={decrement}>
          <Icon name="remove" size={20} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.value}>{servings}</Text>
        <TouchableOpacity style={styles.button} onPress={increment}>
          <Icon name="add" size={20} color={colors.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.lightGray,
    padding: 16,
    borderRadius: 12,
    marginVertical: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.black,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  value: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.black,
    minWidth: 40,
    textAlign: 'center',
  },
});

export default ServingAdjuster;