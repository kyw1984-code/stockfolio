import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import '../i18n';

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#FFFFFF' },
          headerTintColor: '#000000',
          headerTitleStyle: { fontWeight: '600' },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="add-stock"
          options={{
            title: 'Add Stock',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="add-transaction"
          options={{
            title: 'Add Transaction',
            presentation: 'modal',
          }}
        />
        <Stack.Screen
          name="stock/[ticker]"
          options={{ title: 'Stock Detail' }}
        />
        <Stack.Screen
          name="data-sources"
          options={{
            title: 'Data Sources',
            presentation: 'modal',
          }}
        />
      </Stack>
    </>
  );
}
