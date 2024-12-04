import axios from 'axios';

export const apiClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export const createStripeCheckout = async (params: {
    priceId: string;
    mode: 'payment' | 'subscription';
    successUrl: string;
    cancelUrl: string;
}) => {
    const response = await apiClient.post('/stripe/create-checkout', params);
    return response.data;
};