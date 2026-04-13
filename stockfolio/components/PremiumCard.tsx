import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export default function PremiumCard({ 
  children, 
  className = "", 
  intensity = 30,
}: PremiumCardProps) {
  const isIOS = Platform.OS === 'ios';

  return (
    <View className={`rounded-[40px] overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl dark:shadow-none ${className}`}>
      {isIOS ? (
        <BlurView intensity={intensity} tint="default" className="p-7">
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.7)', 'rgba(255, 255, 255, 0.4)']}
            className="dark:hidden"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={['rgba(15, 23, 42, 0.7)', 'rgba(2, 6, 23, 0.8)']}
            className="hidden dark:flex"
            style={StyleSheet.absoluteFill}
          />
          {children}
        </BlurView>
      ) : (
        <View className="bg-white/90 dark:bg-slate-900/90 p-7">
          {children}
        </View>
      )}
    </View>
  );
}
