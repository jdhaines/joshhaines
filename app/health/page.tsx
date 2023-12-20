'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function HealthRoot() {
  const router = useRouter()
  useEffect(() => {
    router.push('/health/weight')
  })
  return null
}
