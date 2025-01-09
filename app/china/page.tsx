import { genPageMetadata } from 'app/seo'
import NoSsr from '@/components/NoSsr'

export const metadata = genPageMetadata({ title: 'China Pics' })

export default function China() {
  return (
    <>
      <div className="divide-y divide-gray-400 dark:divide-gray-700">
        <div className="space-y-2 pb-8 pt-6 md:space-y-5">
          <h1 className="text-3xl font-bold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            China & Tokyo '24-'25
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Below, you can check out a few photos from our China trip from late 2024 and early 2025!
          </p>
        </div>
        <NoSsr>
          <div className="container py-12">
            <div className="-m-4 flex flex-wrap">
              <script
                src="https://cdn.jsdelivr.net/npm/publicalbum@latest/embed-ui.min.js"
                async
              ></script>
              <div
                className="pa-gallery-player-widget"
                style={{ width: '100%', height: '480px', display: 'none' }}
                data-link={'https://photos.app.goo.gl/5612mwMLxiFPMjoY6'}
                data-title={'Public China Photos'}
                data-background-color={'#111827'}
                data-description={'2 new items added to shared album'}
              >
                <object data="https://lh3.googleusercontent.com/pw/AP1GczMqLnyw3kg9WiPNCAYrICit7r-W24HDko6_jOn7NR_9PpuXBY-Yvo2TWneX077Mawkf6J7rQJwev2FeXTpsl5pjQOG4FOpf4hoKIN3lutxkcMhduj0a=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczP6ej_rncDEPH4Jk6VlZPn0d26i_xv2uU8Fuu8fn9k9vFmNiEniy7H7n8yUmfdHtkwhkxbdcARVKB2UHXj_R9MoBekXUF167Jtj3gj9zBv_fOcAIQFu=w1920-h1080"></object>
              </div>
            </div>
          </div>
        </NoSsr>
      </div>
    </>
  )
}
