import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { Settings } from "lucide-react-native";
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import { Post, User } from '../../types';

export function getDaysActive(user: User | null): number {
  if (!user || !user.createdAt) return 0;

  const created =
    (user.createdAt && typeof (user.createdAt as any).toDate === 'function')
      ? (user.createdAt as any).toDate()
      : new Date(user.createdAt as any);

  const now = new Date();
  const diffMs = now.getTime() - created.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));


  return diffDays < 1 ? 1 : diffDays;
}

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grid' | 'list'>('grid');
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(postsQuery, (snapshot) => {
      const postsData: Post[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          userId: data.userId,
          userName: data.userName,
          userAvatar: data.userAvatar,
          text: data.text,
          imageUrl: data.imageUrl,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });
      setPosts(postsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              router.replace("/Login");
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  const renderGridPost = ({ item }: { item: Post }) => (
    <TouchableOpacity style={styles.gridItem}>
      {item.imageUrl ? (
        <Image source={{ uri: item.imageUrl }} style={styles.gridImage} />
      ) : (
        <View style={styles.textOnlyPost}>
          <Text style={styles.textOnlyContent} numberOfLines={5}>
            {item.text}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderListPost = ({ item }: { item: Post }) => (
    <View style={styles.listPost}>
      {item.text && <Text style={styles.listPostText}>{item.text}</Text>}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.listPostImage} />
      )}
      <Text style={styles.listPostDate}>
        {item.createdAt.toLocaleDateString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <Text style={styles.headerButtonText}><Settings /></Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{user?.displayName?.toLowerCase().replace(/\s/g, '')}</Text>
        <TouchableOpacity style={styles.headerButton}>
          <Text style={styles.headerButtonText}>.</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
            ) : (
              <Text style={styles.avatarText}>
                {user?.displayName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            )}
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{posts.length}</Text>
              <Text style={styles.statLabel}>Posts</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{getDaysActive(user)}</Text>
              <Text style={styles.statLabel}>Days Active</Text>
            </View>
          </View>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.displayName || 'User'}</Text>
          <Text style={styles.profileBio}>
            Digital creator and photographer.{'\n'}
            Exploring the world one frame at a time.
          </Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'grid' && styles.activeTab]}
          onPress={() => setActiveTab('grid')}
        >
          <Text style={styles.tabIcon}>▦</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={styles.tabIcon}>≡</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={posts}
          renderItem={activeTab === 'grid' ? renderGridPost : renderListPost}
          keyExtractor={(item) => item.id}
          numColumns={activeTab === 'grid' ? 3 : 1}
          key={activeTab}
          contentContainerStyle={styles.postsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No posts yet</Text>
              <Text style={styles.emptySubtext}>Share your first moment!</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  headerButton: {
    padding: 8
  },
  headerButtonText: {
    fontSize: 20
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000'
  },
  profileSection: {
    paddingHorizontal: 16,
    paddingVertical: 20
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 30
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '600'
  },
  statsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  stat: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000'
  },
  statLabel: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2
  },
  profileInfo: {
    marginBottom: 16
  },
  profileName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4
  },
  profileBio: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 18
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8
  },
  followButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  messageButton: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center'
  },
  messageButtonText: {
    color: '#000000',
    fontSize: 15,
    fontWeight: '600'
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent'
  },
  activeTab: {
    borderBottomColor: '#000000'
  },
  tabIcon: {
    fontSize: 24,
    color: '#8E8E93'
  },
  postsContainer: {
    paddingTop: 1
  },
  gridItem: {
    width: '33.33%',
    aspectRatio: 1,
    padding: 1
  },
  gridImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7'
  },
  textOnlyPost: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F2F2F7',
    padding: 8,
    justifyContent: 'center'
  },
  textOnlyContent: {
    fontSize: 11,
    color: '#000000'
  },
  listPost: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  listPostText: {
    fontSize: 15,
    color: '#000000',
    marginBottom: 12,
    lineHeight: 20
  },
  listPostImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#F2F2F7'
  },
  listPostDate: {
    fontSize: 13,
    color: '#8E8E93'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8
  },
  emptySubtext: {
    fontSize: 15,
    color: '#8E8E93'
  }
});

export default ProfileScreen;