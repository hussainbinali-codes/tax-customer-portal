"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, RotateCcw, Calendar } from 'lucide-react';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'All',
    dateRange: 'All'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingRefund, setProcessingRefund] = useState({});

  // Demo user data
  const user = {
    id: 1,
    name: "John Doe"
  };

  // Demo permission function
  const can = (permission) => {
    const permissions = {
      'action:payment.refund': true
    };
    return permissions[permission] || false;
  };

  // Demo format functions
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  useEffect(() => {
    loadPayments();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      
      // Demo data for the current user only
      const demoPayments = [
        {
          id: 1,
          transactionId: 'PMT-001',
          customerId: user?.id || 1,
          customerName: user?.name || "John Doe",
          amount: 374.48,
          method: 'Credit Card',
          status: 'Completed',
          description: 'Form 1040 - 2023 Tax Preparation',
          createdAt: '2023-04-15T10:30:00Z',
          updatedAt: '2023-04-15T10:30:00Z'
        },
        {
          id: 2,
          transactionId: 'PMT-002',
          customerId: user?.id || 1,
          customerName: user?.name || "John Doe",
          amount: 855.99,
          method: 'Bank Transfer',
          status: 'Pending',
          description: 'Form 1065 - 2023 Business Tax Preparation',
          createdAt: '2023-04-10T14:45:00Z',
          updatedAt: '2023-04-10T14:45:00Z'
        },
        {
          id: 3,
          transactionId: 'PMT-003',
          customerId: user?.id || 1,
          customerName: user?.name || "John Doe",
          amount: 199.99,
          method: 'PayPal',
          status: 'Refunded',
          description: 'Consultation Service - Refunded',
          createdAt: '2023-03-20T09:15:00Z',
          updatedAt: '2023-03-25T11:20:00Z'
        }
      ];
      
      // Filter payments to only show the current user's payments
      const userPayments = demoPayments.filter(payment => 
        payment.customerId === user?.id
      );
      
      setPayments(userPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...payments];

    if (filters.status !== 'All') {
      filtered = filtered.filter(p => p.status === filters.status);
    }

    if (filters.dateRange !== 'All') {
      const now = new Date();
      const days = parseInt(filters.dateRange);
      const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(p => new Date(p.createdAt) >= cutoff);
    }

    setFilteredPayments(filtered);
  };

  const handleRefund = async (paymentId, payment) => {
    if (!can('action:payment.refund')) {
      alert('You do not have permission to process refunds.');
      return;
    }

    if (!window.confirm(`Are you sure you want to refund ${formatCurrency(payment.amount)} to ${payment.customerName}?`)) {
      return;
    }

    try {
      setProcessingRefund({ ...processingRefund, [paymentId]: true });
      
      // Update the demo payment status
      const updatedPayments = payments.map(p => 
        p.id === paymentId ? {...p, status: 'Refunded'} : p
      );
      
      setPayments(updatedPayments);

      // Demo activity logging
      console.log(`Processed refund for ${payment.customerName} - ${formatCurrency(payment.amount)}`);

      // Demo notification
      console.log(`Notification: ${formatCurrency(payment.amount)} refunded to ${payment.customerName}`);

    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setProcessingRefund({ ...processingRefund, [paymentId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'Refunded': return 'bg-red-100 text-red-800';
      case 'Failed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotals = () => {
    const total = filteredPayments.reduce((sum, p) => sum + (p.status === 'Refunded' ? 0 : p.amount), 0);
    const refunded = filteredPayments.filter(p => p.status === 'Refunded').reduce((sum, p) => sum + p.amount, 0);
    return { total, refunded, count: filteredPayments.length };
  };

  const totals = calculateTotals();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CreditCard className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Received</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.total)}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            From {filteredPayments.filter(p => p.status !== 'Refunded').length} successful payments
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <RotateCcw className="w-8 h-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Refunded</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(totals.refunded)}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {filteredPayments.filter(p => p.status === 'Refunded').length} refunded transactions
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Transactions</p>
              <p className="text-2xl font-bold text-gray-900">{totals.count}</p>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            Across all payment methods
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <Filter className="w-5 h-5 text-gray-400" />
          
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Refunded">Refunded</option>
            <option value="Failed">Failed</option>
          </select>

          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="All">All Time</option>
            <option value="7">Last 7 Days</option>
            <option value="30">Last 30 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-visible">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="w-16 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900 truncate">{payment.transactionId}</div>
                    <div className="text-xs text-gray-500 truncate">ID: {payment.id}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate">{payment.customerName}</div>
                    <div className="text-xs text-gray-500 truncate">ID: {payment.customerId}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 truncate">{payment.method}</div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500 truncate">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-3 py-4">
                    <div className="text-sm text-gray-900 truncate">
                      {payment.description}
                    </div>
                  </td>
                  <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                    {can('action:payment.refund') && payment.status === 'Completed' && (
                      <button
                        onClick={() => handleRefund(payment.id, payment)}
                        disabled={processingRefund[payment.id]}
                        className="text-red-600 hover:text-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Process Refund"
                      >
                        <RotateCcw className={`w-4 h-4 ${processingRefund[payment.id] ? 'animate-spin' : ''}`} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredPayments.length === 0 && (
          <div className="text-center py-12">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No payments match the current filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}