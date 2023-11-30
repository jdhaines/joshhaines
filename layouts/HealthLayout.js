import { PageSEO } from '@/components/SEO'
import { useState } from 'react'
// import {Script} from 'next/script'
import useGoogleSheets from 'use-google-sheets'
import { Chart } from 'react-google-charts'

/* Environment Variables */
// const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
// const CLIENT_SECRET = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET
// const AUTH_URL = process.env.NEXT_PUBLIC_GOOGLE_AUTH_URL
// const TOKEN_URL = process.env.NEXT_PUBLIC_GOOGLE_TOKEN_URL
// const CERT_URL = process.env.NEXT_PUBLIC_GOOGLE_CERT_URL
// const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY
// const API_KEY = 'AIzaSyDGDkq2sISfS7Od3uwihXqzkbCB3vLoq-w'
// const SHEET_ID = '1OaaYGhoXYdhczrEIsj0yfPzKQRkshmUlptsrzyr_zpM'

export default function HealthLayout({ children, frontMatter }) {
  const [tabs, setTabs] = useState([
    { name: 'Weight', href: '#', current: true },
    { name: 'Habits', href: '#', current: false },
    { name: 'Tests', href: '#', current: false },
    { name: 'Lifts', href: '#', current: false },
  ])

  /**
   * Pass the name of the new tab to this function to make it the current tab
   * @param tab
   */
  const setCurrentTab = (tab) => {
    setTabs((tabs) =>
      tabs.map((currentTab) => ({
        ...currentTab,
        current: currentTab.name === tab,
      }))
    )
  }

  function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
  }

  const WeightData = () => {
    const { data, loading, error } = useGoogleSheets({
      apiKey: process.env.NEXT_PUBLIC_GOOGLE_API_KEY,
      sheetId: process.env.NEXT_PUBLIC_GOOGLE_SHEET_ID,
      sheetsOptions: [{ id: 'weight' }],
    })

    if (loading) {
      return <div>Loading...</div>
    }

    if (error) {
      return <div>Error!</div>
    }

    // return <div>{JSON.stringify(data)}</div>
    // return data['valueRanges'][0]['values'].pop(0)
    // return JSON.stringify(
    //   data[0].data.map((row) => {
    //     return [row['Date'], row['Weight (lbs)']]
    //   })
    return data[0].data.map((row) => {
      return [row['Date'], row['Weight (lbs)']]
    })
    // .filter(function (row) {
    //   return row.length > 1
    // })
    // .map((row) => {
    //   return [new Date(row.date), row.weight, row.title, row.text]
    // })
  }

  // console.log('WeightData: ', WeightData())

  return (
    <>
      <PageSEO title={`Health`} description={`Miscellaneous Health Data`} />
      <div>
        <div className="border-b border-jblue-700 pb-5 sm:pb-0">
          <h3 className="text-base font-semibold leading-6 text-jblue-500">options</h3>
          <div className="mt-3 sm:mt-4">
            {/* Small Screen */}
            <div className="sm:hidden">
              <label htmlFor="current-tab" className="sr-only">
                Select a tab
              </label>
              <select
                id="current-tab"
                name="current-tab"
                className="block w-full rounded-md border-jblue-300 py-2 pl-3 pr-10 text-base text-jred-300 focus:border-jblue-500 focus:outline-none focus:ring-jblue-500 sm:text-sm"
                defaultValue={tabs.find((tab) => tab.current).name}
              >
                {tabs.map((tab) => (
                  <option key={tab.name}>{tab.name}</option>
                ))}
              </select>
            </div>
            {/*Large Screen*/}
            <div className="hidden sm:block">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <a
                    onClick={() => setCurrentTab(tab.name)}
                    key={tab.name}
                    href={tab.href}
                    className={classNames(
                      tab.current
                        ? 'border-jred-500 border-b-2 text-jred-500'
                        : 'border-transparent text-gray-400 hover:border-jblue-300 hover:text-jblue-300',
                      'whitespace-nowrap border-b-1 px-1 pb-4 text-sm font-medium'
                    )}
                    aria-current={tab.current ? 'page' : undefined}
                  >
                    {tab.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
        {/*Show this div if the Weight tab is current*/}
        <div hidden={tabs.find((tab) => tab.current).name !== 'Weight'}>
          <div>{WeightData()}</div>
          <Chart
            chartType="AnnotationChart"
            columns={[
              { type: 'date', label: 'Date' },
              { type: 'number', label: 'Weight' },
              { type: 'string', label: 'Title' },
              { type: 'string', label: 'Text' },
            ]}
            width="100%"
            rows={WeightData()}
            options={{
              allowHtml: false,
              displayLegendValues: true,
            }}
          />
        </div>
        {/*Show this div if the Habits tab is current*/}
        <div hidden={tabs.find((tab) => tab.current).name !== 'Habits'}>Test Habits</div>
        {/*Show this div if the Tests tab is current*/}
        <div hidden={tabs.find((tab) => tab.current).name !== 'Tests'}>Test Tests</div>
        {/*Show this div if the Lifts tab is current*/}
        <div hidden={tabs.find((tab) => tab.current).name !== 'Lifts'}>Test Lifts</div>
      </div>
    </>
  )
}
