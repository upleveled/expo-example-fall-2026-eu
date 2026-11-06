import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts } from '../../constants/theme.ts';
import type { AnimalsResponseBodyPost } from '../api/animals/index+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  contentContainer: {
    flexGrow: 1,
    justifyContent: 'flex-start',
  },
  form: {
    width: '100%',
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
  },
  input: {
    color: colors.text,
    borderColor: 'transparent',
    borderWidth: 0,
    borderRadius: 10,
    backgroundColor: colors.background,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 14,
    marginBottom: 8,
    width: '100%',
  },
  button: {
    backgroundColor: colors.cardBackground,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: '100%',
  },
  text: {
    color: colors.text,
    textAlign: 'center',
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 20,
  },
});

export default function NewAnimalScreen() {
  const [firstName, setFirstName] = useState('Luna');
  const [type, setType] = useState('Cat');
  const [accessory, setAccessory] = useState('Bow tie');
  const [birthDate, setBirthDate] = useState('2022-01-15');

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        if (response.status === 401) {
          router.replace('/login?returnTo=/animals/new');
        }
      }

      getUser().catch((error) => {
        console.error(error);
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.form}>
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              placeholder="First name"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={type}
              onChangeText={setType}
              placeholder="Type"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={accessory}
              onChangeText={setAccessory}
              placeholder="Accessory"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
            <TextInput
              value={birthDate}
              onChangeText={setBirthDate}
              placeholder="Birth date (YYYY-MM-DD)"
              placeholderTextColor={colors.textSecondary}
              style={styles.input}
            />
          </View>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={async () => {
              const response = await fetch('/api/animals', {
                method: 'POST',
                body: JSON.stringify({
                  animal: { firstName, type, accessory, birthDate },
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              });

              if (response.status === 401) {
                router.replace('/login?returnTo=/animals/new');
                return;
              }

              if (!response.ok) {
                const body = (await response.json()) as AnimalsResponseBodyPost;
                Alert.alert(
                  'Error',
                  'error' in body ? body.error : 'Unknown error',
                );
                return;
              }

              router.replace('/(tabs)/animals');
            }}
          >
            <Text style={styles.text}>Create Animal</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
