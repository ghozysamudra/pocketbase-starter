import { page } from 'vitest/browser';
import { describe, expect, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import Login from './+page.svelte';

// Mock SvelteKit's navigation module
vi.mock('$app/navigation', () => ({
	goto: vi.fn(),
}));

// Mock PocketBase SDK calls
vi.mock('$lib/pocketbase.js', () => {
	return {
		pb: {
			collection: vi.fn().mockReturnValue({
				authWithPassword: vi.fn().mockImplementation(async (email, password) => {
					if (email === 'test@example.com' && password === 'correct-password') {
						return { token: 'mock-token', record: { email } };
					}
					throw new Error('Invalid credentials');
				}),
			}),
			authStore: {
				model: null,
				onChange: vi.fn(),
				clear: vi.fn(),
			},
		},
	};
});

describe('Login Page Component', () => {
	it('should render email and password input fields', async () => {
		render(Login);

		// Expect the card header text to be visible
		await expect.element(page.getByText('Welcome back')).toBeInTheDocument();

		// Expect the input fields to be visible
		await expect.element(page.getByLabelText('Email address')).toBeInTheDocument();
		await expect.element(page.getByLabelText('Password')).toBeInTheDocument();

		// Expect the sign-in button to be visible
		await expect.element(page.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
	});

	it('should allow typing email and password', async () => {
		render(Login);

		const emailInput = page.getByLabelText('Email address');
		const passwordInput = page.getByLabelText('Password');

		await emailInput.fill('user@example.com');
		await passwordInput.fill('password123');

		await expect.element(emailInput).toHaveValue('user@example.com');
		await expect.element(passwordInput).toHaveValue('password123');
	});
});
