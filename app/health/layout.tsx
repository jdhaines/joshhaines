'use client'

import { ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

export default function Health({ children }: { children: ReactNode }) {
  const tabs = [
    { name: 'Weight', href: '/health/weight' },
    { name: 'Habits', href: '/health/habits' },
    { name: 'Rowing', href: '/health/rowing' },
    { name: 'Lifts', href: '/health/lifts' },
    // { name: 'Tests', href: '/health/tests' },
  ]
  const router = useRouter()
  const fullpath = usePathname()
  const pathname = fullpath.split('/')[2]

  return (
    <>
      <div className="border-b border-jblue-700 pb-5 sm:pb-0">
        <h3 className="text-base font-semibold leading-6 text-gray-500">options</h3>
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
              onChange={(e) => router.push(e.target.value)}
              defaultValue={fullpath ?? tabs[0].href}
            >
              {tabs.map((tab) => (
                <option key={tab.name} value={tab.href}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
          {/*Large Screen*/}
          <div className="hidden sm:block">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <Link
                  key={tab.name}
                  href={tab.href}
                  className={classNames(
                    tab.href === fullpath
                      ? 'border-b-2 border-jred-500 text-jred-500'
                      : 'border-transparent text-gray-500 hover:border-jblue-300 hover:text-jblue-300 dark:text-gray-300',
                    'border-b-1 whitespace-nowrap px-1 pb-4 text-sm font-medium'
                  )}
                >
                  {tab.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
      <div>{children}</div>
    </>
  )
}
