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

      if (fileSizeInMB <= 2) {
        return uri; // If image is already under 2MB, return as is
      }

      // Calculate compression quality based on file size
      // The larger the file, the more we compress
      let quality = Math.min(0.9, 2 / fileSizeInMB);
      
      // Compress and resize the image
      const manipResult = await manipulateAsync(
        uri,
        [{ resize: { width: 800 } }], // Resize to reasonable dimensions
        {
          compress: quality,
          format: SaveFormat.JPEG
        }
      );

      // Verify the new file size
      const compressedInfo = await FileSystem.getInfoAsync(manipResult.uri, { size: true });
      const compressedSize = (compressedInfo as FileSystem.FileInfo).size / (1024 * 1024);
      console.log('Compressed image size:', compressedSize, 'MB');

      return manipResult.uri;
    } catch (error) {
      console.error('Error compressing image:', error);
      throw error;
    }
  }

}

export const uploadService = new UploadService(); 