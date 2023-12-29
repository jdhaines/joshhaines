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

    // Rowing Training
    let rowingArray: ChartData[] = []
    const response3 = data[0].data.map((row) => {
      return rowingArray.push([new Date(row['Date']), parseInt(row['Rowing Meters']) || 0])
    })
    rowingArray = rowingArray.filter((row) => {
      if (row[1] !== 0) {
        return row[1] !== 0
      }
    })
    rowingArray.unshift([
      { type: 'date', label: 'Date' },
      { type: 'number', label: 'Rowed' },
    ])
    return rowingArray
  }

  return (
    <div className="mt-4 flex w-screen flex-col">
      <Chart
        chartType="Calendar"
        width="1000"
        height="400px"
        data={WeightData()}
        options={{
          legendToggle: false,
          colorAxis: {
            colors: ['#FFFFFF', '#07A6E2'],
          },
          title: 'Rowing (meters)',
        }}
      />
    </div>
  )
}
