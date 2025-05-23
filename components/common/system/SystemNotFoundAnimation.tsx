'use client';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function NotFoundAnimation() {
    return (
        <DotLottieReact
            src="/gif/not_found.lottie"
            autoplay
            loop
            style={{
                width: '100%',
                height: '100%',
                objectFit: 'contain'
            }}
        />
    );
}
