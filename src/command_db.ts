import type { PokeAPI} from "./pokeapi.js";
import { limitRange, limitSchema, mapSchema } from "./schemas.js";
import{ getPageEnumeration, type EndpointMetadata, type State, type StateBody } from "./state.js";


async function db_inner(api: PokeAPI, emd: EndpointMetadata, numPage: number, body: StateBody ) {
    const scanned = body.scannedPokemon;
    const offset = (numPage - 1) * emd.limit;
    let currentNum = offset + 1;
    const pokemons = await api.fetchPokemonShallow(offset, emd.limit);

    console.log(`Page ${numPage}/${emd.maxPages} (entries ${currentNum}-${offset+pokemons.results.length} of ${emd.count})`);
    for (const pokemon of pokemons.results) {
        if (pokemon.name in scanned) {
            console.log(`${currentNum}: ${pokemon.name} (scanned, id #${scanned[pokemon.name].id})`);
        } else if (pokemon.name in body.seenPokemon) {
            console.log(`${currentNum}: ${pokemon.name}`);
        }
        else {
            console.log(`${currentNum}: ???`);
        }
        currentNum++;
    }
}



export async function db(state: State, args: string[]) {
    const pd = state.body.pokemon_data;
        if (args.length < 2) {
            await db_inner(state.api, pd, pd.currentPage, state.body);
            return;
        }
        let page_num = pd.currentPage;
        const page_input = mapSchema.parse(args[1]);
        if (page_input === "info") {
            console.log(`db: ${pd.maxPages} pages, ${pd.count} entries in total`);
            return;
        }
        else if (page_input === "next") {
            if (++page_num > pd.maxPages) {
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
                console.log(`Current limit: ${pd.limit} entries. Type 'db limit <num>' to set a new limit (${limitRange.min}-${limitRange.max})`);
                return;
            } else {
                const newLimit = limitSchema.parse(args[2]);
                state.body.loc_data = await getPageEnumeration(state.api.fetchLocations.bind(state.api), state.body.loc_data, newLimit);
                console.log(`Set current limit to ${newLimit} entries. Current page: ${state.body.loc_data.currentPage}`);
                return;
            }   
        }
        else if ((page_num = page_input) > pd.maxPages) {
            console.log(`Enter page from 1 to ${pd.maxPages}`);
            return;
        }
        pd.currentPage = page_num;
        await db_inner(state.api, pd, page_num, state.body);
}