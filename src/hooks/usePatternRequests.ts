import { useState, useEffect } from 'react';
import { getMockRequests } from '@/lib/mock-api';
import type { Request } from '@/lib/schema';

export function usePatternRequests() {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRequests() {
      try {
        setLoading(true);
        const result = await getMockRequests({
          page: 1,
          pageSize: 100,
          sortBy: 'created_at',
          sortOrder: 'desc'
        });
        setRequests(result.items.filter(item => item.request_type === 'PATTERN_REQUEST'));
      } catch (error) {
        console.error('Failed to fetch pattern requests:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, loading };
} 