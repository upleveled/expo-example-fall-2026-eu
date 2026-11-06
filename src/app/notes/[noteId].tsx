import {
  Link,
  router,
  useFocusEffect,
  useLocalSearchParams,
} from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../../constants/theme.ts';
import type { Note } from '../../../migrations/00004-createTableNotes.ts';
import type { NoteResponseBodyGet } from '../api/notes/[noteId]+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 18,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 10,
  },
  textContent: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
  },
  errorTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22,
    lineHeight: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
  },
  backLink: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 20,
    textAlign: 'center',
  },
});

export default function NoteScreen() {
  const { noteId } = useLocalSearchParams<{ noteId?: string }>();
  const [note, setNote] = useState<Note | undefined>();
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  useFocusEffect(
    useCallback(() => {
      async function loadNote() {
        if (!noteId) return;

        const response = await fetch(`/api/notes/${noteId}`);
        const body: NoteResponseBodyGet = await response.json();

        if (response.status === 401) {
          router.replace(`/login?returnTo=/notes/${noteId}`);
          return;
        }

        if ('error' in body) {
          setErrorMessage(body.error);
          setNote(undefined);
          return;
        }

        setNote(body.note);
        setErrorMessage(undefined);
      }

      loadNote().catch((error) => {
        console.error(error);
        setErrorMessage('Loading note failed');
      });
    }, [noteId]),
  );

  if (errorMessage) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTitle}>Error loading note</Text>
        <Text style={styles.errorText}>{errorMessage}</Text>
        <Link href="/(tabs)/notes" style={styles.backLink}>
          Back to notes
        </Link>
      </View>
    );
  }

  if (!note) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Loading note...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>{note.title}</Text>
        <Text style={styles.textContent}>{note.textContent}</Text>
      </View>
    </View>
  );
}
