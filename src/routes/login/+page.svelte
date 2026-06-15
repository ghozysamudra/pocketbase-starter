<script lang="ts">
	import { pb } from '$lib/pocketbase.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { goto } from '$app/navigation';
	import { Mail, Lock, LogIn, AlertCircle } from '@lucide/svelte';

	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let errorMessage = $state('');

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		isLoading = true;
		errorMessage = '';

		try {
			// PocketBase password authentication
			await pb.collection('users').authWithPassword(email, password);
			
			// Redirect to dashboard on success
			await goto('/dashboard');
		} catch (error: any) {
			console.error('Login error:', error);
			errorMessage = error?.message || 'Invalid email or password. Please try again.';
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - PocketBase App</title>
	<meta name="description" content="Sign in to your account" />
</svelte:head>

<div class="relative flex min-h-[85vh] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden bg-background">
	<!-- Decorative Background Gradients -->
	<div class="absolute -top-40 -right-40 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-3xl"></div>
	<div class="absolute -bottom-40 -left-40 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl"></div>

	<Card.Root class="w-full max-w-md border-border/40 bg-card/60 backdrop-blur-md shadow-2xl transition-all duration-300 hover:shadow-primary/5">
		<Card.Header class="space-y-1 text-center">
			<Card.Title class="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">Welcome back</Card.Title>
			<Card.Description class="text-muted-foreground">
				Enter your email and password to sign in to your account
			</Card.Description>
		</Card.Header>

		<form onsubmit={handleLogin}>
			<Card.Content class="grid gap-4">
				{#if errorMessage}
					<div class="flex items-center gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
						<AlertCircle class="h-5 w-5 shrink-0" />
						<p>{errorMessage}</p>
					</div>
				{/if}

				<div class="grid gap-2">
					<Label for="email" class="text-sm font-medium">Email address</Label>
					<div class="relative">
						<Mail class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							id="email"
							type="email"
							placeholder="name@example.com"
							bind:value={email}
							class="pl-10 h-10"
							required
							disabled={isLoading}
						/>
					</div>
				</div>

				<div class="grid gap-2">
					<div class="flex items-center justify-between">
						<Label for="password" class="text-sm font-medium">Password</Label>
					</div>
					<div class="relative">
						<Lock class="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
						<Input
							id="password"
							type="password"
							placeholder="••••••••"
							bind:value={password}
							class="pl-10 h-10"
							required
							disabled={isLoading}
						/>
					</div>
				</div>
			</Card.Content>

			<Card.Footer class="flex flex-col gap-4">
				<Button type="submit" class="w-full h-10 font-semibold transition-transform duration-200 active:scale-[0.98]" disabled={isLoading}>
					{#if isLoading}
						<span class="inline-flex items-center gap-2">
							<!-- Spinner -->
							<svg class="h-4 w-4 animate-spin text-current" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Signing in...
						</span>
					{:else}
						<span class="inline-flex items-center gap-2">
							<LogIn class="h-4 w-4" />
							Sign In
						</span>
					{/if}
				</Button>

				<div class="text-center text-sm text-muted-foreground">
					Don't have an account?{' '}
					<a href="/signup" class="font-medium text-primary hover:underline underline-offset-4">
						Sign up
					</a>
				</div>
			</Card.Footer>
		</form>
	</Card.Root>
</div>
