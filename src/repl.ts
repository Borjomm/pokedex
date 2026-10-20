import { initState } from "./state.js";
import type { CLIName} from "./command.js";
import { logError } from "./utils.js";




export async function startREPL() {
    const state = await initState();
    state.rl.prompt();
    state.rl.on("line", async input => {
        const words = cleanInput(input);
        if (words) {
            const inputCommand = words[0];
            if (inputCommand in state.commands) {
                const command = state.commands[inputCommand as CLIName];
                if (words.length > 1 && words[1] === "help") {
                    console.log(command.description());
                } else {
                await state.commands[inputCommand as CLIName].callback(state, words).catch((err) => logError(err));
                }
            } else {
                console.log("Unknown command");
            }
        }
        state.rl.prompt();
    });

}

export function cleanInput(input: string): string[] {
    const trimmed = input.trim();
    if (!trimmed) {
        return [];
    }
    return trimmed.toLowerCase().split(/\s+/);
}