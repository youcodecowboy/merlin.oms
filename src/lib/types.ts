export type RequestStep = {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed';
  requiresScan?: boolean;
  scanTarget?: string;
};

export type WashRequest = {
  id: string;
  orderId: string;
  sku: string;
  itemId: string;
  assignedTo?: string;
  createdAt: Date;
  dueDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  steps: RequestStep[];
}; 