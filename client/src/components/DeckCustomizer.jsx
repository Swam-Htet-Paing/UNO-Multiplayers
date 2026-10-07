import React from 'react';

export default function DeckCustomizer({ currentTheme, onSelectTheme }) {
  const themes = [
    { id: 'classic', name: 'Classic Red/Slate' },
    { id: 'neon', name: 'Cyber Neon' },
    { id: 'dark', name: 'Midnight Onyx' }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white space-y-3">
      <h4 className="text-sm font-bold">Custom Card Theme</h4>
      <div className="flex space-x-2">
        {themes.map(t => (
          <button
            key={t.id}
            onClick={() => onSelectTheme(t.id)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
              currentTheme === t.id ? 'bg-indigo-600 border-indigo-400' : 'bg-slate-800 border-slate-700'
            }`}
          >
            {t.name}
          </button>
        ))}
      </div>
    </div>
  );
}