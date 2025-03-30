import { genPageMetadata } from 'app/seo'
import NoSsr from '@/components/NoSsr'

export const metadata = genPageMetadata({ title: 'China Pics' })

export default function China() {
  return (
    <>
      <div className="divide-y divide-gray-400 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-100">
            China & Tokyo '24-'25
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Below, you can check out a few photos from our China trip from late 2024 and early 2025!
            <br />
            <br />
            We visited Tianjin China for about 1.5 weeks, then flew to Chengdu in the Sichuan
            Province for some amazing food and to see the Pandas. We went back to Tianjin for a
            couple days and then to Beijing to explore the city and visit the Great Wall of China.
            Finally, on our way out, we had almost a full day to explore Tokyo. It was a great trip
            and we can't wait to go back!
          </p>
        </div>
        <NoSsr>
          <div className="container py-12">
            <div className="-m-4 flex flex-wrap">
              <script src="/static/js/embed-ui.min.js" async></script>
              <div
                className="pa-gallery-player-widget"
                style={{ width: '100%', height: '480px', display: 'none' }}
                data-link={'https://photos.app.goo.gl/5612mwMLxiFPMjoY6'}
                data-title={''}
                data-background-color={'#111827'}
                data-description={'2 new items added to shared album'}
              >
                <object data="https://lh3.googleusercontent.com/pw/AP1GczPDPkfSgcMTNduOSgjmdVPd3SMuVojz9MaOZ64e4PZl7cvG3e8-V_vcJXD4z8Fe9UKh8TvJ72mP7sS4SqZQd7ptaGw3EyGQCchjQK9uK6kZrv_IpDRE=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczOkWYr6QCBcV4t1PG7JYyx7cLpLqoj0mzw84iSwBEuwR-cD71N3chzVVp25OkdsUTBtqeHomCcBa0knT_Ty2Df3OuJ4eUUD5kMjoDVV9TGFyuYxGCxr=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczNFpANd7HcdE-dWAVgmA7U_DNmoFfEaTwGMXUeuG5Gd6eMkW_2BBWAd6lkB0-H1k99ra13cG2Lu_pw0BIGZ6rCI1T3k5t544Yqd_uZtSF7qjKYhK0aO=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczNeLF5QVndi7hf4Xvtg0PpqNGeGcfU31pF8J6uTpXSY39uQ9lyad_fyd1t9n5cb8uxZf6nNNCo4EM79Bn-Xrn3LgrNpyutwpSsnmRabMIAgabPoPqRh=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczOTNIr5kRBn3nDbZUik_5IJ1sXypTJLlwIn-fQjk35WPXxhmio0ZrB-NonrMq2SRoWtFH7SrFcedoC02mOy__Gxd53upl9079IEdTIv_PSER9CXkMFf=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczPJLzWOqrEd0Hm1c_xXielnRm6YZk9aMxIygkBR6-FrHasdgC5oBT-ZwW9V4PjgiIxjQwTTVlVB5dvZYEThcTPfQdNBXU0fWeHDxeC5MpfrTTcKXeXA=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczOAtR0ytKWP73E6pEEoB0WK2B9-jxBzmbBYo5vvXPn8FzA2BKVpA_yfeBkYmFZ1dY5kR4oL9x-ky6NxxwRKyvp2Kg3xoyK8-zTVT0nqyn1MSbbqDfUX=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczMZXhaqy-00wH93IYqiFWD-jCfBhmO3D1X1jP90awi3UV4IZDOTwS95j8I4W8rwtL_jV-XQ6ltxHILsPN2geo439lBL8SQkiYh8POeHt0Nz_pr2yL9z=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczP8PiwnuRuB5I18iaszy7u1hi52wfI80FGhOBUG7t-c7MRQ2C7zJiM3-JZQx1LMtTDpwjGGbcdpsuewNlF60Q_eYmiZxsmhCKE27lMxqQHlQTSYlXd7=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczOGJdMsDe0r__CxEI-0rD-XYWMxvh6h142yBPpfPd_JBtOx0-pwwjtKaqncH5rN6dcmgmnm9VEH_w8kWGXEhLArfJvLEx77Vw1eGsmg9i_4WNAVQsEf=w1920-h1080"></object>
                <object data="https://lh3.googleusercontent.com/pw/AP1GczPBaFF7cge_vFZwK0GhAO6gnpenEiDndszJMZGMEUY2oenViusznGLxGjVYzbhIXixzoU3Cp3H6L-YgWIMIJwwYHg_VUzkOG_7j4dhFL1Ddi-D0AcTu=w1920-h1080"></object>
              </div>
            </div>
          </div>
        </NoSsr>
      </div>
    </>
  )
}
