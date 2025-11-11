import axios from 'axios';

export const uploadToCloudinary = async (uri: string): Promise<string> => {
  const data = new FormData();
  data.append('file', {
    uri,
    type: 'image/jpeg',
    name: `post_${Date.now()}.jpg`
  } as any);
  data.append('upload_preset', 'framez'); 
  data.append('cloud_name', 'dhisc2ou2');

  const response = await axios.post(
    'https://api.cloudinary.com/v1_1/dhisc2ou2/image/upload',
    data,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  );

  return response.data.secure_url; // This is the URL to save in Firestore
};
