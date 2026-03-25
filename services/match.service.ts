import api from './api';

export interface Match {
  id: number;
  status: 'active' | 'unmatched';
  conversation_id?: number | null;
  created_at: string;
  unmatched_at?: string | null;
  other_user: {
    id: number;
    first_name: string;
    last_name: string;
    image?: string | null;
  } | null;
}

export const matchService = {
  async getMatches(): Promise<Match[]> {
    const response = await api.get('/matches');
    return response.data.matches ?? [];
  },

  async getMatch(id: number): Promise<Match> {
    const response = await api.get(`/matches/${id}`);
    return response.data.match;
  },

  async unmatch(id: number): Promise<void> {
    await api.delete(`/matches/${id}`);
  },
};
