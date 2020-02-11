export interface Pojo {
  [key: string]:
    | string
    | number
    | boolean
    | null
    | Pojo
    | Date
    | (string | number | boolean | null | Pojo | Date)[];
}
