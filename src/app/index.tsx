import { Link, useLoaderData } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { colors, fonts } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 24,
  },
  introText: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 8,
  },
  link: {
    marginVertical: 6,
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 15,
    backgroundColor: colors.cardBackground,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    lineHeight: 20,
  },
  usersHeading: {
    marginTop: 28,
    color: colors.text,
    fontFamily: fonts.heading,
    fontSize: 22,
  },
  list: {
    width: '100%',
    marginTop: 12,
  },
  item: {
    marginVertical: 4,
    paddingTop: 11,
    paddingBottom: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 10,
    justifyContent: 'center',
  },
  name: {
    color: colors.text,
    fontFamily: fonts.body,
    fontSize: 16,
    lineHeight: 20,
  },
});

type RandomUserApiResponseBody = {
  results: {
    login: {
      uuid: string;
    };
    name: {
      first: string;
      last: string;
    };
  }[];
};

type User = {
  id: string;
  name: string;
};

export async function loader(): Promise<User[]> {
  const response = await fetch('https://randomuser.me/api/?results=5');

  if (!response.ok) {
    throw new Error(`Random User API returned ${response.status}`);
  }

  const data = (await response.json()) as RandomUserApiResponseBody;
  return data.results.map((result) => {
    return {
      id: result.login.uuid,
      name: `${result.name.first} ${result.name.last}`,
    };
  });
}

export default function HomeScreen() {
  const users = useLoaderData<typeof loader>();

  // // Data fetching with useFocusEffect
  // const [users, setUsers] = useState<User[]>([]);
  // useFocusEffect(
  //   useCallback(() => {
  //     async function fetchUsers() {
  //       const response = await fetch('https://randomuser.me/api/?results=5');
  //       const data = (await response.json()) as RandomUserApiResponseBody;
  //       const newUsers = data.results.map((result) => {
  //         return {
  //           id: result.login.uuid,
  //           name: `${result.name.first} ${result.name.last}`,
  //         };
  //       });
  //       setUsers(newUsers);
  //     }
  //     fetchUsers().catch((error) => console.error(error));
  //   }, []),
  // );

  return (
    <View style={styles.container}>
      <Text style={styles.introText}>
        Edit app/index.tsx to edit this screen.
      </Text>

      <Link href="/about" style={styles.link}>
        About
      </Link>

      <Link href="/animals" style={styles.link}>
        Animals
      </Link>
      <Link href="/animals/1" style={styles.link}>
        Animal 1
      </Link>
      <Link href="/animals/2" style={styles.link}>
        Animal 2
      </Link>

      <Text style={styles.usersHeading}>Random Users</Text>

      {/* {
        // Avoid simple mapping to avoid performance issues
        //
        // Instead prefer FlatList or FlashList
        users.map((user) => {
          return (
            <Text key={user.id} style={styles.link}>
              {user.name}
            </Text>
          );
        })
      } */}

      <FlatList
        style={styles.list}
        data={users}
        renderItem={({ item }) => <UserItem name={item.name} />}
      />
    </View>
  );
}

type UserItemProps = { name: string };

function UserItem(props: UserItemProps) {
  return (
    <View style={styles.item}>
      <Text style={styles.name}>{props.name}</Text>
    </View>
  );
}
