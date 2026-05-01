import React, { useEffect, useRef } from 'react';
import { Animated, TouchableWithoutFeedback, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '../../constants/theme';

interface ModernSwitchProps {
  value: boolean;
  onValueChange: (val: boolean) => void;
  disabled?: boolean;
  style?: ViewStyle;
}

export function ModernSwitch({ value, onValueChange, disabled = false, style }: ModernSwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      bounciness: 8,
      speed: 12,
    }).start();
  }, [value, animatedValue]);

  const thumbPosition = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22], // Track width (44) - Thumb width (20) - padding (2) = 22
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['#E5E7EB', Colors.success], // Matches the image's light gray / green
  });

  return (
    <TouchableWithoutFeedback onPress={() => !disabled && onValueChange(!value)}>
      <Animated.View style={[styles.track, { backgroundColor, opacity: disabled ? 0.6 : 1 }, style]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX: thumbPosition }] }]} />
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 44,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 3,
  },
});
