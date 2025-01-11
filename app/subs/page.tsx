import { genPageMetadata } from 'app/seo'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export const metadata = genPageMetadata({ title: 'Submarines Keynote' })

export default function SubsRedirect() {
  revalidatePath('/blog/submarines-keynote')
  redirect('/blog/submarines-keynote')
}
