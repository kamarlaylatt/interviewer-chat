'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch">
      <h1 className="text-xl font-bold mb-6">Interview Session</h1>
      {messages.map(message => (
        <div key={message.id} className="whitespace-pre-wrap mb-4">
          <span className="font-semibold">
            {message.role === 'user' ? 'Interviewer: ' : 'Kamar: '}
          </span>
          {message.parts.map((part, i) => {
            if (part.type === 'text') {
              return <span key={`${message.id}-${i}`}>{part.text}</span>;
            }
          })}
        </div>
      ))}

      <form
        className="fixed bottom-0 w-full max-w-2xl mb-8"
        onSubmit={e => {
          e.preventDefault();
          sendMessage({ text: input });
          setInput('');
        }}
      >
        <input
          className="w-full border border-gray-300 rounded p-2"
          value={input}
          placeholder="Ask the candidate a question..."
          onChange={e => setInput(e.currentTarget.value)}
        />
      </form>
    </div>
  );
}
