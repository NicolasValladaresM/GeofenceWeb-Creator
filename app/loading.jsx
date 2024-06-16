'use client'
import { useEffect, useState } from 'react';
import React from 'react';

export default function Loading() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000)

    return () => clearTimeout(timer);
  }, []);

  return isLoading ? <div>Cargando...</div> : null;
}