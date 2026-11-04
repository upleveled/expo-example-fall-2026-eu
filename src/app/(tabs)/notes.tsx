import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import NoteItem from '../../components/NoteItem.tsx';
import { colors, fonts } from '../../constants/theme.ts';
import type { Note } from '../../../migrations/00004-createTableNotes.ts';
import type { NotesResponseBodyGet } from '../api/notes/index+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  helperText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  emptyState: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    marginTop: 12,
  },
});

export default function NotesScreen() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [errorMessage, setErrorMessage] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function loadNotes() {
        const response = await fetch('/api/notes');

        if (response.status === 401) {
          router.replace('/login?returnTo=/(tabs)/notes');
          return;
        }

        const body: NotesResponseBodyGet = await response.json();

        if ('error' in body) {
          setErrorMessage(body.error);
          return;
        }

        setErrorMessage('');
        setNotes(body.notes);
      }

      loadNotes().catch((error) => {
        console.error(error);
        setErrorMessage('Loading notes failed');
      });
    }, []),
  );

  return (
    <View style={styles.container}>
      <Text style={styles.helperText}>
        Private notes are visible only to the logged-in user who created them.
      </Text>
      {errorMessage ? (
        <Text style={styles.emptyState}>{errorMessage}</Text>
      ) : notes.length > 0 ? (
        <FlatList
          data={notes}
          renderItem={({ item }) => <NoteItem note={item} />}
          keyExtractor={(item) => String(item.id)}
        />
      ) : (
        <Text style={styles.emptyState}>No notes yet.</Text>
      )}
    </View>
  );
}
