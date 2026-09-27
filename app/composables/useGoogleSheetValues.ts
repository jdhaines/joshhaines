interface GoogleSheetValuesResponse {
  values?: unknown[][]
}

export function useGoogleSheetValues(range: string) {
  const config = useRuntimeConfig()
  const sheetId = config.public.googleSheetId
  const apiKey = config.public.googleSheetsApiKey

  return useAsyncData(
    `google-sheet-values:${range}`,
    async () => {
      if (!sheetId) {
        throw new Error(
          "Google Sheets is not configured. Set NUXT_PUBLIC_GOOGLE_SHEET_ID."
        )
      }

      const encodedSheetId = encodeURIComponent(sheetId)
      const encodedRange = encodeURIComponent(range)
      const response = await $fetch<GoogleSheetValuesResponse>(
        `https://sheets.googleapis.com/v4/spreadsheets/${encodedSheetId}/values/${encodedRange}`,
        {
          query: {
            key: apiKey,
            majorDimension: "ROWS",
            valueRenderOption: "FORMATTED_VALUE",
            dateTimeRenderOption: "FORMATTED_STRING",
          },
        }
      )

      return response.values ?? []
    },
    {
      default: () => [],
      server: false,
    }
  )
}
