import { QUERIES } from "../constants";

// export type GeneralSearchParams = Partial<Record<typeof GENERAL_QUERIES[number], string>>;
export type QueriesKeys = keyof typeof QUERIES;
