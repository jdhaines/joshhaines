import Image from './Image'
import Link from './Link'
import formatDate from '@/lib/utils/formatDate'

const Card = ({ title, description, imgSrc, date, href }) => (
  <div className="p-4 md:w-1/2 md" style={{ maxWidth: '544px' }}>
    <div className="h-full overflow-hidden border-2 border-gray-600 rounded-md border-opacity-60 dark:border-gray-700">
      {href ? (
        <Link href={href} aria-label={`Link to ${title}`}>
          <img
            alt={title}
            src={imgSrc}
            className="object-cover object-center lg:h-48 md:h-36"
            width={544}
            height={306}
          />
        </Link>
      ) : (
        <img
          alt={title}
          src={imgSrc}
          className="object-cover object-center lg:h-48 md:h-36"
          width={544}
          height={306}
        />
      )}
      <div className="p-6">
        <h2 className="text-2xl font-bold leading-8 tracking-tight">
          {href ? (
            <Link
              className="dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100"
              href={href}
              aria-label={`Link to ${title}`}
            >
              {title}
            </Link>
          ) : (
            title
          )}
        </h2>
        <time className="dark:text-jred-100 text-xs" dateTime={date}>
          {formatDate(date)}
        </time>
        <p className="my-3 prose text-gray-600 max-w-none dark:text-gray-400">{description}</p>
        {href && (
          <Link
            href={href}
            className="text-base font-medium leading-6 text-gray-500 hover:text-gray-600 dark:text-jblue-100 text-jblue-700 hover:text-jyellow-900 dark:hover:text-jyellow-100"
            aria-label={`Link to ${title}`}
          >
            Learn more &rarr;
          </Link>
        )}
      </div>
    </div>
  </div>
)

export default Card
