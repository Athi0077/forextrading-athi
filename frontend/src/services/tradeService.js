import { apiCall } from './api';

export const getTrades = async () => {
  const result = await apiCall('/trades');
  return result.data;
};

export const createTrade = async (tradeData) => {
  const result = await apiCall('/trades', {
    method: 'POST',
    body: JSON.stringify(tradeData)
  });
  return result.data;
};

export const updateTrade = async (id, tradeData) => {
  const result = await apiCall(`/trades/${id}`, {
    method: 'PUT',
    body: JSON.stringify(tradeData)
  });
  return result.data;
};

export const deleteTrade = async (id) => {
  const result = await apiCall(`/trades/${id}`, {
    method: 'DELETE'
  });
  return result.data;
};

export const getPortfolioAnalytics = async () => {
  const result = await apiCall('/trades/analytics');
  return result.data;
};

export const getPerformanceInsight = async () => {
  const result = await apiCall('/trades/insight');
  return result.data;
};
