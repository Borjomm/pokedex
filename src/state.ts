import { createInterface, type Interface } from "readline/promises";
import { CLICommand, CLIName, getCommands } from "./command.js";
import { exit_inner } from "./command_exit.js";
import { PokeAPI, Location, Pokemon, ShallowData } from "./pokeapi.js";


export async function getPageEnumeration(fetchFunc: (offset: number, limit: number) => Promise<ShallowData>, existingLd?: EndpointMetadata, newLimit?: number): Promise<EndpointMetadata> {
    let currentPage = 1;
    let limit = existingLd?.limit || 20;
    let count = existingLd?.count ?? undefined;
    

    if (existingLd && newLimit) {
        const currentFirst = (existingLd.currentPage - 1) * existingLd.limit + 1;
        currentPage = Math.floor((currentFirst - 1) / newLimit) + 1;
        limit = newLimit;
    } 

    if (!count) {
        const locations = await fetchFunc(0, limit);
        count = locations.count;
    }

    const maxPages = Math.ceil(count / limit);
    
    return {
        currentPage,
        maxPages,
        count,
        limit,
    }

}

export async function initState(): Promise<State> {
    const rl = createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: "Pokedex > ",
    });

    const api = new PokeAPI();
    const scannedPokemon: PokemonDB = {};
    const [loc_data, pokemon_data] = await Promise.all([
        getPageEnumeration(api.fetchLocations.bind(api)), 
        getPageEnumeration(api.fetchPokemonShallow.bind(api)),
    ]).catch((err) => exit_inner(undefined, err));

    const body = {
        loc_data,
        pokemon_data,
        scannedNum: 0,
        scannedPokemon: {},
        seenPokemon: {},
        lastScanned: undefined,
    };

    const commands = getCommands(body);
    return {
        rl,
        commands,
        api,
        body,
    };
}

export type EndpointMetadata = {
    currentPage: number;
    readonly maxPages: number;
    readonly count: number;
    readonly limit: number;
}

export type State = {
    rl: Interface;
    commands: Record<CLIName, CLICommand>;
    api: PokeAPI;
    body: StateBody;
}

export type StateBody = {
    loc_data: EndpointMetadata;
    pokemon_data: EndpointMetadata;
    scannedNum: number;
    scannedPokemon: PokemonDB;
    seenPokemon: ExaminedPokemon;
    lastExplored?: Location;
    lastScanned?: Pokemon;
}

export type PokemonDB = Record<string, Pokemon>;
export type ExaminedPokemon = Record<string, {}>;