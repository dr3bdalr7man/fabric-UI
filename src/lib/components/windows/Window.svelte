<script lang="ts">
  import { onMount } from 'svelte';
  import { history } from '$lib/store/history';
  import { favorites } from '$lib/store/favorites';
  import { settings } from '$lib/store/settings';

  let patterns: any[] = [];
  let strategies: any[] = [];
  let selectedPattern: any = null;
  let activeTab: 'patterns' | 'favorites' | 'settings' | 'history' = 'patterns';
  let output = '';

  onMount(async () => {
    const patternsResponse = await fetch('/data/pattern_descriptions.json');
    const patternsData = await patternsResponse.json();
    patterns = patternsData.patterns;

    const strategiesResponse = await fetch('/static/strategies/strategies.json');
    strategies = await strategiesResponse.json();

    const savedSettings = localStorage.getItem('settings');
    if (savedSettings) {
      settings.set(JSON.parse(savedSettings));
    }

    settings.subscribe((value) => {
      localStorage.setItem('settings', JSON.stringify(value));
    });
  });

  function selectPattern(pattern: any) {
    selectedPattern = pattern;
  }

  function runPattern() {
    const newHistoryEntry = {
      pattern: selectedPattern,
      input: (document.getElementById('input') as HTMLTextAreaElement).value,
      output: 'This is a sample output.',
      timestamp: new Date().toLocaleString(),
    };
    history.update((h) => [newHistoryEntry, ...h]);
    output = newHistoryEntry.output;
  }

  function toggleFavorite(pattern: any) {
    favorites.update((f) => {
      if (f.includes(pattern)) {
        return f.filter((p) => p !== pattern);
      } else {
        return [...f, pattern];
      }
    });
  }
</script>

