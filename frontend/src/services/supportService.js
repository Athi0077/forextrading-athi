import { apiCall } from './api';

export const createSupportTicket = async (data) => {
  const result = await apiCall('/support', {
    method: 'POST',
    body: JSON.stringify(data)
  });
  return result;
};

export const getUserSupportTickets = async () => {
  const result = await apiCall('/support');
  return result;
};

export const getSupportTicketDetails = async (id) => {
  const result = await apiCall(`/support/${id}`);
  return result;
};
