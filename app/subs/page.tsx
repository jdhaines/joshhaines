import { genPageMetadata } from 'app/seo'
import { redirect } from 'next/navigation'

export const metadata = genPageMetadata({ title: 'Submarines Keynote' })

export default function SubsRedirect() {
  redirect('/blog/submarines-keynote')
}
