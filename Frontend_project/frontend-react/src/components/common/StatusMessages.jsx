import React from 'react';

const StatusMessages = ({ error, success }) => {
  return (
    <div className="mb-4">
      {success && (
        <div className="bg-green-900/30 border border-green-700 text-green-300 px-4 py-2 rounded">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-900/30 border border-red-700 text-red-300 px-4 py-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
};

export default StatusMessages;
