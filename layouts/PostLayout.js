import Link from '@/components/Link'
import PageTitle from '@/components/PageTitle'
import SectionContainer from '@/components/SectionContainer'
import { BlogSEO } from '@/components/SEO'
import Image from '@/components/Image'
import Tag from '@/components/Tag'
import siteMetadata from '@/data/siteMetadata'
import Comments from '@/components/comments'
import ScrollTopAndComment from '@/components/ScrollTopAndComment'

const editUrl = (fileName) => `${siteMetadata.siteRepo}/blob/master/data/blog/${fileName}`
const discussUrl = (slug) =>
  `https://mobile.twitter.com/search?q=${encodeURIComponent(
    `${siteMetadata.siteUrl}/blog/${slug}`
  )}`

const postDateTemplate = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }

export default function PostLayout({ frontMatter, authorDetails, next, prev, children }) {
  const { slug, fileName, date, title, tags } = frontMatter

  return (
    <SectionContainer>
      <BlogSEO
        url={`${siteMetadata.siteUrl}/blog/${slug}`}
        authorDetails={authorDetails}
        {...frontMatter}
      />
      <ScrollTopAndComment />
      <article>
        <div className="xl:divide-y xl:divide-gray-200 xl:dark:divide-gray-700">
          <header className="pt-6 xl:pb-6">
            <div className="space-y-1 text-center">
              <dl className="space-y-10">
                <div>
                  <dt className="sr-only">Published on</dt>
                  <dd className="text-base font-medium leading-6 text-gray-600 dark:text-gray-400">
                    <time dateTime={date}>
                      {new Date(date).toLocaleDateString(siteMetadata.locale, postDateTemplate)}
                    </time>
                  </dd>
                </div>
              </dl>
              <div>
                <PageTitle>{title}</PageTitle>
              </div>
            </div>
          </header>
          <div
            className="pb-8 divide-y divide-gray-200 xl:divide-y-0 dark:divide-gray-700 xl:grid xl:grid-cols-4"
            style={{ gridTemplateRows: 'auto 1fr' }}
          >
            <dl className="pt-6 pb-10 xl:pt-11 xl:border-b xl:border-gray-200 xl:dark:border-gray-700">
              <dt className="sr-only">Authors</dt>
              <dd>
                <ul className="flex justify-center space-x-8 xl:block sm:space-x-12 xl:space-x-0 xl:space-y-8">
                  {authorDetails.map((author) => (
                    <li className="flex items-center space-x-2" key={author.name}>
                      {author.avatar && (
                        <Image
                          src={author.avatar}
                          width="64px"
                          height="64px"
                          alt="avatar"
                          className="border-2 border-gray-600 rounded-full inline object-cover"
                        />
                      )}
                      <dl className="text-sm font-medium leading-5 whitespace-nowrap">
                        <dt className="sr-only">Name</dt>
                        <dd className="text-jred-900 dark:text-jred-100">{author.name}</dd>
                        <dt className="sr-only">GitHub</dt>
                        <dd>
                          {author.twitter && (
                            <Link
                              href={author.github}
                              className="dark:hover:text-jyellow-100 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900"
                            >
                              {author.github.replace('https://github.com/', '...github/')}
                            </Link>
                          )}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
              </dd>
            </dl>
            <div className="divide-y divide-gray-200 dark:divide-gray-700 xl:pb-0 xl:col-span-3 xl:row-span-2">
              <div className="pt-10 pb-8 prose dark:prose-dark max-w-none">{children}</div>
              <div className="pt-6 pb-6 text-sm text-gray-700 dark:text-gray-300">
                <Link
                  className="dark:hover:text-jyellow-100 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900"
                  href={discussUrl(slug)}
                  rel="nofollow"
                >
                  {'Discuss on Twitter'}
                </Link>
                {` • `}
                <Link
                  className="dark:hover:text-jyellow-100 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900"
                  href={editUrl(fileName)}
                >
                  {'View on GitHub'}
                </Link>
              </div>
              <Comments frontMatter={frontMatter} />
            </div>
            <footer>
              <div className="text-sm font-medium leading-5 divide-gray-200 xl:divide-y dark:divide-gray-700 xl:col-start-1 xl:row-start-2">
                {tags && (
                  <div className="py-4 xl:py-8">
                    <h2 className="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400">
                      Tags
                    </h2>
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  </div>
                )}
                {(next || prev) && (
                  <div className="flex justify-between py-4 xl:block xl:space-y-8 xl:py-8">
                    {prev && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400">
                          Previous Article
                        </h2>
                        <div className="hover:text-jgreen-600 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100">
                          <Link href={`/blog/${prev.slug}`}>{prev.title}</Link>
                        </div>
                      </div>
                    )}
                    {next && (
                      <div>
                        <h2 className="text-xs tracking-wide text-gray-600 uppercase dark:text-gray-400">
                          Next Article
                        </h2>
                        <div className=" hover:text-jgreen-600 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100">
                          <Link href={`/blog/${next.slug}`}>{next.title}</Link>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="pt-4 xl:pt-8">
                <Link
                  href="/blog"
                  className=" hover:text-jgreen-600 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100"
                >
                  &larr; Back to the blog
                </Link>
              </div>
            </footer>
          </div>
        </div>
      </article>
    </SectionContainer>
  )
}
