import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Animal } from '../../migrations/00000-createTableAnimals.ts';
import { colors, fonts } from '../constants/theme.ts';

const styles = StyleSheet.create({
  card: {
    marginVertical: 4,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  info: {
    flex: 1,
    marginRight: 10,
  },
  name: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  details: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 2,
  },
  deleteButton: {
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  deleteButtonText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 16,
  },
});

type Props = {
  animal: Animal;
  onDelete: (animalId: number) => void;
};

export default function AnimalItem(props: Props) {
  const router = useRouter();

  return (
    <Pressable
      style={styles.card}
      onPress={() => {
        router.push(`/animals/${props.animal.id}`);
      }}
    >
      <View style={styles.info}>
        <Text style={styles.name}>{props.animal.firstName}</Text>
        <Text style={styles.details}>
          {props.animal.type} · {props.animal.accessory}
        </Text>
      </View>
      <Pressable
        style={styles.deleteButton}
        onPress={async () => {
          const response = await fetch(`/api/animals/${props.animal.id}`, {
            method: 'DELETE',
          });

          if (response.status === 401) {
            router.replace(`/login?returnTo=/animals/${props.animal.id}`);
            return;
          }

          if (!response.ok) {
            return;
          }

          props.onDelete(props.animal.id);
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </Pressable>
    </Pressable>
  );
}
