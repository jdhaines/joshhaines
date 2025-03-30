import Link from '@/components/Link'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import NewsletterForm from 'pliny/ui/NewsletterForm'

const MAX_DISPLAY = 5

export default function Home({ posts }) {
  return (
    <>
      <div className="my-6 flex flex-col items-center gap-x-12 xl:mb-12 xl:flex-row">
        <div className="pt-6">
          <h1 className="pb-6 text-3xl leading-9 font-bold tracking-tight text-gray-700 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14 dark:text-gray-300">
            Hi, I'm Josh!
          </h1>
          <h2 className="w-3/4 text-lg text-gray-600 dark:text-gray-400">
            Welcome to my personal website. A few years back I switched my career from Materials
            Engineering to DevSecOps & Software Engineering. I've built a number of{' '}
            <Link
              className="text-jblue-700 hover:text-jyellow-900 dark:text-jblue-100 dark:hover:text-jyellow-100"
              href="/projects"
            >
              projects
            </Link>{' '}
            over the years and have written a few{' '}
            <Link
              className="text-jblue-700 hover:text-jyellow-900 dark:text-jblue-100 dark:hover:text-jyellow-100"
              href="/blog"
            >
              articles
            </Link>{' '}
            about various topics.
            <br />
            <br />
            I'm especially proud of my{' '}
            <Link
              className="text-jblue-700 hover:text-jyellow-900 dark:text-jblue-100 dark:hover:text-jyellow-100"
              href="/blog/book-shelf"
            >
              book-shelf
            </Link>{' '}
            where I list many of the books I've read from most useful to least useful. <br />
          </h2>
        </div>
      </div>
      <div className="divide-y divide-gray-300 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl leading-9 font-bold tracking-tight text-gray-900 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14 dark:text-gray-200">
            Latest
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { slug, date, title, summary, tags } = post
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-baseline xl:space-y-0">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base leading-6 font-medium text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl leading-8 font-bold tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-jred-500 dark:text-jyellow-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base leading-6 font-medium">
                        <Link
                          href={`/blog/${slug}`}
                          className="text-jblue-700 hover:text-jyellow-900 dark:text-jblue-100 dark:hover:text-jyellow-100"
                          aria-label={`Read more: "${title}"`}
                        >
                          Read more &rarr;
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base leading-6 font-medium">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {siteMetadata.newsletter?.provider && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )}
    </>
  )
}
