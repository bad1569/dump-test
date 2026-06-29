import { useState } from 'react';
import LandingPage from './pages/LandingPage';
import ChatWidget from './components/chat/ChatWidget';

export default function App() {
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <>
      <LandingPage onOpenChat={() => setChatOpen(true)} />
      <ChatWidget externalOpen={chatOpen} onExternalOpenHandled={() => setChatOpen(false)} />
    </>
  );
}
