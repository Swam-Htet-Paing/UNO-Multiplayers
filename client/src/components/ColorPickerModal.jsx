import React from 'react';

export default function ColorPickerModal({ isOpen, onSelectColor }) {
  if (!isOpen) return null;

  const colors = [
    { name: 'red', bg: 'bg-red-600 hover:bg-red-500', text: 'RED' },
    { name: 'blue', bg: 'bg-blue-600 hover:bg-blue-500', text: 'BLUE' },
    { name: 'green', bg: 'bg-emerald-600 hover:bg-emerald-500', text: 'GREEN' },
    { name: 'yellow', bg: 'bg-amber-500 hover:bg-amber-400', text: 'YELLOW' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-3xl p-6 shadow-2xl text-center space-y-5 animate-in fade-in zoom-in duration-150">
        <h3 className="text-xl font-black text-white tracking-wide">CHOOSE NEXT COLOR</h3>
        <p className="text-xs text-slate-400">Select the color to set for the active pile.</p>

        <div className="grid grid-cols-2 gap-4 pt-2">
          {colors.map((c) => (
            <button
              key={c.name}
              onClick={() => onSelectColor(c.name)}
              className={`${c.bg} h-24 rounded-2xl flex items-center justify-center font-black text-white text-lg tracking-widest shadow-lg transform hover:scale-105 active:scale-95 transition`}
            >
              {c.text}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}