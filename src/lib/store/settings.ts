import { writable } from 'svelte/store';

export const settings = writable({
  theme: 'light',
  apiKey: '',
  apiEndpoint: 'http://localhost:1337',
  model: 'gpt-4',
});
