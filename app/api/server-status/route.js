export async function GET() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://amessages.onrender.com';
    const response = await fetch(`${apiUrl}/test`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Add timeout
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      return Response.json({ 
        status: 'online', 
        message: 'Server is running',
        timestamp: new Date().toISOString()
      });
    } else {
      return Response.json({ 
        status: 'error', 
        message: `Server error: ${response.status}`,
        timestamp: new Date().toISOString()
      }, { status: response.status });
    }
  } catch (error) {
    console.error('Server status check failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error.name === 'TimeoutError') {
      errorMessage = 'Server timeout';
    } else if (error.message.includes('Failed to fetch')) {
      errorMessage = 'Network error - cannot connect to server';
    } else if (error.message.includes('CORS')) {
      errorMessage = 'CORS error';
    } else {
      errorMessage = error.message;
    }

    return Response.json({ 
      status: 'offline', 
      message: errorMessage,
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
} 