import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts } from '../../constants/theme.ts';
import type { NotesResponseBodyPost } from '../api/notes/index+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  form: {
    backgroundColor: colors.cardBackground,
    borderRadius: 14,
    padding: 14,
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
    fontFamily: fonts.body,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingTop: 11,
    paddingBottom: 10,
    marginBottom: 12,
  },
  textArea: {
    minHeight: 140,
    textAlignVertical: 'top',
  },
  button: {
    marginTop: 14,
    backgroundColor: colors.text,
    borderRadius: 10,
    paddingTop: 12,
    paddingBottom: 11,
  },
  buttonText: {
    color: colors.background,
    fontFamily: fonts.heading,
    fontSize: 16,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default function NewNoteScreen() {
  const [title, setTitle] = useState('');
  const [textContent, setTextContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function getUser() {
        const response = await fetch('/api/user');

        if (response.status === 401) {
          router.replace('/login?returnTo=/notes/newNote');
        }
      }

      getUser().catch((error) => {
        console.error(error);
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput value={title} onChangeText={setTitle} style={styles.input} />
        <Text style={styles.label}>Text</Text>
        <TextInput
          multiline
          value={textContent}
          onChangeText={setTextContent}
          style={[styles.input, styles.textArea]}
        />
        <Pressable
          style={({ pressed }) => [
            styles.button,
            { opacity: pressed ? 0.7 : 1 },
          ]}
          onPress={async () => {
            const response = await fetch('/api/notes', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                note: { title, textContent },
              }),
            });

            const body: NotesResponseBodyPost = await response.json();

            if ('error' in body) {
              if (response.status === 401) {
                router.replace('/login?returnTo=/notes/newNote');
                return;
              }

              Alert.alert('Create note failed', body.error);
              return;
            }

            setTitle('');
            setTextContent('');
            router.replace('/(tabs)/notes');
          }}
        >
          <Text style={styles.buttonText}>Add Note</Text>
        </Pressable>
      </View>
    </View>
  );
}
