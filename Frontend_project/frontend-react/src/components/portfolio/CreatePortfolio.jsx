import React, { useState } from 'react';

const CreatePortfolio = ({ onCreate }) => {
  const [name, setName] = useState('');
  const [initialCash, setInitialCash] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name, parseFloat(initialCash) || 0);
    setName('');
    setInitialCash('');
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg border border-slate-700 mt-4">
      <h2 className="text-lg font-bold mb-4 text-white">Create New Portfolio</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          type="text"
          placeholder="Portfolio Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-900 text-white p-2 rounded"
        />
        <input
          type="number"
          placeholder="Initial Cash"
          value={initialCash}
          onChange={(e) => setInitialCash(e.target.value)}
          className="w-full bg-slate-900 text-white p-2 rounded"
        />
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded">
          Create Portfolio
        </button>
      </form>
    </div>
  );
};

export default CreatePortfolio;
