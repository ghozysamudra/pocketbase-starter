import { describe, it, expect } from 'vitest';
import { pb } from './pocketbase';
import PocketBase from 'pocketbase';

describe('PocketBase Client Initialization', () => {
	it('should initialize pb as an instance of PocketBase', () => {
		expect(pb).toBeInstanceOf(PocketBase);
	});

	it('should configure the client with the PocketBase URL', () => {
		// Verify that the baseUrl points to our configured environment URL
		expect(pb.baseURL).toBe('http://127.0.0.1:8090');
	});
});
