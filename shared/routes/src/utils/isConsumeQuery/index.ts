import { COUNSUME_QUERIES } from "../../constants";

export const isConsumeQuery = (query: string) => {
    return COUNSUME_QUERIES.some(consumeQuery => consumeQuery === query);
};