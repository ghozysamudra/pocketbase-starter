import { describe, it, expect } from 'vitest';
import { pb, PUBLIC_POCKETBASE_URL } from './pocketbase';
import PocketBase from 'pocketbase';

describe('PocketBase Client Initialization', () => {
	it('should initialize pb as an instance of PocketBase', () => {
		expect(pb).toBeInstanceOf(PocketBase);
	});

	it('should configure the client with the public PocketBase URL by default', () => {
		// The app defaults to the public PocketBase instance when no env override is set.
		expect(PUBLIC_POCKETBASE_URL).toBe('https://pocketbase.io');
		expect(pb.baseURL).toBe('https://pocketbase.io');
	});
});
