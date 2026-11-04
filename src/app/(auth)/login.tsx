import {
  Link,
  type Href,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../constants/theme.ts';
import type { UserResponseBodyGet } from '../api/user+api.ts';
import type { LoginResponseBodyPost } from './api/login+api.ts';
import { getSafeReturnToPath } from '../../../util/validation.ts';

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
    padding: 16,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 28,
    lineHeight: 34,
    marginBottom: 8,
  },
  description: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 20,
  },
  label: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  input: {
    color: colors.text,
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 10,
    fontFamily: fonts.body,
    fontSize: 15,
    marginBottom: 12,
  },
  button: {
    backgroundColor: colors.text,
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 11,
    marginTop: 8,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
  footerLink: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { returnTo } = useLocalSearchParams<{ returnTo?: string | string[] }>();
  const safeReturnToPath = getSafeReturnToPath(returnTo);

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        if (!response.ok) {
          return;
        }

        const responseBody: UserResponseBodyGet = await response.json();

        if ('user' in responseBody) {
          router.replace((safeReturnToPath || '/(tabs)/animals') as Href);
        }
      }

      getUser().catch((error) => {
        console.error(error);
      });
    }, [safeReturnToPath]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login</Text>
        <Text style={styles.description}>
          Sign in to access your private notes.
        </Text>
        <Text style={styles.label}>Username</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          accessibilityLabel="Username"
          value={username}
          onChangeText={setUsername}
          style={styles.input}
        />
        <Text style={styles.label}>Password</Text>
        <TextInput
          autoCapitalize="none"
          autoCorrect={false}
          secureTextEntry
          accessibilityLabel="Password"
          value={password}
          onChangeText={setPassword}
          style={styles.input}
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={async () => {
            const response = await fetch('/api/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                user: { username, password },
              }),
            });

            const responseBody: LoginResponseBodyPost = await response.json();

            if ('error' in responseBody) {
              Alert.alert('Login failed', responseBody.error);
              return;
            }

            setUsername('');
            setPassword('');

            router.replace((safeReturnToPath || '/(tabs)/animals') as Href);
          }}
        >
          <Text style={styles.buttonText}>Login</Text>
        </Pressable>
        <View style={styles.footer}>
          <Text style={styles.footerText}>Need an account?</Text>
          <Link
            href={
              safeReturnToPath
                ? (`/register?returnTo=${encodeURIComponent(
                    safeReturnToPath,
                  )}` as Href)
                : '/register'
            }
            style={styles.footerLink}
          >
            Register
          </Link>
        </View>
      </View>
    </SafeAreaView>
  );
}
