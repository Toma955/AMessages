// API client utility for making authenticated requests
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
        try {
            const token = getAuthToken();
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });
            
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
            const response = await fetch(url, {
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
            const response = await fetch(url, {
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
            const response = await fetch(url, {
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