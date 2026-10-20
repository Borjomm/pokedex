import type { State } from "./state.js";

export async function help(state: State) {
    console.log("\nWelcome to the Pokedex!\nUsage:")
    for (const command of Object.values(state.commands)) {
        console.log(`${command.name}: ${command.description()}`);
    }
}

