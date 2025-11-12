import { useRouter } from 'expo-router';
import { collection, onSnapshot, orderBy, query, QueryDocumentSnapshot, where } from 'firebase/firestore';
import { Heart, Settings } from "lucide-react-native";
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
  const [likedPosts, setLikedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'grid' | 'list' | 'liked'>('grid');
  const router = useRouter();

  useEffect(() => {
    if (!user) return;

    // Query for user's own posts
    const postsQuery = query(
      collection(db, 'posts'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribePosts = onSnapshot(postsQuery, (snapshot) => {
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
          updatedAt: data.updatedAt?.toDate() || new Date(),
          likes: data.likes || [],
          likeCount: data.likes?.length || 0
        });
      });
      setPosts(postsData);
      setLoading(false);
    });

    // Query for liked posts
    const likedPostsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeLiked = onSnapshot(likedPostsQuery, (snapshot) => {
      const likedPostsData: Post[] = [];
      snapshot.forEach((doc: QueryDocumentSnapshot) => {
        const data = doc.data();
        // Filter posts that the current user has liked
        if (data.likes && data.likes.includes(user.uid)) {
          likedPostsData.push({
            id: doc.id,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            text: data.text,
            imageUrl: data.imageUrl,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            likes: data.likes || [],
            likeCount: data.likes?.length || 0
          });
        }
      });
      setLikedPosts(likedPostsData);
    });

    return () => {
      unsubscribePosts();
      unsubscribeLiked();
    };
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
              router.replace({ pathname: "/Login", params: { fromLogout: "true" } });
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
      <View style={styles.listPostHeader}>
        <View style={styles.userInfo}>
          <View style={styles.smallAvatar}>
            {item.userAvatar ? (
              <Image source={{ uri: item.userAvatar }} style={styles.smallAvatarImage} />
            ) : (
              <Text style={styles.smallAvatarText}>
                {item.userName.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>
          <Text style={styles.listPostUserName}>{item.userName}</Text>
        </View>
      </View>
      {item.text && <Text style={styles.listPostText}>{item.text}</Text>}
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.listPostImage} />
      )}
      <View style={styles.listPostFooter}>
        <View style={styles.likeInfo}>
          <Heart size={16} color="#FF3B30" fill="#FF3B30" />
          <Text style={styles.listPostLikes}>{item.likeCount || 0}</Text>
        </View>
        <Text style={styles.listPostDate}>
          {item.createdAt.toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const getCurrentData = () => {
    if (activeTab === 'liked') {
      return likedPosts;
    }
    return posts;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleLogout} style={styles.headerButton}>
          <Settings size={24} color="#000000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>@{user?.displayName?.toLowerCase().replace(/\s/g, '')}</Text>
        <View style={styles.headerButton} />
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
              <Text style={styles.statNumber}>{likedPosts.length}</Text>
              <Text style={styles.statLabel}>Liked</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{getDaysActive(user)}</Text>
              <Text style={styles.statLabel}>{getDaysActive(user) > 1 ?  "Days" : "Day"}</Text>
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
          <Text style={[styles.tabIcon, activeTab === 'grid' && styles.activeTabIcon]}>▦</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'list' && styles.activeTab]}
          onPress={() => setActiveTab('list')}
        >
          <Text style={[styles.tabIcon, activeTab === 'list' && styles.activeTabIcon]}>≡</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
          onPress={() => setActiveTab('liked')}
        >
          <Heart 
            size={20} 
            color={activeTab === 'liked' ? '#000000' : '#8E8E93'}
            fill="none"
          />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      ) : (
        <FlatList
          data={getCurrentData()}
          renderItem={activeTab === 'grid' ? renderGridPost : renderListPost}
          keyExtractor={(item) => item.id}
          numColumns={activeTab === 'grid' ? 3 : 1}
          key={activeTab}
          contentContainerStyle={styles.postsContainer}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {activeTab === 'liked' ? 'No liked posts' : 'No posts yet'}
              </Text>
              <Text style={styles.emptySubtext}>
                {activeTab === 'liked' 
                  ? 'Posts you like will appear here' 
                  : 'Share your first moment!'}
              </Text>
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
    padding: 8,
    width: 40
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
  activeTabIcon: {
    color: '#000000'
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
  listPostHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  smallAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8
  },
  smallAvatarImage: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  smallAvatarText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600'
  },
  listPostUserName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000'
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
  listPostFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  likeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4
  },
  listPostLikes: {
    fontSize: 13,
    color: '#000000',
    fontWeight: '500'
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