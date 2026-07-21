'use client'

import { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'

export default function FigmaEmbed() {
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="my-8 aspect-video w-full animate-pulse rounded-lg bg-gray-100 dark:bg-gray-950" />
    )
  }

  const theme = resolvedTheme === 'dark' ? 'dark' : 'light'

  return (
    <div className="my-8 aspect-video w-full overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-950">
      <iframe
        key={theme}
        title="TechPoint Keynote presentation"
        src={`https://embed.figma.com/slides/jahZYSSGvIcVakkqcfdzNx/TechPoint-Keynote--Public-?node-id=1-42&embed-host=share&theme=${theme}`}
        className="h-full w-full border border-black/10 dark:border-white/10"
        allowFullScreen
        loading="lazy"
      />
    </div>
  )
}
