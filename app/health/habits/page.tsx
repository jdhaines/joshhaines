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

    // Strength Training
    let liftingArray: ChartData[] = []
    const response = data[0].data.map((row) => {
      return liftingArray.push([new Date(row['Date']), parseInt(row['Strength Training']) || 0])
    })
    liftingArray = liftingArray.filter((row) => {
      return row[1] === 1
    })
    liftingArray.unshift([
      { type: 'date', label: 'Date' },
      { type: 'number', label: 'Lifted' },
    ])

    // LSD Training
    let lsdArray: ChartData[] = []
    const response2 = data[0].data.map((row) => {
      return lsdArray.push([new Date(row['Date']), parseInt(row['Zone 2 Training']) || 0])
    })
    lsdArray = lsdArray.filter((row) => {
      return row[1] === 1
    })
    lsdArray.unshift([
      { type: 'date', label: 'Date' },
      { type: 'number', label: 'Rowed' },
    ])

    // Sleep Amounts
    let sleepArray: ChartData[] = []
    const response3 = data[0].data.map((row) => {
      return sleepArray.push([new Date(row['Date']), parseFloat(row['Sleep (hrs)']) || 0])
    })
    sleepArray = sleepArray.filter((row) => {
      if (row[1] !== 0) {
        return row[1] !== 0
      }
    })
    sleepArray.unshift([
      { type: 'date', label: 'Date' },
      { type: 'number', label: 'Rowed' },
    ])
    return {
      sleepArray: sleepArray,
      liftingArray: liftingArray,
      lsdArray: lsdArray,
    }
  }

  return (
    <div className="flex w-screen flex-col pt-4">
      <Chart
        chartType="Calendar"
        width="1000px"
        height="350px"
        data={WeightData()['sleepArray']}
        options={{
          legendToggle: false,
          colorAxis: {
            colors: ['#FFFFFF', '#07A6E2'],
          },
          title: 'Sleep (hours)',
        }}
      />
      <Chart
        chartType="Calendar"
        width="1000px"
        height="350px"
        data={WeightData()['liftingArray']}
        options={{
          colorAxis: {
            minValue: 0,
            maxValue: 1,
            colors: ['#FFFFFF', '#07A6E2'],
          },
          title: 'Strength Training',
        }}
      />
      <Chart
        chartType="Calendar"
        width="1000px"
        height="350px"
        data={WeightData()['lsdArray']}
        options={{
          legendToggle: false,
          colorAxis: {
            minValue: 0,
            maxValue: 1,
            colors: ['#FFFFFF', '#07A6E2'],
          },
          title: 'Zone 2 Training',
        }}
      />
    </div>
  )
}
