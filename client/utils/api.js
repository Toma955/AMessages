// API client utility for making authenticated requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://amessages.onrender.com';

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
            
            const headers = {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            };
            
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: headers
            });
            const endTime = Date.now();
            const duration = endTime - startTime;
            
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