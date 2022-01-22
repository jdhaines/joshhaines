import Document, { Html, Head, Main, NextScript } from 'next/document'
class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="apple-touch-icon" sizes="192x192" href="/_static/favicons/favicon-192.png" />
          <link rel="icon" type="image/png" sizes="48x48" href="/_static/favicons/favicon-48.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/_static/favicons/favicon-32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/_static/favicons/favicon-16.png" />
          <link rel="manifest" href="/_static/favicons/site.webmanifest" />
          <link rel="mask-icon" href="/_static/favicons/favicon-192.svg" color="#7BCC80" />
          <meta name="msapplication-TileColor" content="#FFFFFF" />
          <meta name="theme-color" content="#FFFFFF" />
          <link rel="alternate" type="application/rss+xml" href="/feed.xml" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />
          <link
            rel="stylesheet"
            href="https://cdn.jsdelivr.net/npm/katex@0.13.11/dist/katex.min.css"
            integrity="sha384-Um5gpz1odJg5Z4HAmzPtgZKdTBHZdw8S29IecapCSB31ligYPhHQZMIlWLYQGVoc"
            crossOrigin="anonymous"
          />
        </Head>
        <body className="antialiased text-black bg-white dark:bg-gray-900 dark:text-white">
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