<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg w-full max-w-4xl mx-auto my-8">
  <div class="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-700 rounded-t-lg">
    <div class="flex items-center space-x-2">
      <span class="w-3 h-3 bg-red-500 rounded-full"></span>
      <span class="w-3 h-3 bg-yellow-500 rounded-full"></span>
      <span class="w-3 h-3 bg-green-500 rounded-full"></span>
    </div>
    <div class="text-sm font-semibold">Fabric AI</div>
    <div></div>
  </div>

  <div class="flex border-b border-gray-200 dark:border-gray-600">
    <button
      class="px-4 py-2 text-sm font-medium"
      class:border-b-2="{activeTab === 'patterns'}"
      class:border-blue-500="{activeTab === 'patterns'}"
      class:text-blue-500="{activeTab === 'patterns'}"
      on:click={() => (activeTab = 'patterns')}
    >
      Patterns
    </button>
    <button
      class="px-4 py-2 text-sm font-medium"
      class:border-b-2="{activeTab === 'favorites'}"
      class:border-blue-500="{activeTab === 'favorites'}"
      class:text-blue-500="{activeTab === 'favorites'}"
      on:click={() => (activeTab = 'favorites')}
    >
      Favorites
    </button>
    <button
      class="px-4 py-2 text-sm font-medium"
      class:border-b-2="{activeTab === 'settings'}"
      class:border-blue-500="{activeTab === 'settings'}"
      class:text-blue-500="{activeTab === 'settings'}"
      on:click={() => (activeTab = 'settings')}
    >
      Settings
    </button>
    <button
      class="px-4 py-2 text-sm font-medium"
      class:border-b-2="{activeTab === 'history'}"
      class:border-blue-500="{activeTab === 'history'}"
      class:text-blue-500="{activeTab === 'history'}"
      on:click={() => (activeTab = 'history')}
    >
      History
    </button>
  </div>

  <div class="p-4">
    {#if activeTab === 'patterns'}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 class="text-lg font-semibold mb-2">Patterns</h2>
          <div class="mb-4">
            <input type="text" placeholder="Search patterns..." class="w-full p-2 border rounded-lg" />
          </div>
          <ul class="space-y-2 h-64 overflow-y-auto">
            {#each patterns as pattern}
              <li
                class="p-2 rounded-lg cursor-pointer flex justify-between items-center"
                class:bg-blue-100="{selectedPattern === pattern}"
                class:dark:bg-blue-900="{selectedPattern === pattern}"
                on:click={() => selectPattern(pattern)}
              >
                {pattern.patternName}
                <button
                  class="text-yellow-500"
                  on:click|stopPropagation={() => toggleFavorite(pattern)}
                >
                  {$favorites.includes(pattern) ? '★' : '☆'}
                </button>
              </li>
            {/each}
          </ul>
        </div>
        <div>
          {#if selectedPattern}
            <h2 class="text-lg font-semibold mb-2">{selectedPattern.patternName}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400 mb-4">
              {selectedPattern.description}
            </p>
            <div>
              <label for="input" class="block text-sm font-medium mb-1">Input</label>
              <textarea id="input" class="w-full h-32 p-2 border rounded-lg"></textarea>
            </div>
            <div class="mt-4">
              <button class="btn variant-filled-primary" on:click={runPattern}>Run</button>
            </div>
            <div class="mt-4">
              <label for="output" class="block text-sm font-medium mb-1">Output</label>
              <textarea id="output" class="w-full h-32 p-2 border rounded-lg" readonly bind:value={output}></textarea>
            </div>
          {:else}
            <div class="flex items-center justify-center h-full text-gray-500">
              Select a pattern to see details
            </div>
          {/if}
        </div>
      </div>
    {:else if activeTab === 'favorites'}
      <div>
        <h2 class="text-lg font-semibold mb-2">Favorites</h2>
        <ul class="space-y-2 h-64 overflow-y-auto">
          {#each $favorites as pattern}
            <li
              class="p-2 rounded-lg cursor-pointer flex justify-between items-center"
              class:bg-blue-100="{selectedPattern === pattern}"
              class:dark:bg-blue-900="{selectedPattern === pattern}"
              on:click={() => selectPattern(pattern)}
            >
              {pattern.patternName}
              <button
                class="text-yellow-500"
                on:click|stopPropagation={() => toggleFavorite(pattern)}
              >
                {$favorites.includes(pattern) ? '★' : '☆'}
              </button>
            </li>
          {/each}
        </ul>
      </div>
    {:else if activeTab === 'settings'}
      <div>
        <h2 class="text-lg font-semibold mb-2">Settings</h2>
        <div class="space-y-4">
          <div>
            <label for="theme" class="block text-sm font-medium mb-1">Theme</label>
            <select id="theme" class="w-full p-2 border rounded-lg" bind:value={$settings.theme}>
              <option>Light</option>
              <option>Dark</option>
            </select>
          </div>
          <div>
            <label for="apiKey" class="block text-sm font-medium mb-1">API Key</label>
            <input type="password" id="apiKey" class="w-full p-2 border rounded-lg" bind:value={$settings.apiKey} />
          </div>
          <div>
            <label for="apiEndpoint" class="block text-sm font-medium mb-1">API Endpoint</label>
            <input type="text" id="apiEndpoint" class="w-full p-2 border rounded-lg" bind:value={$settings.apiEndpoint} />
          </div>
          <div>
            <label for="model" class="block text-sm font-medium mb-1">Model</label>
            <select id="model" class="w-full p-2 border rounded-lg" bind:value={$settings.model}>
              <option>gpt-4</option>
              <option>gpt-3.5-turbo</option>
            </select>
          </div>
        </div>
      </div>
    {:else if activeTab === 'history'}
      <div>
        <h2 class="text-lg font-semibold mb-2">History</h2>
        <ul class="space-y-4">
          {#each $history as item}
            <li class="p-4 rounded-lg bg-gray-100 dark:bg-gray-700">
              <div class="flex justify-between">
                <div class="font-semibold">Pattern: {item.pattern.patternName}</div>
                <div class="text-sm text-gray-500 dark:text-gray-400">{item.timestamp}</div>
              </div>
              <div class="mt-2">
                <div class="text-sm font-medium">Input</div>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.input}</p>
              </div>
              <div class="mt-2">
                <div class="text-sm font-medium">Output</div>
                <p class="text-sm text-gray-600 dark:text-gray-300 mt-1">{item.output}</p>
              </div>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</div>
