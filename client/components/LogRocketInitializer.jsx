"use client";

import { useEffect } from "react";
import LogRocket from 'logrocket';

export default function LogRocketInitializer() {
    useEffect(() => {
        console.log('LogRocket: Initializing...');
        LogRocket.init('geglg6/amessages');
        console.log('LogRocket: Initialized successfully');
    }, []);

    return null; // This component doesn't render anything
} 