import { Stack } from 'expo-router';
import { theme } from './theme';

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.surface },
        headerTintColor: theme.colors.text,
        headerBackTitleVisible: false,
        headerTitleStyle: { fontWeight: '800' },
        contentStyle: { backgroundColor: theme.colors.bg },
      }}
    />
  );
}
