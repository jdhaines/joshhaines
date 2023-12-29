'use client'
import { ChartData } from 'app/types'
import { Chart } from 'react-google-charts'
import useGoogleSheets from 'use-google-sheets'

export default function ChartPage() {
  const WeightData = () => {
    const { data, loading, error } = useGoogleSheets({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY || '',
      sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID || '',
      sheetsOptions: [{ id: 'data' }],
    })

    if (loading) {
      return [[new Date(), 0]]
    }

    if (error) {
      return [[new Date(), 0]]
    }

    const weightArray: ChartData[] = []
    weightArray.push([
      { type: 'date', label: 'Date' },
      { type: 'number', label: 'Weight (lbs)' },
    ])
    const response = data[0].data.map((row) => {
      return weightArray.push([new Date(row['Date']), Number.parseFloat(row['Weight (lbs)'])])
    })
    return weightArray
  }

  return (
    <div>
      <Chart
        chartType="AnnotationChart"
        width="100%"
        height="800px"
        data={WeightData()}
        options={{
          allowHtml: true,
          displayLegendValues: true,
          displayZoomButtons: true,
          colors: ['#07A6E2'],
          fill: 0,
          thickness: 2,
        }}
      />
    </div>
  )
}
