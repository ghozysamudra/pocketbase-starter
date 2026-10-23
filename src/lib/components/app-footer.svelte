<script lang="ts">
	import { cn } from '#lib/utils.js';
	import { APP_VERSION, GITHUB_REPO_URL } from '#lib/app-info.js';

	let { class: className = '' }: { class?: string } = $props();
</script>

<footer
	class={cn(
		'flex w-full flex-col items-center justify-between gap-2 border-t border-border/40 pt-4 text-xs text-muted-foreground sm:flex-row',
		className
	)}
>
	<p>
		PocketBase Starter
		<span class="font-mono text-foreground/70">v{APP_VERSION}</span>
	</p>

	<a
		href={GITHUB_REPO_URL}
		target="_blank"
		rel="noreferrer"
		class="inline-flex items-center gap-1.5 transition-colors hover:text-foreground"
		aria-label="View the source on GitHub"
	>
		<svg
			viewBox="0 0 24 24"
			aria-hidden="true"
			class="h-3.5 w-3.5 fill-current"
		>
			<path
				d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2.17c-3.2.7-3.87-1.36-3.87-1.36-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.69 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.2-1.49 3.18-1.18 3.18-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.42-2.69 5.39-5.25 5.68.41.35.78 1.05.78 2.12v3.14c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z"
			/>
		</svg>
		<span>GitHub</span>
	</a>
</footer>
