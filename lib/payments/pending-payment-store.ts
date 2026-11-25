"use client";

import * as React from "react";

/**
 * A charge that succeeded but whose confirmation failed must survive a
 * refresh: the reference is the only way to finish it without paying twice.
 */
const memory = new Map<string, string>();
const listeners = new Set<() => void>();

function notify() {
  for (const listener of listeners) listener();
}

export function readPendingPayment(key: string): string | null {
  if (memory.has(key)) return memory.get(key) ?? null;
  if (typeof window === "undefined") return null;

  try {
    const value = window.localStorage.getItem(key);
    if (value) memory.set(key, value);
    return value;
  } catch {
    return null;
  }
}

export function writePendingPayment(key: string, value: string) {
  memory.set(key, value);
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // In-memory copy still allows a retry in this tab.
  }
  notify();
}

export function clearPendingPayment(key: string) {
  memory.delete(key);
  try {
    window.localStorage.removeItem(key);
  } catch {
    // Ignore storage failures.
  }
  notify();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function usePendingPayment(key: string): string | null {
  return React.useSyncExternalStore(
    subscribe,
    () => readPendingPayment(key),
    () => null,
  );
}
