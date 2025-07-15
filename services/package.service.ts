import api from './api';

interface PackageCreateRequest {
  pickup_name: string;
  pickup_mobile: string;
  pickup_address: string;
  pickup_details?: string;
  weight: number;
  price: number;
  pickup_date: string;
  pickup_time: string;
  drop_name: string;
  drop_mobile: string;
  drop_address: string;
  drop_details?: string;
  pickup_lat?: number;
  pickup_lng?: number;
  drop_lat?: number;
  drop_lng?: number;
}

class PackageService {
  async createPackage(data: PackageCreateRequest) {
    try {
      const response = await api.post('/packages', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async updatePackage(id: number, data: PackageCreateRequest) {
    try {
      const response = await api.put(`/packages/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async cancelPackage(id: string | number) {
    try {
      const response = await api.patch(`/packages/${id}/cancel`);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to cancel package');
    }
  }

  async uploadPickupImage(packageId: number, imageUri: string) {
    try {
      const formData = new FormData();
      formData.append('package_id', packageId.toString());
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: `pickup_${Date.now()}.jpg`
      } as any);
      const response = await api.post('/packages/upload-pickup-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to upload pickup image');
    }
  }
}

export const packageService = new PackageService(); 