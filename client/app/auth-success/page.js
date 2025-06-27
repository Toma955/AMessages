"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function AuthSuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');
        
        if (token) {
            // Store token and user data
            localStorage.setItem('token', token);
            
            try {
                const tokenData = JSON.parse(atob(token.split('.')[1]));
                localStorage.setItem('userId', tokenData.userId);
                localStorage.setItem('username', tokenData.username);
                localStorage.setItem('email', tokenData.email);
                
                if (tokenData.provider === 'google') {
                    localStorage.setItem('isGoogleUser', 'true');
                }
                
                // Redirect to main page
                router.push('/main');
            } catch (error) {
                console.error('Error parsing token:', error);
                router.push('/login?error=invalid_token');
            }
        } else if (error) {
            // Handle error
            router.push(`/login?error=${error}`);
        } else {
            // No token or error, redirect to login
            router.push('/login');
        }
    }, [router, searchParams]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-black text-white">
            <div className="text-center">
                <h1 className="text-2xl font-bold mb-4">Processing authentication...</h1>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
            </div>
        </div>
    );
}

export default function AuthSuccessPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthSuccessContent />
        </Suspense>
    );
} 