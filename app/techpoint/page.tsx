import { genPageMetadata } from 'app/seo'
import { redirect } from 'next/navigation'

export const metadata = genPageMetadata({ title: "Techpoint '26 Keynote" })

export default function SubsRedirect() {
  redirect('/blog/techpoint-keynote')
}
