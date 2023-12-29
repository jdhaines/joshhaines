'use client'
import { ChartData } from 'app/types'
import { Chart } from 'react-google-charts'
import useGoogleSheets from 'use-google-sheets'

export default function ChartsPage() {
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
        new Date(row['Date']),
        parseFloat(row['Deadlift']),
        parseFloat(row['Low-Bar Squat']),
        parseFloat(row['Overhead Press']),
        parseFloat(row['Bench Press']),
        parseFloat(row['Snatch']),
        parseFloat(row['Clean & Jerk']),
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
          backgroundColor: '#E5E7EB',
        }}
      />
    </div>
  )
}
