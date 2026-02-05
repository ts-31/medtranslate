import React, { useRef, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface Message {
  _id: string;
  sender_role: 'doctor' | 'patient';
  original_text?: string;
  translated_text?: string;
  audio_url?: string;
  created_at: string;
}

const Consultation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const bottomRef = useRef<HTMLDivElement>(null);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [currentRole, setCurrentRole] = useState<'doctor' | 'patient'>(location.state?.role || 'doctor');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Helper to ensure we have a conversation ID before sending anywhere
  const ensureConversationId = async (): Promise<string | null> => {
    if (conversationId) return conversationId;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/conversations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_language: 'English',
          patient_language: 'Spanish'
        })
      });
      const data = await res.json();
      setConversationId(data._id);
      return data._id;
    } catch (err) {
      console.error("Failed to init conversation", err);
      return null;
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTranslating]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const textToSend = inputText;
    setInputText('');
    setIsTranslating(true);

    // Lazy creation: get ID now if we don't have one
    const activeId = await ensureConversationId();
    if (!activeId) {
      setIsTranslating(false);
      alert("Failed to start conversation. Please try again.");
      return;
    }

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversation_id: activeId,
          sender_role: currentRole,
          text: textToSend
        })
      });
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const uploadAudioBlob = async (audioBlob: Blob) => {
    const activeId = await ensureConversationId();
    if (!activeId) {
      alert("Failed to start conversation. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append('conversation_id', activeId);
    formData.append('sender_role', currentRole);
    // Create a filename with correct extension (webm is standard for browser recording)
    const file = new File([audioBlob], "recording.webm", { type: 'audio/webm' });
    formData.append('file', file);

    setIsTranslating(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/messages/audio`, {
        method: 'POST',
        body: formData
      });
      const newMessage = await res.json();
      setMessages(prev => [...prev, newMessage]);
    } catch (err) {
      console.error("Failed to upload audio", err);
      alert("Failed to upload audio recording.");
    } finally {
      setIsTranslating(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        uploadAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("Could not access microphone. Please ensure permissions are granted.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background-light font-display text-slate-800">
      {/* Header */}
      <header className="flex-none bg-white border-b border-sage-100 px-6 py-4 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center size-10 rounded-full bg-sage-50 text-primary">
              <span className="material-symbols-outlined">medical_services</span>
            </div>
            <div>
              <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-slate-800">
                Consultation {conversationId ? `#${conversationId.slice(-4)}` : '...'}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              disabled={!conversationId}
              onClick={() => {
                if (window.confirm("End session and generate summary?")) {
                  // Navigate to summary with ID
                  navigate(`/summary?id=${conversationId}`);
                }
              }}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="material-symbols-outlined text-[20px]">call_end</span>
              <span className="text-sm font-bold">End Session</span>
            </button>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={() => setCurrentRole(prev => prev === 'doctor' ? 'patient' : 'doctor')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full pl-3 pr-4 transition-colors ${currentRole === 'doctor' ? 'bg-[#f0f2f4] hover:bg-gray-200' : 'bg-blue-100 border border-blue-200'}`}
          >
            <span className="material-symbols-outlined text-gray-700 text-[20px]">{currentRole === 'doctor' ? 'stethoscope' : 'person'}</span>
            <span className="text-sm font-medium text-gray-900">Role: {currentRole === 'doctor' ? 'Doctor' : 'Patient'}</span>
            <span className="material-symbols-outlined text-gray-500 text-[20px]">swap_horiz</span>
          </button>
          <button className="flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full bg-sage-50 border border-sage-200 pl-3 pr-4 transition-colors">
            <span className="material-symbols-outlined text-primary text-[20px]">translate</span>
            <span className="text-sm font-medium text-primary">Spanish <span className="text-gray-400 mx-1">↔</span> English</span>
            <span className="material-symbols-outlined text-primary text-[20px]">keyboard_arrow_down</span>
          </button>
          <div className="ml-auto flex items-center gap-2 text-xs font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Live Translation Active
          </div>
        </div>
      </header>

      {/* Chat Container */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-background-light">
        <div className="flex justify-center">
          <span className="text-xs font-medium text-gray-400 bg-gray-200 px-3 py-1 rounded-full">Session Started</span>
        </div>

        {messages.map((msg) => (
          <div key={msg._id} className={`flex items-end gap-3 max-w-3xl ${msg.sender_role === 'doctor' ? 'justify-end ml-auto' : ''}`}>
            {msg.sender_role === 'patient' && (
              <div className="flex items-center justify-center rounded-full size-8 sm:size-10 shrink-0 bg-blue-100 text-blue-600">
                <span className="material-symbols-outlined text-base">person</span>
              </div>
            )}

            <div className={`flex flex-col gap-1 items-${msg.sender_role === 'doctor' ? 'end' : 'start'}`}>
              <span className="text-xs text-gray-500 mx-1">{msg.sender_role === 'doctor' ? 'You (Doctor)' : 'Patient'}</span>

              {msg.audio_url ? (
                /* Audio Message */
                <div className="flex flex-col gap-2 rounded-2xl rounded-bl-none bg-white p-3 shadow-sm border border-sage-100 min-w-[280px]">
                  <audio controls src={msg.audio_url} className="w-full" />
                  <div className="mt-1 pt-2 border-t border-gray-100">
                    <p className="text-sm text-gray-800 font-medium">Original: [Audio]</p>
                  </div>
                </div>
              ) : (
                /* Text Message */
                <div className={`relative rounded-2xl ${msg.sender_role === 'doctor' ? 'rounded-br-none bg-primary text-white' : 'rounded-bl-none bg-white text-slate-800 border border-sage-100'} px-5 py-3.5 shadow-sm`}>
                  <p className="text-lg font-medium leading-snug">{msg.sender_role === 'doctor' ? msg.original_text : msg.translated_text}</p>
                  <div className={`mt-1 pt-2 border-t ${msg.sender_role === 'doctor' ? 'border-white/20' : 'border-gray-100'}`}>
                    <p className={`text-sm ${msg.sender_role === 'doctor' ? 'text-sage-100' : 'text-gray-500'} font-light italic`}>
                      {msg.sender_role === 'doctor'
                        ? `Translated: "${msg.translated_text}"`
                        : `Original: "${msg.original_text}"`
                      }
                    </p>
                  </div>
                </div>
              )}
            </div>

            {msg.sender_role === 'doctor' && (
              <div className="flex items-center justify-center rounded-full size-8 sm:size-10 shrink-0 bg-primary/20 text-primary">
                <span className="material-symbols-outlined text-base">stethoscope</span>
              </div>
            )}
          </div>
        ))}

        {
          isTranslating && (
            <div className="flex items-center gap-2 pt-2">
              <div className="flex items-center gap-1 rounded-full bg-gray-200 px-3 py-2">
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <span className="text-xs text-gray-500 ml-1 font-medium">Processing...</span>
              </div>
            </div>
          )
        }

        <div ref={bottomRef} className="h-4"></div>
      </main >

      {/* Input Area */}
      <footer className="bg-white border-t border-sage-100 p-4 sm:p-5">
        <div className="max-w-4xl mx-auto flex items-end gap-3">
          <div className="flex-1 bg-sage-50 rounded-2xl flex items-center p-2 border border-transparent focus-within:border-primary focus-within:ring-2 focus-within:ring-sage-200 transition-all">
            <textarea
              className="w-full bg-transparent border-none text-slate-800 placeholder-gray-500 focus:ring-0 resize-none max-h-32 py-2 px-3 leading-normal"
              placeholder={`Type a message as ${currentRole}...`}
              rows={1}
              style={{ minHeight: '44px' }}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            ></textarea>
            <button
              onClick={toggleRecording}
              className={`p-2 transition-colors rounded-full ${isRecording ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' : 'text-sage-600 hover:text-primary'}`}
              title={isRecording ? "Stop Recording" : "Start Recording"}
            >
              <span className="material-symbols-outlined">{isRecording ? 'stop_circle' : 'mic'}</span>
            </button>
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!inputText.trim() || isTranslating}
            className="flex items-center justify-center size-12 rounded-full bg-primary text-white hover:bg-primary-hover transition-colors shrink-0 shadow-lg shadow-sage-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="material-symbols-outlined fill ml-1">send</span>
          </button>
        </div>
        <div className="max-w-4xl mx-auto mt-2 text-center">
          <p className="text-[10px] text-gray-400 uppercase tracking-wider">AI translations may be inaccurate. Verify critical info.</p>
        </div>
      </footer>
    </div>
  );
};

export default Consultation;