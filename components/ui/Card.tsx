import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'glass' | 'gradient';
  intensity?: number;
}

export default function Card({ children, style, variant = 'default', intensity = 20 }: CardProps) {
  const renderCard = () => {
    switch (variant) {
      case 'glass':
        return (
          <BlurView intensity={intensity} style={[styles.card, styles.glassCard, style]}>
            {children}
          </BlurView>
        );
      case 'gradient':
        return (
          <LinearGradient
            colors={['rgba(255, 250, 229, 0.1)', 'rgba(255, 250, 229, 0.05)']}
            style={[styles.card, style]}
          >
            {children}
          </LinearGradient>
        );
      default:
        return (
          <View style={[styles.card, styles.defaultCard, style]}>
            {children}
          </View>
        );
    }
  };

  return renderCard();
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  defaultCard: {
    backgroundColor: 'rgba(255, 250, 229, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 250, 229, 0.1)',
  },
  glassCard: {
    borderWidth: 1,
    borderColor: 'rgba(255, 250, 229, 0.2)',
  },
});