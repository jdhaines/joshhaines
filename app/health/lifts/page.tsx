'use client'
import { ChartData } from 'app/types'
import { Chart } from 'react-google-charts'
import useGoogleSheets from 'use-google-sheets'
import { useEffect, useState } from 'react'

export default function ChartsPage() {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    const check = () => {
      setIsDark(document.documentElement.classList.contains('dark'))
    }

    check()

    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    return () => observer.disconnect()
  }, [])
  const LiftData = () => {
    const { data, loading, error } = useGoogleSheets({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
      sheetsOptions: [{ id: 'lifts' }],
    })

    if (loading) {
      return [[new Date(), 0]]
    }

    if (error) {
      return [[new Date(), 0]]
    }
    const liftArray: ChartData[] = []
    liftArray.push([
      { type: 'date', label: 'Date' },
      'Deadlift',
      'Low-Bar Squat',
      'Overhead Press',
      'Bench Press',
      'Snatch',
      'Clean & Jerk',
    ])
    const response = data[0].data.map((row) => {
      return liftArray.push([
        new Date(row['Date'] as Date),
        parseFloat(row['Deadlift'] as string),
        parseFloat(row['Low-Bar Squat'] as string),
        parseFloat(row['Overhead Press'] as string),
        parseFloat(row['Bench Press'] as string),
        parseFloat(row['Snatch'] as string),
        parseFloat(row['Clean & Jerk'] as string),
      ])
    })
    return liftArray
  }

  return (
    <div>
      <Chart
        chartType="LineChart"
        width="100%"
        height="800px"
        legendToggle
        data={LiftData()}
        options={{
          title: '1RM for Major Lifts',
          subtitle: 'Weight (lbs)',
          curveType: 'function',
          allowHtml: true,
          displayLegendValues: true,
          displayZoomButtons: true,
          backgroundColor: isDark ? '#101828' : '#E5E7EB',
          hAxis: {
            textStyle: { color: isDark ? '#e5e7eb' : '#111827' },
            gridlines: { color: isDark ? '#1f2937' : '#d1d5db' },
          },
          vAxis: {
            textStyle: { color: isDark ? '#e5e7eb' : '#111827' },
            gridlines: { color: isDark ? '#1f2937' : '#d1d5db' },
          },
          legend: {
            textStyle: { color: isDark ? '#e5e7eb' : '#111827' },
          },
          titleTextStyle: { color: isDark ? '#e5e7eb' : '#111827' },
        }}
      />
    </div>
  )
}
