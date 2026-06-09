import * as FileSystem from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

const MAX_IMAGE_BYTES = 512 * 1024;

function dataUrlByteSize(dataUrl: string): number {
  const base64 = dataUrl.split(',')[1] ?? '';
  return Math.ceil((base64.length * 3) / 4);
}

async function webUriToDataUrl(uri: string, maxWidth = 800): Promise<string> {
  if (uri.startsWith('data:image')) {
    return uri;
  }

  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Failed to read image: ${response.status}`);
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = objectUrl;
    });

    const scale = image.width > maxWidth ? maxWidth / image.width : 1;
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas is not available');
    }

    context.drawImage(image, 0, 0, width, height);

    let quality = 0.8;
    let dataUrl = canvas.toDataURL('image/jpeg', quality);

    while (dataUrlByteSize(dataUrl) > MAX_IMAGE_BYTES && quality > 0.3) {
      quality = Math.max(0.3, quality * 0.7);
      dataUrl = canvas.toDataURL('image/jpeg', quality);
    }

    return dataUrl;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

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
    if (Platform.OS === 'web') {
      try {
        const compressedUri = await this.compressImage(uri);
        if (compressedUri.startsWith('data:image')) {
          return compressedUri;
        }
        return webUriToDataUrl(compressedUri);
      } catch (error) {
        console.warn('compressImageUriToDataUrl web fallback:', error);
        return webUriToDataUrl(uri);
      }
    }

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
