import { useState, useEffect } from 'react';
import { getMockOrders } from '@/lib/mock-api/orders';
import type { Order } from '@/lib/schema';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      console.log('Loading orders...');
      const result = await getMockOrders();
      console.log('Loaded orders:', result);
      setOrders(result);
    } catch (error) {
      console.error('Failed to load orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const refresh = () => {
    loadOrders();
  };

  return { orders, loading, refresh };
} 