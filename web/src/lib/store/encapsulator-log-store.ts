import { writable } from 'svelte/store';

export interface EncapsulatorLog {
  message: string;
  timestamp: number;
}

function createEncapsulatorLogStore() {
  const stored: EncapsulatorLog[] = typeof localStorage !== 'undefined'
    ? JSON.parse(localStorage.getItem('encapsulatorLogs') || '[]')
    : [];

  const { subscribe, set, update } = writable<EncapsulatorLog[]>(stored);

  const persist = (logs: EncapsulatorLog[]) => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('encapsulatorLogs', JSON.stringify(logs));
    }
  };

  return {
    subscribe,
    add(message: string) {
      update(current => {
        const newLogs = [...current, { message, timestamp: Date.now() }];
        persist(newLogs);
        return newLogs;
      });
    },
    clear() {
      set([]);
      persist([]);
    }
  };
}

export const encapsulatorLogs = createEncapsulatorLogStore();
