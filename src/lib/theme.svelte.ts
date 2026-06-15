import { browser } from '$app/environment';

export type Theme = 'light' | 'dark' | 'system';

class ThemeState {
	#theme = $state<Theme>('system');

	constructor() {
		if (browser) {
			const saved = localStorage.getItem('theme') as Theme | null;
			if (saved === 'light' || saved === 'dark' || saved === 'system') {
				this.#theme = saved;
			} else {
				this.#theme = 'system';
			}
			this.applyTheme();

			// Listen to system preference changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
				if (this.#theme === 'system') {
					this.applyTheme();
				}
			});
		}
	}

	get current() {
		return this.#theme;
	}

	set(newTheme: Theme) {
		this.#theme = newTheme;
		if (browser) {
			localStorage.setItem('theme', newTheme);
			this.applyTheme();
		}
	}

	applyTheme() {
		if (!browser) return;
		
		const isDark =
			this.#theme === 'dark' ||
			(this.#theme === 'system' &&
				window.matchMedia('(prefers-color-scheme: dark)').matches);

		if (isDark) {
			document.documentElement.classList.add('dark');
		} else {
			document.documentElement.classList.remove('dark');
		}
	}
}

export const themeState = new ThemeState();
