import { z } from "zod";
import type { Interface } from "readline/promises";

export function logError(err: any) {
    if (err instanceof z.ZodError) {
    console.log(`Error: ${err.issues.map((i) => i.message).join(", ")}`);
    } else if (err instanceof Error) {
        console.log(`Error: ${err.message}`);
    } else {
        console.log(`Unknown error: ${err}`);
    }
}

export async function askYN(rl: Interface, question: string): Promise<boolean> {
    const answer = (await rl.question(`${question} (y/n): `)).trim().toLowerCase();
    return (answer === 'y' || answer === "yes");
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function floorToMultiple(value: number, n: number): number {
  return Math.floor(value / n) * n;
}