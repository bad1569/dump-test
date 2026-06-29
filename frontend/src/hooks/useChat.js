import { useState, useCallback } from 'react';

export function useChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasStartedChat, setHasStartedChat] = useState(false);

    const sendMessage = async (text) => {
        if (!text.trim()) return;

        const apiBaseUrl = import.meta.env.VITE_API_URL || '';

        // 1. Instantly display user's message
        const userMsg = { id: Date.now(), text, sender: 'user', timestamp: new Date() };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);
        setHasStartedChat(true);

        try {
            // 2. Send data to the backend
            const response = await fetch(`${apiBaseUrl}/api/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const data = await response.json();
            
            // 3. Display the AI's reply
            const botMsg = { id: Date.now() + 1, text: data.reply, sender: 'bot', timestamp: new Date() };
            setMessages((prev) => [...prev, botMsg]);

        } catch (error) {
            console.error("Chat Error:", error);
            const errorMsg = { 
                id: Date.now() + 1, 
                text: 'Connection error. Please ensure the server is running.', 
                sender: 'bot', 
                timestamp: new Date() 
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        sendMessage(input);
    };

    const handleSuggestionClick = (suggestion) => {
        sendMessage(suggestion);
    };

    const resetChat = useCallback(() => {
        setMessages([]);
        setInput('');
        setHasStartedChat(false);
        setIsLoading(false);
    }, []);

    return {
        messages,
        input,
        setInput,
        isLoading,
        hasStartedChat,
        handleSuggestionClick,
        handleSubmit,
        resetChat,
    };
}