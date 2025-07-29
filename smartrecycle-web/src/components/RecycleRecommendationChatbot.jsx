import React from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useState, useRef, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Recycling,
  Nature,
  Lightbulb,
  Refresh,
  Clear,
  Mic,
  MicOff,
  VolumeUp, // Icon for Read Aloud
  Pause,    // Icon for Pause
  PlayArrow,// Icon for Resume
  Stop,     // Icon for Stop
} from '@mui/icons-material';

const RecycleRecommendationChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: 'Hello! I\'m your 3R (Reduce, Reuse, Recycle) assistant. Tell me what type of waste you have, and I\'ll give you personalized recommendations on how to reduce, reuse, or recycle it sustainably! 🌱',
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // --- State for Text-to-Speech Controls ---
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // --- Voice Recognition (Input) Setup ---
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
  } = useSpeechRecognition();

  useEffect(() => {
    setInputMessage(transcript);
  }, [transcript]);

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      setError('Voice recognition is not supported by your browser.');
      return;
    }
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false });
    }
  };

  // --- Text-to-Speech (Output) Functionality ---
  const handlePlay = (text, messageId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Stop any current speech

      const cleanedText = text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/\*(.*?)\*/g, '$1').replace(/#+\s?(.*)/g, '$1');
      const utterance = new SpeechSynthesisUtterance(cleanedText);

      utterance.lang = 'en-US';
      utterance.rate = playbackRate;

      utterance.onstart = () => {
        setSpeakingMessageId(messageId);
        setIsPaused(false);
      };

      utterance.onend = () => {
        setSpeakingMessageId(null);
        setIsPaused(false);
      };

      utterance.onerror = () => {
        setError("An error occurred during speech synthesis.");
        setSpeakingMessageId(null);
        setIsPaused(false);
      };

      window.speechSynthesis.speak(utterance);
    } else {
      setError('Text-to-speech not supported in this browser.');
    }
  };

  const handlePauseResume = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    setIsPaused(false);
  };

  // When rate changes, restart the speech for the current message
  const handleRateChange = (rate, currentMessage) => {
    setPlaybackRate(rate);
    if (speakingMessageId === currentMessage.id) {
      handlePlay(currentMessage.content, currentMessage.id);
    }
  }

  const WORKER_URL = "https://gemini-worker.lakshmi20041304.workers.dev";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generatePrompt = (userMessage) => {
    return `
      You are a helpful 3R (Reduce, Reuse, Recycle) assistant focused on environmental sustainability. 
      The user is asking about: "${userMessage}"
      Please provide comprehensive recommendations organized into these categories:
      1. REDUCE - How to minimize or prevent this waste in the future
      2. REUSE - Creative ways to repurpose or use this item again
      3. RECYCLE - Proper disposal and recycling methods
      Format your response in a friendly, conversational tone with clear sections for Reduce, Reuse, and Recycle, using emojis.
    `;
  };

  const quickSuggestions = [
    { text: "Plastic bottles", icon: "🥤" },
    { text: "Food waste", icon: "🍎" },
    { text: "Old clothes", icon: "👕" },
    { text: "Electronic devices", icon: "📱" },
    { text: "Paper waste", icon: "📄" },
    { text: "Glass containers", icon: "🍶" },
  ];

  const handleSendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend) return;

    const userMessage = { id: Date.now(), type: 'user', content: messageToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');
    resetTranscript();

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: generatePrompt(messageToSend) }] }] })
      });

      if (!response.ok) throw new Error('Failed to get response from AI');

      const data = await response.json();
      const botResponseText = data.content;
      const botMessage = { id: Date.now() + 1, type: 'bot', content: botResponseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
      // NOTE: Automatic speech is removed. User now clicks to play.
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = { id: Date.now() + 1, type: 'bot', content: 'Sorry, I encountered an error. Please try again.', timestamp: new Date(), isError: true };
      setMessages(prev => [...prev, errorMessage]);
      setError('Sorry, I encountered an error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickSuggestion = (suggestion) => {
    setInputMessage(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    handleStop(); // Stop any active speech
    setMessages([
      { id: 1, type: 'bot', content: 'Hello! I\'m your 3R (Reduce, Reuse, Recycle) assistant. How can I help you today? 🌱', timestamp: new Date() }
    ]);
    setError('');
  };

  const formatBotMessage = (content) => {
    // ... (Your existing formatBotMessage logic remains unchanged)
    return [{ type: 'general', content: content }]; // Simplified for example
  };

  const getSectionIcon = (type) => {
    // ... (Your existing getSectionIcon logic remains unchanged)
  };

  return (
    <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ p: 2, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToy sx={{ mr: 1.5 }} />
            <Typography variant="h6">3R Recommendation Chatbot</Typography>
          </Box>
          <Tooltip title="Clear Chat">
            <IconButton onClick={clearChat} sx={{ color: 'white' }}>
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: '#f5f5f5' }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%', flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ bgcolor: message.type === 'user' ? '#2E7D32' : '#757575', mx: 1 }}>
                  {message.type === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Box>
                  <Paper sx={{ p: 1.5, bgcolor: message.type === 'user' ? '#2E7D32' : 'white', color: message.type === 'user' ? 'white' : 'text.primary', borderRadius: 2, maxWidth: '100%', wordBreak: 'break-word', ...(message.isError && { bgcolor: 'error.light', color: 'error.contrastText' }) }}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{message.content}</Typography>
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7, textAlign: message.type === 'user' ? 'right' : 'left' }}>{message.timestamp.toLocaleTimeString()}</Typography>
                  </Paper>

                  {/* --- NEW AUDIO CONTROLS --- */}
                  {message.type === 'bot' && !message.isError && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-start' }}>
                      {speakingMessageId !== message.id ? (
                        <Tooltip title="Read Aloud">
                          <IconButton size="small" onClick={() => handlePlay(message.content, message.id)}>
                            <VolumeUp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 2 }}>
                          <Tooltip title={isPaused ? "Resume" : "Pause"}>
                            <IconButton size="small" onClick={handlePauseResume}>
                              {isPaused ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Stop">
                            <IconButton size="small" onClick={handleStop}>
                              <Stop fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <FormControl size="small" variant="standard" sx={{ minWidth: 60, '& .MuiInput-underline:before': { borderBottom: 'none' }, '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' } }}>
                            <Select
                              value={playbackRate}
                              onChange={(e) => handleRateChange(e.target.value, message)}
                              sx={{ fontSize: '0.8rem', '.MuiSelect-select:focus': { backgroundColor: 'transparent' } }}
                            >
                              <MenuItem value={0.5}>0.5x</MenuItem>
                              <MenuItem value={1}>1x</MenuItem>
                              <MenuItem value={1.5}>1.5x</MenuItem>
                              <MenuItem value={2}>2x</MenuItem>
                            </Select>
                          </FormControl>
                        </Paper>
                      )}
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          ))}
          {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}><Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ bgcolor: '#757575', mr: 1 }}><SmartToy /></Avatar><Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}><CircularProgress size={20} sx={{ mr: 1 }} /><Typography variant="body2" component="span">Thinking...</Typography></Paper></Box></Box>)}
          <div ref={messagesEndRef} />
        </Box>

        {messages.length <= 1 && (
          <Box sx={{ p: 2, bgcolor: '#e9f5ec' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>Quick suggestions:</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickSuggestions.map((s, i) => <Chip key={i} label={`${s.icon} ${s.text}`} onClick={() => handleQuickSuggestion(s.text)} clickable size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#c8e6c9' } }} />)}
            </Box>
          </Box>
        )}

        <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5 }}>{error}</Alert>}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField fullWidth multiline maxRows={3} value={inputMessage} onChange={(e) => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder="Describe your waste or ask about recycling..." disabled={isLoading} variant="outlined" size="small" />
            <Tooltip title="Send Message">
              <Button variant="contained" onClick={handleSendMessage} disabled={isLoading || !inputMessage.trim()} sx={{ minWidth: 'auto', px: 2, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}><Send /></Button>
            </Tooltip>
            <Tooltip title={listening ? "Stop Listening" : "Start Voice Input"}>
              <IconButton color={listening ? "error" : "primary"} onClick={handleVoiceInput} disabled={isLoading} sx={{ border: 1, borderColor: 'divider' }}>
                {listening ? <MicOff /> : <Mic />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecycleRecommendationChatbot;
