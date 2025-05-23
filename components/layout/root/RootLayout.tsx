'use client'

import React, { useEffect, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles';
import { ToastContainer } from 'react-toastify';
import theme from '../../../utils/theme/theme';

const RootLayout = ({ children }: { children: React.ReactNode }) => {
    const [isMounted, setIsMounted] = useState<boolean>(false)

    useEffect(() => {
        setIsMounted(true)

    }, [])

    if (!isMounted) return null;

    return (
        <main id="scroll-container" className='bg-white min-w-screen lg:min-h-screen min-h-dvh relative text-black'>
            <ThemeProvider theme={theme}>
                {children}
                <ToastContainer />
            </ThemeProvider>
        </main>
    )
}

export default RootLayout