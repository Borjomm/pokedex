import { Cache } from "./pokecache.js";

export class PokeAPI {
  private static readonly baseURL = "https://pokeapi.co/api/v2";
  private cache = new Cache(1000 * 60 * 5);

  constructor() {
  }

  async #fetch<T>(url: string): Promise<T> {
    const cache = this.cache.get<T>(url);
    if (cache) {
      // console.log(`(DEBUG) Cache hit! PID=${process.pid}, key=${url}`);
      return cache;
    }
    const response = await fetch(url, {
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      throw new Error(`fetch failed: ${response.statusText} (code ${response.status})`);
    }
    const data = await response.json() as T;
    this.cache.add<T>(url, data);
    return data;
  }

  async fetchLocations(offset: number, limit: number): Promise<ShallowData> {
    const url = `${PokeAPI.baseURL}/location-area/?offset=${offset}&limit=${limit}`;
    return this.#fetch(url);
  }

  async fetchPokemonShallow(offset: number, limit: number): Promise<ShallowData> {
    const url = `${PokeAPI.baseURL}/pokemon/?offset=${offset}&limit=${limit}`;
    return this.#fetch(url);
  }

  async fetchPokemonLocation(pokemonName: string): Promise<PokemonLocations> {
    const url = `${PokeAPI.baseURL}/pokemon/${pokemonName}/encounters`;
    return this.#fetch(url);
  }

  async fetchLocation(locationName: string): Promise<Location> {
    const url = `${PokeAPI.baseURL}/location-area/${locationName}`;
    return this.#fetch(url);
  }

  async fetchPokemon(pokemonName: string): Promise<Pokemon> {
    const url = `${PokeAPI.baseURL}/pokemon/${pokemonName}`;
    return this.#fetch(url);
  }
}

export type ShallowData = {
  count: number,
  next: string | null,
  previous: string | null,
  results: {
    name: string;
    url: string;
  }[],

};

export type Location = {
  id: number;
  name: string;
  game_index: number;
  location: {
    name: string;
    url: string;
  }
  pokemon_encounters: {
    pokemon: {
      name: string;
      url: string;
    }
  }[];
};

export type Pokemon = {
  id: number,
  name: string,
  base_experience: number,
  height: number,
  is_default: boolean,
  order: number,
  weight: number,
  stats: Stats[],
  types: Types[],
}

export type PokemonLocations = {
  location_area: {
    name: string,
    url: string,
  },
}[]

type Stats = {
  base_stat: number,
  effort: number,
  stat: {
    name: string,
    url: string,
  }
}

type Types = {
  slot: number,
  type: {
    name: string,
    url: string,
  }
}