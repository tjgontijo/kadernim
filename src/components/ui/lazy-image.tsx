'use client'

import { useState, useEffect } from 'react'
import Image, { ImageProps } from 'next/image'

type LazyImageProps = ImageProps & {
    placeholderColor?: string
}

export function LazyImage({ placeholderColor = 'hsl(var(--muted))', alt, ...props }: LazyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
        setIsClient(true)
    }, [])

    if (!isClient) {
        return (
            <div
                className="animate-pulse rounded-xl bg-muted"
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                }}
                aria-label={alt}
            />
        )
    }

    return (
        <>
            {!isLoaded && (
                <div
                    className="animate-pulse rounded-xl bg-muted absolute inset-0 z-10"
                />
            )}
            <Image
                alt={alt}
                {...props}
                onLoad={() => setIsLoaded(true)}
                style={{
                    ...props.style,
                    opacity: isLoaded ? 1 : 0,
                    transition: 'opacity 0.3s ease-in-out',
                }}
                className={`rounded-xl ${props.className || ''}`}
            />
        </>
    )
}
