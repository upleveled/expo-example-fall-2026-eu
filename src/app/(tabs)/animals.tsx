import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { Animal } from '../../../migrations/00000-createTableAnimals.ts';
import AnimalItem from '../../components/AnimalItem.tsx';
import { colors } from '../../constants/theme.ts';
import type { AnimalsResponseBodyGet } from '../api/animals/index+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  list: {
    marginTop: 12,
  },
  content: {
    flex: 1,
  },
});

export default function AnimalsScreen() {
  const [animals, setAnimals] = useState<Animal[]>([]);

  function handleAnimalDelete(animalId: number) {
    setAnimals((currentAnimals) => {
      return currentAnimals.filter((animal) => animal.id !== animalId);
    });
  }

  const renderItem = (item: { item: Animal }) => (
    <AnimalItem animal={item.item} onDelete={handleAnimalDelete} />
  );

  useFocusEffect(
    useCallback(() => {
      async function getAnimals() {
        const response = await fetch('/api/animals');

        if (response.status === 401) {
          router.replace('/login?returnTo=/(tabs)/animals');
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
    }, []),
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <FlatList
          style={styles.list}
          data={animals}
          renderItem={renderItem}
          keyExtractor={(item: Animal) => String(item.id)}
        />
      </View>
    </SafeAreaView>
  );
}
