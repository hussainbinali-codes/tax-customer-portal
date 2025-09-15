"use client";

import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, RotateCcw, Calendar } from 'lucide-react';
import { BASE_URL } from '@/src/components/BaseUrl';

// Base URL for API calls
// const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [filteredPayments, setFilteredPayments] = useState([]);
  const [filters, setFilters] = useState({
    status: 'All',
    dateRange: 'All'
  });
  const [isLoading, setIsLoading] = useState(true);
  const [processingRefund, setProcessingRefund] = useState({});
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    try {
      const userString = localStorage.getItem('userProfile');
      const user = userString ? JSON.parse(userString) : null;
      if (user) {
        const loggedInUser = {
          id: user?.uid,
          name: user?.displayName,
          email: user?.email,
          role: user?.role
        };
        setCurrentUser(loggedInUser);
      } else {
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      setIsLoading(false);
    }
  }, []);

  // Permission function
  const can = (permission) => {
    const permissions = {
      'action:payment.refund': true
    };
    return permissions[permission] || false;
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Load payments from API
  useEffect(() => {
    if (currentUser) {
      loadPayments();
    }
  }, [currentUser]);

  // Apply filters when payments or filters change
  useEffect(() => {
    applyFilters();
  }, [payments, filters]);

  const loadPayments = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      // Fetch payments from API
      const response = await fetch(`${BASE_URL}/api/getPayments/${currentUser?.id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch payments: ${response.status} ${response.statusText}`);
      }

      const paymentData = await response.json();
      
      // Transform the API data to match our UI structure
      const transformedPayments = paymentData.map(payment => ({
        id: payment.id,
        transactionId: payment.transaction_id,
        customerId: payment.createdby_id,
        customerName: payment.payment_payload?.notes?.customer_name || 'Unknown Customer',
        amount: parseFloat(payment.paid_amount) || 0,
        method: payment.transaction_type === 'card' ? 'Credit Card' : payment.transaction_type,
        status: mapPaymentStatus(payment.payment_status),
        description: `Invoice #${payment.invoice_id}`,
        createdAt: payment.created_at,
        updatedAt: payment.modified_at,
        rawData: payment // Keep original data for reference
      }));
      
      setPayments(transformedPayments);
    } catch (error) {
      console.error('Error loading payments:', error);
      setError('Failed to load payments. Please try again.');
      
      // Fallback to demo data if API fails
      
      
      setPayments(demoPayments);
    } finally {
      setIsLoading(false);
    }
  };

  // Map Razorpay status to our status system
  const mapPaymentStatus = (status) => {
    switch (status) {
      case 'created': return 'Pending';
      case 'authorized': return 'Pending';
      case 'captured': return 'paid';
      case 'refunded': return 'Refunded';
      case 'failed': return 'Failed';
      default: return status ;
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
      
      // In a real application, you would call your refund API here
      // For now, we'll just update the UI
      const updatedPayments = payments.map(p => 
        p.id === paymentId ? {...p, status: 'Refunded'} : p
      );
      
      setPayments(updatedPayments);

      console.log(`Processed refund for ${payment.customerName} - ${formatCurrency(payment.amount)}`);
      console.log(`Notification: ${formatCurrency(payment.amount)} refunded to ${payment.customerName}`);

    } catch (error) {
      console.error('Error processing refund:', error);
    } finally {
      setProcessingRefund({ ...processingRefund, [paymentId]: false });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Payments</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded flex items-center">
            <span className="text-sm">{error}</span>
            <button
              onClick={loadPayments}
              className="ml-4 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        )}
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
            <option value="paid">paid</option>
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono text-gray-900">{payment.transactionId}</div>
                    <div className="text-xs text-gray-500">ID: {payment.id}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.customerName}</div>
                    <div className="text-xs text-gray-500">ID: {payment.customerId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(payment.amount)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{payment.method}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {payment.description}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {can('action:payment.refund') && payment.status === 'paid' && (
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