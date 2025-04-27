// components/ui/Button.tsx
import React from 'react'

export function Button(props: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white ${
        props.className ?? ""
      }`}
    >
      {props.children}
    </button>
  )
}
