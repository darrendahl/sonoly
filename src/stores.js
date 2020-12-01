import { writable } from "svelte/store";

export const sessions = writable([]);

export const listeners = writable([]);

export const broadcastStatus = writable(false);
