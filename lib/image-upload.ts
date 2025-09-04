import { supabase } from './supabase';
import * as ImagePicker from 'expo-image-picker';

export const pickAndUploadImage = async (folder: string = 'general'): Promise<string | null> => {
  try {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Permission denied');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
    });

    if (result.canceled) {
      return null;
    }

    const image = result.assets[0];
    const fileName = `${folder}/${Date.now()}.jpg`;

    // Create FormData
    const formData = new FormData();
    formData.append('file', {
      uri: image.uri,
      type: 'image/jpeg',
      name: fileName,
    } as any);

    // Upload using fetch to Supabase storage API
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error('Not authenticated');

    const response = await fetch(
      `${supabase.supabaseUrl}/storage/v1/object/content-images/${fileName}`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Upload failed: ${error}`);
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('content-images')
      .getPublicUrl(fileName);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};