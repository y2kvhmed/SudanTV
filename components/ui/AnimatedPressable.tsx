import React from 'react';
import { Pressable, PressableProps } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface AnimatedPressableProps extends PressableProps {
  children: React.ReactNode;
  scaleValue?: number;
  hapticFeedback?: boolean;
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
}

const AnimatedPressableComponent = Animated.createAnimatedComponent(Pressable);

export default function AnimatedPressable({
  children,
  scaleValue = 0.95,
  hapticFeedback = true,
  springConfig = { damping: 15, stiffness: 150 },
  onPressIn,
  onPressOut,
  onPress,
  ...props
}: AnimatedPressableProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = (event: any) => {
    scale.value = withSpring(scaleValue, springConfig);
    opacity.value = withTiming(0.8, { duration: 100 });
    
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    onPressIn?.(event);
  };

  const handlePressOut = (event: any) => {
    scale.value = withSpring(1, springConfig);
    opacity.value = withTiming(1, { duration: 100 });
    onPressOut?.(event);
  };

  const handlePress = (event: any) => {
    if (hapticFeedback) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    onPress?.(event);
  };

  return (
    <AnimatedPressableComponent
      style={animatedStyle}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
      {...props}
    >
      {children}
    </AnimatedPressableComponent>
  );
}