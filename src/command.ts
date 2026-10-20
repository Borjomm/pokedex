import type { State, StateBody } from "./state.js";
import * as command from "./command_impl.js";
import { map } from "./command_map.js";
import { db } from "./command_db.js";
import { exit_cli } from "./command_exit.js";
import {explore} from "./command_explore.js";
import { scan } from "./command_scan.js";
import { inspect } from "./command_inspect.js";
import { pokedex } from "./command_pokedex.js";

export type CLIName = 'exit' | 'help' | 'map' | 'explore' | 'scan' | 'db' | 'inspect' | 'pokedex';

export type CLICommand = {
  name: CLIName;
  description: () => string;
  callback: (state: State, args: string[]) => Promise<void>;
};

export function getCommands(body: StateBody): Record<CLIName, CLICommand> {
  return {
    exit: {
      name: "exit",
      description: () => "Exit the program",
      callback: exit_cli,
    },
    help: {
        name: "help",
        description: () => "Display a help message",
        callback: command.help,
    },
    map: {
      name: "map",
      description: () => `Displays ${body.loc_data.limit} location areas. Usage: map <prev|next|info|limit|page_num>`,
      callback: map,
    },
    explore: {
      name: "explore",
      description: () => "Displays all pokemon in selected area. Usage: explore <entry_num|entry_name|random>",
      callback: explore,
    },
    scan: {
      name: "scan",
      description: () => "Scans pokemon in the current area. Usage: scan <pokemon_name|index|random|all>",
      callback: scan,
    },
    db: {
      name: "db",
      description: () => `Displays ${body.pokemon_data.limit} pokemons. Usage: db <prev|next|info|limit|page_num>`,
      callback: db,
    },
    inspect: {
      name: "inspect",
      description: () => `Displays details of a scanned pokemon. Usage: inspect <gameId|name>`,
      callback: inspect,
    },
    pokedex: {
      name: "pokedex",
      description: () => `Displays all of the pokemon you have scanned`,
      callback: pokedex,
    }
    // can add more commands here
  };
}