import api from './api';

export interface Listing {
  id: number;
  user_id: number;
  type: 'trade' | 'sell' | 'both';
  title: string;
  description?: string;
  condition?: string;
  category?: string;
  price?: number | null;
  currency: string;
  images: string[];
  status: 'active' | 'paused' | 'sold' | 'traded';
  lat?: number;
  lng?: number;
  created_at: string;
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    image?: string;
  };
}

export interface SwipeResult {
  status: string;
  matched: boolean;
  match?: {
    id: number;
    status: string;
    other_user?: {
      id: number;
      first_name: string;
      last_name: string;
      image?: string;
    };
  };
}

export interface FeedParams {
  lat?: number;
  lng?: number;
  radius_km?: number;
  type?: string;
  category?: string;
  condition?: string;
  page?: number;
}

export const listingService = {
  async getFeed(params: FeedParams = {}): Promise<{ listings: Listing[]; hasMore: boolean }> {
    const response = await api.get('/listings/feed', { params });
    const data = response.data.listings;
    const items: Listing[] = data.data ?? data;
    const hasMore = data.next_page_url != null;
    return { listings: items, hasMore };
  },

  async getMyListings(): Promise<Listing[]> {
    const response = await api.get('/listings/my');
    return response.data.listings ?? [];
  },

  async getListing(id: number): Promise<Listing> {
    const response = await api.get(`/listings/${id}`);
    return response.data.listing;
  },

  async createListing(data: Partial<Listing> & { images?: string[] }): Promise<Listing> {
    const response = await api.post('/listings', data);
    return response.data.listing;
  },

  async updateListing(id: number, data: Partial<Listing>): Promise<Listing> {
    const response = await api.put(`/listings/${id}`, data);
    return response.data.listing;
  },

  async updateStatus(id: number, status: string): Promise<void> {
    await api.patch(`/listings/${id}/status`, { status });
  },

  async deleteListing(id: number): Promise<void> {
    await api.delete(`/listings/${id}`);
  },

  async swipe(listingId: number, direction: 'yes' | 'no'): Promise<SwipeResult> {
    const response = await api.post(`/listings/${listingId}/swipe`, { direction });
    return response.data;
  },
};
