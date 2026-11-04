import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '../constants/theme.ts';
import type { Note } from '../../migrations/00004-createTableNotes.ts';

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 17,
    lineHeight: 22,
    marginBottom: 4,
  },
  textContent: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});

type Props = {
  note: Note;
};

export default function NoteItem(props: Props) {
  return (
    <Link href={`/notes/${props.note.id}`} asChild>
      <Pressable>
        <View style={styles.card}>
          <Text style={styles.title} numberOfLines={1}>
            {props.note.title}
          </Text>
          <Text style={styles.textContent} numberOfLines={2}>
            {props.note.textContent}
          </Text>
        </View>
      </Pressable>
    </Link>
  );
}
