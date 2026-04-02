'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

export default function Chat() {
  const [input, setInput] = useState('');
  const [showWelcome, setShowWelcome] = useState(true);
  const { messages, sendMessage } = useChat();

  return (
    <div className="flex flex-col w-full max-w-2xl py-24 mx-auto stretch">
      {showWelcome && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold mb-3 text-gray-900">You are the Interviewer</h2>
            <p className="text-gray-600 mb-5 leading-relaxed">
              In this session, you play the role of the interviewer. Ask Kamar anything — about
              his background, technical skills, experience, or past projects. He'll respond
              as the candidate.
            </p>
            <ul className="text-sm text-gray-500 mb-6 space-y-1 list-disc list-inside">
              <li>Ask technical questions to probe depth of knowledge</li>
              <li>Follow up on answers to dig deeper</li>
              <li>Evaluate responses as you would in a real interview</li>
            </ul>
            <button
              className="w-full bg-black text-white rounded-lg py-2.5 font-medium hover:bg-gray-800 transition-colors"
              onClick={() => setShowWelcome(false)}
            >
              Start Interview
            </button>
          </div>
        </div>
      )}
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
