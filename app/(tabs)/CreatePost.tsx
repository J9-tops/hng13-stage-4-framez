import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { db, storage } from '../../lib/firebase';
import { MainTabParamList } from '../../types';

type CreatePostScreenNavigationProp = BottomTabNavigationProp<MainTabParamList, 'CreatePost'>;

interface Props {
  navigation: CreatePostScreenNavigationProp;
}

const CreatePostScreen: React.FC<Props> = ({ navigation }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to upload photos');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string): Promise<string> => {
    const response = await fetch(uri);
    const blob = await response.blob();
    
    const filename = `posts/${user?.uid}_${Date.now()}.jpg`;
    const storageRef = ref(storage, filename);
    
    const uploadTask = uploadBytesResumable(storageRef, blob);
    
    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        null,
        (error) => reject(error),
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  };

  const handlePost = async () => {
    if (!text.trim() && !image) {
      Alert.alert('Error', 'Please add some text or an image');
      return;
    }

    setUploading(true);
    try {
      let imageUrl = '';
      
      if (image) {
        imageUrl = await uploadImage(image);
      }

      await addDoc(collection(db, 'posts'), {
        userId: user?.uid,
        userName: user?.displayName || 'Anonymous',
        userAvatar: user?.photoURL || null,
        text: text.trim(),
        imageUrl,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setText('');
      setImage(null);
      Alert.alert('Success', 'Post created successfully!');
      navigation.navigate('Home');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelButton}
          >
            <Text style={styles.cancelText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Post</Text>
          <TouchableOpacity
            onPress={handlePost}
            disabled={uploading || (!text.trim() && !image)}
            style={[
              styles.postButton,
              (uploading || (!text.trim() && !image)) && styles.postButtonDisabled
            ]}
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <View style={styles.userSection}>
            <View style={styles.avatar}>
              {user?.photoURL ? (
                <Image source={{ uri: user.photoURL }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0).toUpperCase() || 'U'}
                </Text>
              )}
            </View>
            <Text style={styles.userName}>{user?.displayName || 'User'}</Text>
          </View>

          <TextInput
            style={styles.textInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#C7C7CD"
            multiline
            value={text}
            onChangeText={setText}
            maxLength={280}
            autoFocus
          />

          {image && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image }} style={styles.selectedImage} />
              <TouchableOpacity
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Text style={styles.removeImageText}>✕</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
              <Text style={styles.imageButtonIcon}>🖼️</Text>
              <Text style={styles.imageButtonText}>Add Photo</Text>
            </TouchableOpacity>
            <Text style={styles.characterCount}>{text.length}/280</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  keyboardView: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7'
  },
  cancelButton: {
    padding: 8
  },
  cancelText: {
    fontSize: 24,
    color: '#000000'
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000000'
  },
  postButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20
  },
  postButtonDisabled: {
    opacity: 0.5
  },
  postButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600'
  },
  content: {
    flex: 1,
    padding: 16
  },
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600'
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000'
  },
  textInput: {
    fontSize: 16,
    color: '#000000',
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 20
  },
  selectedImage: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#F2F2F7'
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  removeImageText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold'
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#F2F2F7',
    borderRadius: 12
  },
  imageButtonIcon: {
    fontSize: 20,
    marginRight: 8
  },
  imageButtonText: {
    fontSize: 15,
    color: '#007AFF',
    fontWeight: '600'
  },
  characterCount: {
    fontSize: 13,
    color: '#8E8E93'
  }
});

export default CreatePostScreen;