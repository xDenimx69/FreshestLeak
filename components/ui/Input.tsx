import React from "react";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`border border-gray-600 rounded px-2 py-1 bg-gray-900 text-white ${
        props.className ?? ""
      }`}
    />
  );
}
