import api from './api';

export interface Package {
  id: number | null;
  info: string;
  weight: string | number;
  price: string;
  status: string;
  payment_status: string;
  sender: {
    id: number;
    image: string;
  };
  pickup: {
    name: string;
    mobile: string;
    address: string;
    address2: string | null;
    address3: string | null;
    details: string | null;
    date: string;
    time: string;
    image: string | null;
    coordinates: {
      lat: string;
      lng: string;
      lat2: string | null;
      lng2: string | null;
      lat3: string | null;
      lng3: string | null;
    };
  };
  drop: {
    name: string;
    mobile: string;
    address: string;
    address2: string | null;
    address3: string | null;
    details: string | null;
    coordinates: {
      lat: string | null;
      lng: string | null;
      lat2: string | null;
      lng2: string | null;
      lat3: string | null;
      lng3: string | null;
    };
  };
  order: {
    id?: number;
    status: string;
    delivery_status?: number;
    dropper?: {
      id: number;
      name: string;
      image: string;
      mobile: string;
    };
    review_submitted?: boolean;
    review_submitted_rider?: boolean;
    created_at?: string;
    updated_at?: string;
  };
  created_at: string;
  updated_at: string;
}

interface PackageListResponse {
  data: Package[];
  status: string;
}

class PackageListService {
  async getMyPackages() {
    try {
      const response = await api.get<PackageListResponse>('/packages/my-packages');
      return response.data?.data as Package[];
    } catch (error) {
      throw error;
    }
  }
}

export const packageListService = new PackageListService(); 