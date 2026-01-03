import * as FileSystem from "expo-file-system/legacy";
import { manipulateAsync, SaveFormat } from "expo-image-manipulator";

class UploadService {

  async compressImage(uri: string): Promise<string> {
    try {
      // Get file info
      const fileInfo = await FileSystem.getInfoAsync(uri, { size: true });
      
      if (!fileInfo.exists) {
        throw new Error("File does not exist");
      }

      // Convert size to MB
      const fileSizeInMB = (fileInfo as FileSystem.FileInfo).size / (1024 * 1024);
      console.log('Original image size:', fileSizeInMB, 'MB');

      // Set maximum size to 0.5MB for safety buffer (server accepts up to 2MB)
      const MAX_SIZE_MB = 0.5;
      
      // Always compress images for optimization, even if under threshold
      let quality = 0.8; // Default quality for images under threshold
      
      // For larger files, calculate more aggressive compression
      if (fileSizeInMB > MAX_SIZE_MB) {
        quality = Math.max(0.3, Math.min(0.7, MAX_SIZE_MB / fileSizeInMB));
      }
      
      // Compress and resize the image
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to reasonable dimensions
        {
          compress: quality,
          format: SaveFormat.JPEG
        }
      );

      // Verify the compressed size and compress again if still too large
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
        
        // If still too large, compress more aggressively
        currentQuality = Math.max(0.3, currentQuality * 0.7);
        const recompressed = await manipulateAsync(
          finalUri,
          [{ resize: { width: 800 } }],
          {
            compress: currentQuality,
            format: SaveFormat.JPEG
          }
        );
        finalUri = recompressed.uri;
        attempts++;
      }

      // Return the best result even if we couldn't get it under threshold
      const finalInfo = await FileSystem.getInfoAsync(finalUri, { size: true });
      const finalSize = (finalInfo as FileSystem.FileInfo).size / (1024 * 1024);
      console.log('Final compressed image size:', finalSize, 'MB');
      
      return finalUri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

}

export const uploadService = new UploadService(); 