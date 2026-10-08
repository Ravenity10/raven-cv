import { contact, profile } from '../data/profile.js';

const TOAST_EVENT = 'app:toast';

export function showToast(message) {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: message }));
}

export function onToast(handler) {
  const listener = (event) => handler(event.detail);
  window.addEventListener(TOAST_EVENT, listener);
  return () => window.removeEventListener(TOAST_EVENT, listener);
}

// Clipboard API where available; a hidden textarea + execCommand for older or non-secure contexts.
async function writeText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement('textarea');
  field.value = text;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;opacity:0;pointer-events:none';
  document.body.append(field);
  field.select();
  const ok = document.execCommand('copy');
  field.remove();
  if (!ok) throw new Error('copy failed');
}

export async function copyEmail() {
  try {
    await writeText(profile.email);
    showToast(contact.copiedToast);
    return true;
  } catch {
    showToast(contact.copyFailedToast);
    return false;
  }
}
