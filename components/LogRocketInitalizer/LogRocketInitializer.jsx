"use client";

import { useEffect } from "react";
import LogRocket from 'logrocket';
import './LogRocketInitializer.css';

export default function LogRocketInitializer() {
    useEffect(() => {
        LogRocket.init('geglg6/amessages');
    }, []);

    return null; // This component doesn't render anything
} 