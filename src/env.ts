import { defineEnvVars } from '@sveltejs/kit/env';

export const variables = defineEnvVars({
	PUBLIC_POCKETBASE_URL: {
		public: true,
		static: true,
		description: 'Base URL of the PocketBase backend.',
		// Fall back to the public PocketBase instance when no override is provided.
		schema: (value) => value || 'https://pocketbase.io'
	}
});
