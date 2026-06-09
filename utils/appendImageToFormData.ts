import { Platform } from 'react-native';

/**
 * Append an image field for multipart upload. React Native uses `{ uri }`;
 * browsers need a `File` built from the picked image URI (often a blob URL).
 */
export async function appendImageToFormData(
  formData: FormData,
  fieldName: string,
  uri: string,
  fileName: string
): Promise<void> {
  if (Platform.OS === 'web') {
    const res = await fetch(uri);
    const blob = await res.blob();
    const mime = blob.type && blob.type.startsWith('image/') ? blob.type : 'image/jpeg';
    const ext = mime.includes('png') ? 'png' : 'jpg';
    const name = /\.(jpe?g|png|webp|gif)$/i.test(fileName)
      ? fileName
      : `${fileName.replace(/\.[^/.]+$/, '')}.${ext}`;
    formData.append(fieldName, new File([blob], name, { type: mime }));
    return;
  }

  formData.append(fieldName, {
    uri,
    type: 'image/jpeg',
    name: fileName,
  } as unknown as Blob);
}
