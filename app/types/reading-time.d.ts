// `reading-time`'s package root only ships types for the top-level entry
// point (which also pulls in a Node `stream`-dependent submodule we don't
// want in the client bundle -- see app/utils/reading-time.ts). This declares
// the specific submodule we import directly, reusing the upstream result type.
declare module "reading-time/lib/reading-time" {
  import type { Options, ReadTimeResults } from "reading-time"

  export default function readingTime(text: string, options?: Options): ReadTimeResults
}
