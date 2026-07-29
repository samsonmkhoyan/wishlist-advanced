import { Stack, Tabs } from 'expo-router';

export default function Layout() {
  return (
      <Tabs
          screenOptions={{
            headerShown: false, // <-- ВОТ ЭТА СТРОКА УБИРАЕТ ВЕРХНИЙ INDEX
          }}
      />
  );
}