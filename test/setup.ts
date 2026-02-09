import { Window } from 'happy-dom';

const window = new Window();
const document = window.document;

// @ts-ignore - Assign to global
globalThis.window = window;
// @ts-ignore - Assign to global
globalThis.document = document;
// @ts-ignore - Assign to global
globalThis.HTMLElement = window.HTMLElement;
// @ts-ignore - Assign to global
globalThis.Element = window.Element;
// @ts-ignore - Assign to global
globalThis.Event = window.Event;