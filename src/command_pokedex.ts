import type { State } from "./state.js";

export async function pokedex(state: State) {
    const scanned = state.body.scannedPokemon;
    if (!state.body.scannedNum) {
        console.log("Your Pokedex is empty");
        return;
    }
    console.log("Your Pokedex:")
    for (const pokemon of Object.values(scanned)) {
        console.log(`  - ${pokemon.name} (id ${pokemon.id})`);
    }
}