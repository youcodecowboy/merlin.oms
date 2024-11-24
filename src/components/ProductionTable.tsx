import React, { useState } from 'react';
import { OrdersTable } from './orders/OrdersTable';
import { PatternRequestsTable } from './patterns/PatternRequestsTable';
import { useOrders } from '@/hooks/useOrders';
import { usePatternRequests } from '@/hooks/usePatternRequests';

const ProductionTable = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const { orders, loading: ordersLoading } = useOrders();
  const { requests, loading: requestsLoading } = usePatternRequests();

  const renderContent = () => {
    switch (activeTab) {
      case 'pending':
        return ordersLoading ? (
          <div>Loading orders...</div>
        ) : (
          <OrdersTable orders={orders} />
        );
      case 'pattern':
        return requestsLoading ? (
          <div>Loading requests...</div>
        ) : (
          <PatternRequestsTable requests={requests} />
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          Pending Requests
        </button>
        <button
          className={`tab ${activeTab === 'pattern' ? 'active' : ''}`}
          onClick={() => setActiveTab('pattern')}
        >
          Pattern Requests
        </button>
      </div>
      <div className="tab-content">
        {renderContent()}
      </div>
    </div>
  );
};

export default ProductionTable; 