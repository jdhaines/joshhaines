import Link from 'next/link'
import kebabCase from '@/lib/utils/kebabCase'

const Tag = ({ text }) => {
  return (
    <Link href={`/tags/${kebabCase(text)}`}>
      <a className="mr-3 text-sm font-medium uppercase dark:hover:text-jyellow-100 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900">
        {text.split(' ').join('-')}
      </a>
    </Link>
  )
}

export default Tag
