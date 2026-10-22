import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$app/env/public';

// PocketBase client instance initialized with the public instance by default.
export { PUBLIC_POCKETBASE_URL };
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
