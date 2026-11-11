import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme.ts';
import type { LogoutResponseBodyPost } from '../(auth)/api/logout+api.ts';
import type { UserResponseBodyGet } from '../api/user+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 20,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  text: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
  },
  username: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 24,
    marginTop: 12,
  },
  button: {
    backgroundColor: colors.text,
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 11,
    marginTop: 20,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default function ProfileScreen() {
  const [username, setUsername] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        if (!response.ok) {
          router.replace('/login?returnTo=/(tabs)/profile');
          return;
        }

        const body: UserResponseBodyGet = await response.json();

        if ('error' in body) {
          router.replace('/login?returnTo=/(tabs)/profile');
          return;
        }

        setUsername(body.user.username);
      }

      getUser().catch((error) => {
        console.error(error);
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.text}>
          Private notes are enabled for this account.
        </Text>
        <Text style={styles.username}>{username}</Text>
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={async () => {
            const response = await fetch('/api/logout', { method: 'POST' });
            const body: LogoutResponseBodyPost = await response.json();

            if ('error' in body) {
              Alert.alert('Logout failed', body.error);
              return;
            }

            router.replace('/login');
          }}
        >
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}
