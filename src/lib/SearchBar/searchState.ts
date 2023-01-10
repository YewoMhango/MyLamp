import { writable } from "svelte/store";

import type { SearchResult } from "./performSearch";

export const searchResults = writable<Array<SearchResult> | null>(null);
