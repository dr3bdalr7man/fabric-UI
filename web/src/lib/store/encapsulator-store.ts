import { writable } from 'svelte/store';

export interface EncapsulatorField {
  name: string;
  label: string;
  type: 'text' | 'url' | 'textarea';
}

export interface EncapsulatorPattern {
  patternName: string;
  description?: string;
  fields: EncapsulatorField[];
}

function createEncapsulatorStore() {
  const patterns = writable<EncapsulatorPattern[]>([]);
  const selected = writable<EncapsulatorPattern | null>(null);

  async function load() {
    try {
      const res = await fetch('/data/encapsulator_meta.json');
      const data = await res.json();
      patterns.set(data.patterns as EncapsulatorPattern[]);
    } catch (e) {
      console.error('Failed to load encapsulator meta', e);
    }
  }

  function select(name: string) {
    let chosen: EncapsulatorPattern | null = null;
    patterns.update(list => {
      chosen = list.find(p => p.patternName === name) || null;
      return list;
    });
    selected.set(chosen);
  }

  function reset() {
    selected.set(null);
  }

  return { patterns, selected, load, select, reset };
}

export const encapsulatorStore = createEncapsulatorStore();
