import PocketBase from 'pocketbase';
import { PUBLIC_POCKETBASE_URL } from '$env/static/public';

// PocketBase client instance initialized with the environment variable URL
export const pb = new PocketBase(PUBLIC_POCKETBASE_URL);
