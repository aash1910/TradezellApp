import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

class UploadService {
  async compressImage(uri: string): Promise<string> {
    try {
      if (Platform.OS === 'web') {
        try {
          const manipResult = await manipulateAsync(
            uri,
            [{ resize: { width: 800 } }],
            { compress: 0.8, format: SaveFormat.JPEG }
          );
          return manipResult.uri;
        } catch (e) {
          console.warn('compressImage web: manipulateAsync failed, using original URI', e);
          return uri;
        }
      }

      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });

      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const fileSizeInMB = (fileInfo as FileSystem.FileInfo).size / (1024 * 1024);
      console.log('Original image size:', fileSizeInMB, 'MB');

      const MAX_SIZE_MB = 0.5;
      let quality = 0.8;

      if (fileSizeInMB > MAX_SIZE_MB) {
        quality = Math.max(0.3, Math.min(0.7, MAX_SIZE_MB / fileSizeInMB));
      }

      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        {
          compress: quality,
          format: SaveFormat.JPEG,
        }
      );

      let finalUri = manipResult.uri;
      let attempts = 0;
      const maxAttempts = 3;
      let currentQuality = quality;

      while (attempts < maxAttempts) {
        const compressedInfo = await FileSystem.getInfoAsync(finalUri, { size: true });
        const compressedSize = (compressedInfo as FileSystem.FileInfo).size / (1024 * 1024);
        console.log('Compressed image size (attempt ' + (attempts + 1) + '):', compressedSize, 'MB');

        if (compressedSize <= MAX_SIZE_MB) {
          return finalUri;
        }

        currentQuality = Math.max(0.3, currentQuality * 0.7);
        const recompressed = await manipulateAsync(
          finalUri,
          [{ resize: { width: 800 } }],
          {
            compress: currentQuality,
            format: SaveFormat.JPEG,
          }
        );
        finalUri = recompressed.uri;
        attempts++;
      }

      const finalInfo = await FileSystem.getInfoAsync(finalUri, { size: true });
      const finalSize = (finalInfo as FileSystem.FileInfo).size / (1024 * 1024);
      console.log('Final compressed image size:', finalSize, 'MB');

      return finalUri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

  /** Compress then encode as a JPEG data URL for JSON listing uploads. */
  async compressImageUriToDataUrl(uri: string): Promise<string> {
    const compressedUri = await this.compressImage(uri);

    if (compressedUri.startsWith('data:image')) {
      return compressedUri;
    }

    const base64 = await FileSystem.readAsStringAsync(compressedUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:image/jpeg;base64,${base64}`;
  }

  async compressImagesToDataUrls(uris: string[]): Promise<string[]> {
    return Promise.all(uris.map((uri) => this.compressImageUriToDataUrl(uri)));
  }
}

export const uploadService = new UploadService();
