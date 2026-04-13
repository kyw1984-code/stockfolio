import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { useAppTranslation } from '../../utils/useAppTranslation';
import { View } from 'react-native';
import { useColorScheme } from 'nativewind';
import { LayoutDashboard, PieChart, Calculator, Settings as SettingsIcon } from 'lucide-react-native';
import { useSettingsStore } from '../../stores/useSettingsStore';

function TabIcon({ name, focused, color, size }: { name: string; focused: boolean; color: string; size: number }) {
  const Icon = {
    portfolio: LayoutDashboard,
    dividends: PieChart,
    calculator: Calculator,
    settings: SettingsIcon,
  }[name] || LayoutDashboard;

  return (
    <View className="items-center justify-center">
      <Icon size={size} color={color} strokeWidth={focused ? 2.5 : 2} />
    </View>
  );
}

export default function TabLayout() {
  const { t } = useAppTranslation();
  const theme = useSettingsStore((s) => s.theme);
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme(theme);
  }, [theme]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#020617',
          borderTopColor: '#1E293B',
          height: 64,
          paddingBottom: 8,
          paddingTop: 8,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.portfolio'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="portfolio" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="dividends"
        options={{
          title: t('tabs.dividends'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="dividends" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="calculator"
        options={{
          title: t('tabs.calculator'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="calculator" focused={focused} color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ focused, color, size }) => (
            <TabIcon name="settings" focused={focused} color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
