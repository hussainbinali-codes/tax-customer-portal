import { getData, saveData } from '../seedData.js';
import { simulateNetwork, simulateError } from './utils.js';

export const invoicesAPI = {
  async getAll() {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    return data.invoices || [];
  },

  async getById(id) {
    await simulateNetwork();
    simulateError(0.05);
    
    const data = getData();
    const invoice = data.invoices.find(i => i.id === id);
    
    if (!invoice) {
      throw new Error('Invoice not found');
    }
    
    return invoice;
  },

  async create(invoiceData) {
    await simulateNetwork(600);
    simulateError(0.05);
    
    const data = getData();
    
    // Calculate totals
    const subtotal = invoiceData.items.reduce((sum, item) => sum + item.amount, 0);
    const tax = subtotal * (invoiceData.taxRate || 0) / 100;
    const total = subtotal + tax - (invoiceData.discount || 0);
    
    const newInvoice = {
      ...invoiceData,
      id: Date.now().toString(),
      subtotal,
      tax,
      total,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.invoices.push(newInvoice);
    saveData(data);
    
    return newInvoice;
  },

  async updateStatus(id, status) {
    await simulateNetwork(400);
    simulateError(0.05);
    
    const data = getData();
    const index = data.invoices.findIndex(i => i.id === id);
    
    if (index === -1) {
      throw new Error('Invoice not found');
    }
    
    data.invoices[index] = {
      ...data.invoices[index],
      status,
      updatedAt: new Date().toISOString()
    };
    
    saveData(data);
    return data.invoices[index];
  }
};