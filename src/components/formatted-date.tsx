'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface FormattedDateProps {
    dateString: string;
}

export default function FormattedDate({ dateString }: FormattedDateProps) {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        // Render a placeholder or nothing on the server
        return null;
    }
    
    return <>{format(new Date(dateString), "PPP p")}</>;
}
