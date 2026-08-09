import { ROOT_QUERIES } from "../../constants";

export const pickRootSearchQueries =(
	search: Record<string, unknown> 
): Partial<Record<typeof ROOT_QUERIES[number], unknown>> => {
	const searchQueriesMap: Partial<Record<typeof ROOT_QUERIES[number], unknown>> = {};
	
    for (const key of ROOT_QUERIES) {
        const value = search?.[key];
        
		searchQueriesMap[key] = value;
	}
	
    return searchQueriesMap;
}