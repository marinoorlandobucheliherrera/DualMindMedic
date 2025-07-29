// src/lib/db.ts
import Dexie, { type Table } from 'dexie';
import type { HistoryEntry } from '@/app/page';

export class MySubClassedDexie extends Dexie {
  history!: Table<HistoryEntry>; 

  constructor() {
    super('dualmindMedicDB');
    this.version(1).stores({
      history: '++id, timestamp, fileName, codingSystem, isReviewed' // Primary key and indexed props
    });
  }
}

export const db = new MySubClassedDexie();
