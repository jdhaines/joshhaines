import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import { getAllFilesFrontMatter } from '@/lib/mdx'
import formatDate from '@/lib/utils/formatDate'

// import NewsletterForm from '@/components/NewsletterForm'

const MAX_DISPLAY = 5

export async function getStaticProps() {
  const posts = await getAllFilesFrontMatter('blog')

  return { props: { posts } }
}

export default function Home({ posts }) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="flex flex-col items-center my-6 xl:flex-row gap-x-12 xl:mb-12">
        <div className="pt-6">
          <h1 className="pb-6 text-3xl font-extrabold leading-9 tracking-tight text-gray-700 dark:text-gray-300 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14">
            Hi, I'm Josh!
          </h1>
          <h2 className="text-lg w-3/4 text-gray-600 dark:text-gray-400">
            Welcome to my personal website. I recently switched my career from Materials Engineering
            to Software Development. I've built a number of{' '}
            <Link
              className="dark:text-jblue-100  dark:hover:text-jyellow-100 text-jblue-700 hover:text-jyellow-900"
              href="/projects"
            >
              projects
            </Link>{' '}
            over the years and have written a few{' '}
            <Link
              className="dark:text-jblue-100  dark:hover:text-jyellow-100 text-jblue-700 hover:text-jyellow-900"
              href="/blog"
            >
              articles
            </Link>{' '}
            about various topics.
            {' about them. Have a good read!'}
          </h2>
        </div>
      </div>
      <hr className="border-gray-200 dark:border-gray-700" />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="pt-6 pb-6 space-y-2 md:space-y-5">
          <h2 className="text-2xl font-extrabold leading-9 tracking-tight text-gray-700 dark:text-gray-300 sm:text-4xl sm:leading-10 md:text-4xl md:leading-14">
            Latest Articles
          </h2>
          {/* <p className="text-lg leading-7 text-gray-600 dark:text-gray-400">
            {siteMetadata.description}
          </p> */}
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((frontMatter) => {
            const { slug, date, title, summary, tags } = frontMatter
            return (
              <li key={slug} className="py-12">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:space-y-0 xl:items-baseline">
                    <dl>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-600 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date)}</time>
                      </dd>
                    </dl>
                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link
                              href={`/blog/${slug}`}
                              className="text-jred-300 dark:text-jyellow-100"
                            >
                              {title}
                            </Link>
                          </h2>
                          <div className="flex flex-wrap mt-1">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose text-gray-600 max-w-none dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                      <div className="text-base font-medium leading-6">
                        <Link
                          href={`/blog/${slug}`}
                          className="dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100"
                          aria-label={`Read "${title}"`}
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
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100"
            aria-label="all posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
      {/* {siteMetadVata.newsletter.provider !== '' && (
        <div className="flex items-center justify-center pt-4">
          <NewsletterForm />
        </div>
      )} */}
    </>
  )
}
