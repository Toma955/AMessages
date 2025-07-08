"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoadingCounter from "@/components/LoadingCounter/LoadingCounter";

export default function Home() {
    const [serverStatus, setServerStatus] = useState('checking');
    const [showLoading, setShowLoading] = useState(false);
    const router = useRouter();

    
    const testServer = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); 
            
            const response = await fetch('https://amessages.onrender.com/test', {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                
                setServerStatus('online');
                setTimeout(() => setShowLoading(true), 100);
                return true;
            } else {
               
                return await retryServerTest();
            }
        } catch (error) {
            return await retryServerTest();
        }
    };

   
    const retryServerTest = async () => {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000); 
            
            const response = await fetch('https://amessages.onrender.com/test', {
                method: 'GET',
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (response.ok) {
                setServerStatus('online');
                setTimeout(() => setShowLoading(true), 100);
                return true;
            } else {
                setServerStatus('offline');
                router.push('/not-found');
                return false;
            }
        } catch (error) {
           
            setServerStatus('offline');
            router.push('/not-found');
            return false;
        }
    };

    useEffect(() => {
        testServer();
    }, [router]);

    if (serverStatus === 'checking') {
        return null;
    }

    if (serverStatus === 'online' && showLoading) {
        return <LoadingCounter />;
    }

    return null;
}
