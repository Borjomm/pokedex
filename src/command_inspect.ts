import type { State } from "./state.js";
import type { Pokemon } from "./pokeapi.js";
import { pokemonInspectSchema } from "./schemas.js";

function print_pokemon(p: Pokemon) {
    console.log(`Name: ${p.name}\nHeight: ${p.height}\nWeight: ${p.weight}\nStats:`);
    for (const stat of p.stats) {
        console.log(`  -${stat.stat.name}: ${stat.base_stat}`);
    }
    console.log("Types:")
    for (const type of p.types) {
        console.log(`  - ${type.type.name}`);
    }
}


export async function inspect(state: State, args: string[]) {
    let choice: Pokemon;
    const scanned = state.body.scannedPokemon;
    if (args.length < 2)  {
        if (!state.body.lastScanned) {
            console.log("No last pokemon found");
            return;
        } else {
            choice = state.body.lastScanned;
        }
    } else {
        const input = pokemonInspectSchema.parse(args[1]);
        if (typeof input === "number") {
            const found = Object.values(scanned).find((val) => val.id === input);
            if (!found) {
                console.log(`No pokemon with game id ${input} found`);
                return;
            }
            choice = found;
        } else {
            const found = scanned[input];
            if (!found) {
                console.log(`No pokemon with name ${input} found`);
                return;
            }
            choice = found;
        }
    }
    print_pokemon(choice)
}