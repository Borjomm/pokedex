import type { State, PokemonDB, StateBody} from "./state.js";
import { exploreSchema } from "./schemas.js";
import { getRandomInt, askYN } from "./utils.js";

async function _scan_single(state: State, name: string) {
    console.log(`Scanning ${name}...`);
    const pokemon = await(state.api.fetchPokemon(name));
    state.body.scannedPokemon[pokemon.name] = pokemon;
    state.body.lastScanned = pokemon;
    state.body.scannedNum++;
    console.log(`${pokemon.name} (id ${pokemon.id}) added to Pokedex!`);
}

function _scan_helper(unscanned: string[]) {
    if (!unscanned.length) {
        console.log("All pokemon in this area are already scanned");
        return false;
    }
    return true;
}

export async function scan(state: State, args: string[]) {
    const location = state.body.lastExplored;
    const scanned = state.body.scannedPokemon;
    if (!location) {
        console.log("You are not in a Pokemon-habitable area yet. Use 'map' and 'explore' to enter an area first.");
        return;
    } else if (!location.pokemon_encounters.length) {
        console.log("No pokemon in the area to scan");
        return;
    }
    const allPokemon = location.pokemon_encounters.map((entry) => entry.pokemon.name);
    const unscannedPokemon = allPokemon.filter((entry) => !(entry in scanned));
    let choice: string | undefined = undefined;

    if (args.length < 2) {
        if (!_scan_helper(unscannedPokemon)) {
            return;
        }
        choice = unscannedPokemon[0];
    } else {
        const input = exploreSchema.parse(args[1]);
        if (typeof input === "number") {
            if (input > allPokemon.length) {
                throw new Error(`there are only ${allPokemon.length} pokemon in this area`);
            }
            choice = allPokemon[input - 1];
        } else if (input === "random") {
            if (!_scan_helper(unscannedPokemon)) {
                return;
            }
            choice = unscannedPokemon[getRandomInt(0, unscannedPokemon.length - 1)];
        } else if (input === "all") {
            if (!_scan_helper(unscannedPokemon)) {
                return;
            }
            if (unscannedPokemon.length > 5) {
                const answer = await askYN(state.rl, `About to scan ${unscannedPokemon.length} pokemon. Proceed?`);
                if (!answer) {
                    return;
                }
            }
            const results = await Promise.allSettled(unscannedPokemon.map(name => _scan_single(state, name)));
            const succeeded = results.filter(result => result.status === "fulfilled").length;
            const failed = results.length - succeeded;
            if (!failed) {
                console.log(`Successfully scanned all ${unscannedPokemon.length} pokemon in the area`);
            } else if (!succeeded) {
                throw new Error("scan failed. Are you sure your internet connection is on?")
            } else {
                console.log(`Scanned ${succeeded}/${results.length} Pokemon. ${failed} failed.`);
            }

            
            return;
        } else {
            if (!allPokemon.includes(input)) {
                throw new Error(`no pokemon with name ${input} found`);
            }
            choice = input;
        }
    }
    if (!unscannedPokemon.includes(choice)) {
        const answer = await askYN(state.rl, `${choice} already exists in the Pokedex. Rescan?`);
        if (!answer) {
            return;
        }
    }

    await _scan_single(state, choice);

}