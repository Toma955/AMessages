// API client utility for making authenticated requests
const getAuthToken = () => {
    if (typeof window !== 'undefined') {
        return localStorage.getItem('token');
    }
    return null;
};

const handleResponse = async (response) => {
    const data = await response.json();
    
    if (!response.ok) {
       
        throw new Error(data.error_code || data.message || 'Network response was not ok');
    }
    
    return data;
};

const api = {
    get: async (url) => {
        const token = getAuthToken();
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });
        
        return handleResponse(response);
    },

    post: async (url, data) => {
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
    },

    put: async (url, data) => {
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
    },

    delete: async (url) => {
        const token = getAuthToken();
        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { 'Authorization': `Bearer ${token}` } : {})
            }
        });

        return handleResponse(response);
    }
};

export default api; 