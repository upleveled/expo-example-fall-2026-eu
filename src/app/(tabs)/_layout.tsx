import { Ionicons } from '@expo/vector-icons';
import { Link, Tabs } from 'expo-router';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../constants/theme.ts';

const styles = StyleSheet.create({
  headerRight: {
    marginRight: 16,
  },
});

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.text,
        tabBarInactiveTintColor: colors.textSecondary,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.text,
          borderTopWidth: 1,
        },
      }}
    >
      <Tabs.Screen
        name="animals"
        options={{
          title: 'Animals',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'paw' : 'paw-outline'}
              color={color as string}
              size={22}
            />
          ),
          headerRight: () => (
            <Link href="/animals/new" asChild>
              <TouchableOpacity style={styles.headerRight}>
                <Ionicons name="add" color={colors.text} size={24} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'document-text' : 'document-text-outline'}
              color={color as string}
              size={22}
            />
          ),
          headerRight: () => (
            <Link href="/notes/newNote" asChild>
              <TouchableOpacity style={styles.headerRight}>
                <Ionicons name="add" color={colors.text} size={24} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          headerShown: false,
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              color={color as string}
              size={22}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              color={color as string}
              size={22}
            />
          ),
        }}
      />
    </Tabs>
  );
}
