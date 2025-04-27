// components/ui/Card.tsx
import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`rounded shadow-md bg-gray-800 text-white ${className}`}>
      {children}
    </div>
  )
}
