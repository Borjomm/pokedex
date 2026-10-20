import type { State } from "./state.js";
import { logError } from "./utils.js";

export function exit_inner(state?: State, err?: any): never {
    if (err) {
        logError(err);
    }
    console.log("Closing the Pokedex... Goodbye!");
    state?.rl.close();
    process.exit();
}

export async function exit_cli(state: State): Promise<never> {
    exit_inner(state);
}