export type LabelDataItem =
  | {
      type: string
      label: string
    }
  | string

export type DataItem = [Date, number] | [Date, number, number, number, number, number, number]

export type ChartData = LabelDataItem[] | DataItem
