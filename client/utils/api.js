// API client utility for making authenticated requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

const handleResponse = async (response) => {
    let data;
    
    try {
        // Try to parse JSON response
        const text = await response.text();
        data = text ? JSON.parse(text) : {};
    } catch (error) {
        // Safe console logging
        if (typeof console !== 'undefined' && console.error) {
            console.error('JSON parsing error:', error);
        }
        // If JSON parsing fails, create a basic error object
        data = {
            error_code: 'INVALID_RESPONSE',
            message: 'Invalid response format'
        };
    }
    
    if (!response.ok) {
        // Safe console logging
        if (typeof console !== 'undefined' && console.error) {
            console.error('API Error:', {
                status: response.status,
                statusText: response.statusText,
                data: data
            });
        }
        throw new Error(data.error_code || data.message || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    return data;
};

const api = {
    get: async (url) => {
        const startTime = Date.now();
        try {
            const token = getAuthToken();
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            console.log('API GET - URL:', fullUrl);
            console.log('API GET - Token exists:', !!token);
            console.log('API GET - Token:', token ? token.substring(0, 20) + '...' : 'none');
            
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            console.log('API GET - Headers:', headers);
            console.log('API GET - Request time:', new Date(startTime).toISOString());
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: headers
            });
            const endTime = Date.now();
            const duration = endTime - startTime;
            console.log('API GET - Response status:', response.status);
            console.log('API GET - Response ok:', response.ok);
            console.log('API GET - Response time:', new Date(endTime).toISOString());
            console.log('API GET - Duration (ms):', duration);
            // Log response headers
            const responseHeaders = {};
            response.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });
            console.log('API GET - Response headers:', responseHeaders);
            // Peek at response body (clone)
            let responseBody = null;
            try {
                const cloned = response.clone();
                responseBody = await cloned.text();
                console.log('API GET - Response body:', responseBody);
            } catch (e) {
                console.log('API GET - Could not read response body');
            }
            return handleResponse(response);
        } catch (error) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('GET request failed:', error);
            }
            throw new Error(error.message || 'Network request failed');
        }
    },

    post: async (url, data) => {
        try {
            const token = getAuthToken();
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            const response = await fetch(fullUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(data)
            });

            return handleResponse(response);
        } catch (error) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('POST request failed:', error);
            }
            throw new Error(error.message || 'Network request failed');
        }
    },

    put: async (url, data) => {
        try {
            const token = getAuthToken();
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            const response = await fetch(fullUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(data)
            });

            return handleResponse(response);
        } catch (error) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('PUT request failed:', error);
            }
            throw new Error(error.message || 'Network request failed');
        }
    },

    delete: async (url) => {
        try {
            const token = getAuthToken();
            const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;
            const response = await fetch(fullUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            return handleResponse(response);
        } catch (error) {
            if (typeof console !== 'undefined' && console.error) {
                console.error('DELETE request failed:', error);
            }
            throw new Error(error.message || 'Network request failed');
        }
    }
};

export default api; 