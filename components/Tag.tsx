import Link from 'next/link'
import { slug } from 'github-slugger'
interface Props {
  text: string
}

const Tag = ({ text }: Props) => {
  return (
    <Link
      href={`/tags/${slug(text)}`}
      className="mr-3 text-sm font-medium uppercase text-jblue-700 hover:text-jyellow-900 dark:text-jblue-100 dark:hover:text-jyellow-100"
    >
      {text.split(' ').join('-')}
    </Link>
  )
}

export default Tag
