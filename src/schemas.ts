import { z } from "zod";

export const limitRange = {
  min: 5,
  max: 100,
}

export const indexSchema = z.coerce.number().int().min(1);
export const idSchema = z.coerce.number().int().min(0);
export const limitSchema = z.coerce.number().int().min(limitRange.min).max(limitRange.max);
export const nameSchema = z.string().min(1).regex(/^[a-z0-9-]+$/, "Invalid characters in the input string").refine(
    (val) => Number.isNaN(Number(val)), {
        message: "name cannot be numeric",
    }
);

export const mapArgsSchema = z.enum(["next", "prev", "info", "limit"])


export const mapSchema = z.union([
    mapArgsSchema,
    indexSchema,
  ],
  {
    error: "expected 'next', 'prev', 'info' or a whole positive number",
  }
);

export const exploreSchema = z.union([
    indexSchema,
    nameSchema,
  ],
  {
    error: "expected name or positive enumerator",
  }
);

export const pokemonInspectSchema = z.union([
  idSchema,
  nameSchema,
],
{
  error: "expected name or in-game id",
});