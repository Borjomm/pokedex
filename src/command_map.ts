import type { State, EndpointMetadata } from "./state.js";
import { getPageEnumeration } from "./state.js"
import type { PokeAPI, ShallowData } from "./pokeapi.js";
import { mapSchema, limitSchema, limitRange } from "./schemas.js";

async function map_inner(api: PokeAPI, emd: EndpointMetadata, numPage: number) {

    const offset = (numPage - 1) * emd.limit;
    let currentNum = offset + 1;
    const locations = await api.fetchLocations(offset, emd.limit);
    console.log(`Page ${numPage}/${emd.maxPages} (entries ${currentNum}-${offset+locations.results.length} of ${emd.count})`);
    for (const location of locations.results) {
        console.log(`${currentNum}: ${location.name}`);
        currentNum++;
    }
}

export async function map(state: State, args: string[]) {
    const ld = state.body.loc_data;
        if (args.length < 2) {
            await map_inner(state.api, ld, ld.currentPage);
            return;
        }
        let page_num = ld.currentPage;
        const page_input = mapSchema.parse(args[1]);
        if (page_input === "info") {
            console.log(`map: ${ld.maxPages} pages, ${ld.count} entries in total`);
            return;
        }
        else if (page_input === "next") {
            if (++page_num > ld.maxPages) {
            console.log("Already on last page");
            return;
        }}
        else if (page_input === "prev") {
            if (--page_num < 1) {
            console.log("Already on first page");
            return;
        }}
        else if (page_input === "limit") {
            if (args.length < 3) {
                console.log(`Current limit: ${ld.limit} entries. Type 'map limit <num>' to set a new limit (${limitRange.min}-${limitRange.max})`);
                return;
            } else {
                const newLimit = limitSchema.parse(args[2]);
                state.body.loc_data = await getPageEnumeration(state.api.fetchLocations.bind(state.api), state.body.loc_data, newLimit);
                console.log(`Set current limit to ${newLimit} entries. Current page: ${state.body.loc_data.currentPage}`);
                return;
            }   
        }
        else if ((page_num = page_input) > ld.maxPages) {
            console.log(`Enter page from 1 to ${ld.maxPages}`);
            return;
        }
        ld.currentPage = page_num;
        await map_inner(state.api, ld, page_num);
}