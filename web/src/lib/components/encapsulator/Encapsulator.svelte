<script lang="ts">
  import { onMount } from 'svelte';
  import { Select } from '$lib/components/ui/select';
  import { Input } from '$lib/components/ui/input';
  import { Textarea } from '$lib/components/ui/textarea';
  import { Button } from '$lib/components/ui/button';
  import { encapsulatorStore, type EncapsulatorField } from '$lib/store/encapsulator-store';
  import { encapsulatorLogs } from '$lib/store/encapsulator-log-store';
  import { patternAPI } from '$lib/store/pattern-store';
  import { ChatService } from '$lib/services/ChatService';

  let output = '';
  let isRunning = false;

  let fieldValues: Record<string, string> = {};
  let selectedName = '';

  const chatService = new ChatService();

  onMount(async () => {
    await encapsulatorStore.load();
  });

  function handleSelect(name: string) {
    selectedName = name;
    encapsulatorStore.select(name);
    patternAPI.selectPattern(name);
    fieldValues = {};
  }

  async function runPattern() {
    if (!selectedName) return;
    const pattern = $encapsulatorStore.selected;
    const inputs = pattern?.fields.map(f => `${f.label}: ${fieldValues[f.name] || ''}`).join('\n');
    output = '';
    const start = Date.now();
    encapsulatorLogs.add(`Executing ${selectedName} at ${new Date(start).toLocaleTimeString()}`);
    isRunning = true;
    try {
      const stream = await chatService.streamPattern(inputs || '');
      await chatService.processStream(
        stream,
        (content) => output += content,
        (err) => encapsulatorLogs.add(`Error: ${err.message}`)
      );
      const end = Date.now();
      encapsulatorLogs.add(`Completed in ${((end - start)/1000).toFixed(1)}s`);
    } catch (e) {
      encapsulatorLogs.add(`Error: ${(e as Error).message}`);
    } finally {
      isRunning = false;
    }
  }

  function copyOutput() {
    navigator.clipboard.writeText(output);
  }

  function downloadOutput() {
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedName || 'output'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<div class="space-y-4 p-4">
  <div>
    <Select bind:value={selectedName} on:change={(e) => handleSelect(e.target.value)}>
      <option value="">Select pattern...</option>
      {#each $encapsulatorStore.patterns as p}
        <option value={p.patternName}>{p.patternName}</option>
      {/each}
    </Select>
  </div>

  {#if $encapsulatorStore.selected}
    <div class="space-y-2">
      <p class="text-sm text-muted-foreground">{$encapsulatorStore.selected.description}</p>
      {#each $encapsulatorStore.selected.fields as field}
        {#if field.type === 'textarea'}
          <Textarea bind:value={fieldValues[field.name]} placeholder={field.label} />
        {:else}
          <Input type={field.type} bind:value={fieldValues[field.name]} placeholder={field.label} />
        {/if}
      {/each}
    </div>
    <Button class="mt-2" disabled={isRunning} on:click={runPattern}>
      {isRunning ? 'Running...' : 'Run'}
    </Button>
  {/if}

  {#if output}
    <div class="bg-primary-800/30 p-3 rounded-lg space-y-2">
      <pre class="whitespace-pre-wrap">{output}</pre>
      <div class="flex gap-2">
        <Button variant="ghost" size="sm" on:click={copyOutput}>Copy</Button>
        <Button variant="ghost" size="sm" on:click={downloadOutput}>Download</Button>
      </div>
    </div>
  {/if}

  {#if $encapsulatorLogs.length}
    <div class="bg-primary-800/20 p-3 rounded-lg space-y-2">
      <div class="flex justify-between items-center">
        <h3 class="text-sm font-bold">Logs</h3>
        <Button variant="ghost" size="sm" on:click={() => encapsulatorLogs.clear()}>
          Clear
        </Button>
      </div>
      <ul class="text-xs space-y-1 max-h-40 overflow-auto">
        {#each $encapsulatorLogs as log}
          <li>{new Date(log.timestamp).toLocaleTimeString()} - {log.message}</li>
        {/each}
      </ul>
    </div>
  {/if}
</div>

<style>
  pre { white-space: pre-wrap; }
</style>
