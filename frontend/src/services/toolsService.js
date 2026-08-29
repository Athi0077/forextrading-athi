import { apiCall } from './api';

export const getWatchlist = async () => {
  const result = await apiCall('/tools/watchlist');
  return result.data;
};

export const updateWatchlist = async (pairs) => {
  const result = await apiCall('/tools/watchlist', {
    method: 'PUT',
    body: JSON.stringify({ pairs })
  });
  return result.data;
};

export const getAlerts = async () => {
  const result = await apiCall('/tools/alerts');
  return result.data;
};

export const createAlert = async (alertData) => {
  const result = await apiCall('/tools/alerts', {
    method: 'POST',
    body: JSON.stringify(alertData)
  });
  return result.data;
};

export const updateAlert = async (id, alertData) => {
  const result = await apiCall(`/tools/alerts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(alertData)
  });
  return result.data;
};

export const deleteAlert = async (id) => {
  const result = await apiCall(`/tools/alerts/${id}`, {
    method: 'DELETE'
  });
  return result.data;
};
