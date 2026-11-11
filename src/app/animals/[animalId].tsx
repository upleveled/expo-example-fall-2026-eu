import dayjs from 'dayjs';
import { Image } from 'expo-image';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useState } from 'react';
// import icon from '../../../assets/images/icon.png';
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { colors, fonts } from '../../constants/theme.ts';
import type {
  AnimalResponseBodyGet,
  AnimalResponseBodyPut,
} from '../api/animals/[animalId]+api.ts';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  title: {
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 24,
    lineHeight: 30,
    marginBottom: 8,
  },
  text: {
    color: colors.textSecondary,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 12,
    marginTop: 12,
    alignSelf: 'center',
    backgroundColor: colors.cardBackground,
  },
  button: {
    marginTop: 12,
    backgroundColor: colors.cardBackground,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    width: '100%',
  },
  buttonText: {
    fontFamily: fonts.body,
    color: colors.text,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 20,
  },
  input: {
    color: colors.text,
    borderColor: colors.textSecondary,
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: colors.cardBackground,
    fontFamily: fonts.body,
    fontSize: 15,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 14,
    marginTop: 8,
    width: '100%',
  },
});

// const animalImageContext = require.context(
//   '../../../assets/images/animals',
//   false,
//   /\.avif$/,
// );

export default function AnimalScreen() {
  const { animalId } = useLocalSearchParams();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [type, setType] = useState('');
  const [accessory, setAccessory] = useState('');
  const [birthDate, setBirthDate] = useState('');

  useFocusEffect(
    useCallback(() => {
      async function loadAnimal() {
        if (typeof animalId !== 'string') return;

        const response = await fetch(`/api/animals/${animalId}`);
        if (response.status === 401) {
          router.replace(`/login?returnTo=/animals/${animalId}`);
          return;
        }
        if (!response.ok) {
          return;
        }

        const body = (await response.json()) as AnimalResponseBodyGet;
        if ('error' in body) {
          return;
        }

        setFirstName(body.animal.firstName);
        setType(body.animal.type);
        setAccessory(body.animal.accessory ?? '');
        setBirthDate(dayjs(body.animal.birthDate).format('YYYY-MM-DD'));
      }

      loadAnimal().catch((error) => {
        console.error(error);
      });
    }, [animalId]),
  );

  if (typeof animalId !== 'string') return null;

  return (
    <View style={styles.container}>
      {isEditing ? (
        <>
          <TextInput
            value={firstName}
            onChangeText={setFirstName}
            style={styles.input}
          />
          <TextInput value={type} onChangeText={setType} style={styles.input} />
          <TextInput
            value={accessory}
            onChangeText={setAccessory}
            style={styles.input}
          />
          <TextInput
            value={birthDate}
            onChangeText={setBirthDate}
            style={styles.input}
          />
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={async () => {
              const response = await fetch(`/api/animals/${animalId}`, {
                method: 'PUT',
                body: JSON.stringify({
                  animal: { firstName, type, accessory, birthDate },
                }),
                headers: {
                  'Content-Type': 'application/json',
                },
              });
              if (!response.ok) {
                if (response.status === 401) {
                  router.replace(`/login?returnTo=/animals/${animalId}`);
                  return;
                }

                Alert.alert('Error', 'Cannot update animal');
                return;
              }

              const body = (await response.json()) as AnimalResponseBodyPut;
              if ('error' in body) {
                return;
              }

              setFirstName(body.animal.firstName);
              setType(body.animal.type);
              setAccessory(body.animal.accessory ?? '');
              setBirthDate(dayjs(body.animal.birthDate).format('YYYY-MM-DD'));
              setIsEditing(false);
            }}
          >
            <Text style={styles.buttonText}>Save</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text style={styles.title}>{firstName}</Text>

          {/* Use a static image (import above) */}
          {/* <Image source={icon} style={styles.profileImage} /> */}

          {/* Use a dynamic image (context above) - does not work for user data */}
          {/* <Image
            source={animalImageContext(`./${animalId}.avif`)}
            style={styles.profileImage}
          /> */}

          <Image
            source={`https://res.cloudinary.com/upleveled/image/upload/v1773372865/animals/${animalId}.avif`}
            style={styles.profileImage}
          />

          <Text style={styles.text}>Type: {type}</Text>
          <Text style={styles.text}>Accessory: {accessory}</Text>
          <Text style={styles.text}>
            Birth date: {dayjs(birthDate).format('D MMM YYYY')}
          </Text>
          <Text style={styles.text}>id: {animalId}</Text>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={() => {
              setIsEditing(true);
            }}
          >
            <Text style={styles.buttonText}>Edit</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.button,
              { opacity: pressed ? 0.5 : 1 },
            ]}
            onPress={async () => {
              const response = await fetch(`/api/animals/${animalId}`, {
                method: 'DELETE',
              });
              if (!response.ok) {
                if (response.status === 401) {
                  router.replace(`/login?returnTo=/animals/${animalId}`);
                  return;
                }

                Alert.alert('Error', 'Cannot delete animal');
                return;
              }

              router.replace('/(tabs)/animals');
            }}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}
