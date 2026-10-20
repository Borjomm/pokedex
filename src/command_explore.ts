import { exploreSchema, indexSchema } from "./schemas.js";
import type { State, StateBody } from "./state.js";
import type { Location } from "./pokeapi.js";
import { askYN, getRandomInt, floorToMultiple } from "./utils.js";

async function getLocNameByIndex(state: State, index: number): Promise<string> {
    const ld = state.body.loc_data;
    if (index > ld.count || index <= 0) {
        throw new Error(`index ${index} not within 1-${ld.count}`);
    }
    index--;
    const offset = floorToMultiple(index, ld.limit);
    const currentLoc = await state.api.fetchLocations(offset, ld.limit);
    return currentLoc.results[index - offset].name;
}

async function getRandomLocArea(state: State, global: boolean, page_num?: number): Promise<string> {
    console.log("Rolling dice...");
    const ld = state.body.loc_data;
    if (!global) {
        const page = page_num ?? ld.currentPage;
        const offset = (page - 1) * ld.limit;
        const currentLoc = await state.api.fetchLocations(offset, ld.limit); // most likely a cache hit
        return currentLoc.results[getRandomInt(0, currentLoc.results.length - 1)].name;
    } else {
        const randIndex = getRandomInt(1, ld.count);
        return await getLocNameByIndex(state, randIndex);
    }
}

function printPokemon(loc: Location, stateBody: StateBody) {
    const encounters = loc.pokemon_encounters;
    if (!encounters.length) {
        console.log("No Pokemon found");
        return;
    }
    console.log(`Found ${encounters.length} Pokemon:`);

    encounters.forEach((entry, i) => {
        const name = entry.pokemon.name;
        stateBody.seenPokemon[name] = {};
        console.log(` ${i+1}: ${name}${(name in stateBody.scannedPokemon) ? " (scanned)" : ""}`);
    });
}

export async function explore(state: State, args: string[]) {
    let choice: string;
    if (args.length < 2) {
        const answer = await askYN(state.rl, `You haven't selected a destination. Do you want to explore a random location from the current map page (${state.body.loc_data.currentPage})?`);
        if (answer) {
            choice = await getRandomLocArea(state, false);
        } else {
            return;
        }
    } else {
        const argument = exploreSchema.parse(args[1]);
        if (typeof argument === "number") {
            choice = await getLocNameByIndex(state, argument);
        } else if (argument === "random") {
            if (args.length >= 3) {
                const pageNum = indexSchema.safeParse(args[2]);
                if (!pageNum.success || pageNum.data > state.body.loc_data.maxPages) {
                    const answer = await askYN(state.rl, `Invalid page number (expected 1-${state.body.loc_data.maxPages}). Explore randomly?`);
                    if (answer) {
                        choice = await getRandomLocArea(state, true);
                    } else {
                        return;
                    }
                } else {
                choice = await getRandomLocArea(state, false, pageNum.data);
                }
            } else {
            choice = await getRandomLocArea(state, true);
            }

        } else {
            choice = argument;
        }
    }
    console.log(`Exploring ${choice}...`);
    const location = await state.api.fetchLocation(choice);
    state.body.lastExplored = location;
    printPokemon(location, state.body);

}