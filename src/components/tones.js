// Colour tones cycled across chips, cards and headings (classes defined in index.css).
export const TONES = ['tone-blue', 'tone-purple', 'tone-teal', 'tone-pink', 'tone-amber'];

export const toneAt = (index) => TONES[index % TONES.length];
