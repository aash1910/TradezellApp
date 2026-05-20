import { API_ORIGIN } from '@/services/api';

export function resolveListingImageUri(value: string, baseUrl: string = API_ORIGIN): string {
  if (
    value.startsWith('data:') ||
    value.startsWith('http://') ||
    value.startsWith('https://')
  ) {
    return value;
  }

  return `${baseUrl.replace(/\/$/, '')}/${value.replace(/^\//, '')}`;
}
