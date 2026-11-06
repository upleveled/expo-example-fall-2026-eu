import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Animal } from '../../../migrations/00000-createTableAnimals.ts';
import { colors, fonts } from '../../constants/theme.ts';
import type { AnimalsResponseBodyGet } from '../api/animals/index+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  content: {
    flex: 1,
  },
  input: {
    borderColor: colors.textSecondary,
    borderWidth: 1,
    borderRadius: 10,
    color: colors.text,
    marginTop: 8,
    marginBottom: 12,
    backgroundColor: colors.cardBackground,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 14,
  },
  item: {
    marginVertical: 4,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
  },
  itemTitle: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 18,
    lineHeight: 22,
  },
  itemText: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
  },
});

export default function SearchScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);
  const [search, setSearch] = useState('');
  const router = useRouter();

  const filteredAnimals = useMemo(() => {
    const lowerSearch = search.toLowerCase();

    return animals.filter((animal) => {
      return (
        animal.firstName.toLowerCase().includes(lowerSearch) ||
        animal.type.toLowerCase().includes(lowerSearch) ||
        (animal.accessory !== null &&
          animal.accessory.toLowerCase().includes(lowerSearch))
      );
    });
  }, [animals, search]);

  useFocusEffect(
    useCallback(() => {
      async function getAnimals() {
        const response = await fetch('/api/animals');
        if (response.status === 401) {
          setAnimals([]);
          router.replace('/login?returnTo=/(tabs)/search');
          return;
        }

        if (!response.ok) {
          setAnimals([]);
          return;
        }

        const body = (await response.json()) as AnimalsResponseBodyGet;
        if ('error' in body) {
          throw new Error(body.error);
        }
        setAnimals(body.animals);
      }

      getAnimals().catch((error) => {
        console.error(error);
      });
    }, [router]),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <TextInput
          style={styles.input}
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, type or accessory"
          placeholderTextColor={colors.textSecondary}
        />
        <FlatList
          data={filteredAnimals}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              style={styles.item}
              onPress={() => {
                router.push(`/animals/${item.id}`);
              }}
            >
              <Text style={styles.itemTitle}>{item.firstName}</Text>
              <Text style={styles.itemText}>
                {item.type} · {item.accessory}
              </Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
