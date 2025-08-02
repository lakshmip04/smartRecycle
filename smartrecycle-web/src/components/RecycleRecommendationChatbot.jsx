import React from 'react'; 
import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
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
  VolumeUp,
  Pause,
  PlayArrow,
  Stop,
} from '@mui/icons-material';

const RecycleRecommendationChatbot = () => {
  const { t, i18n } = useTranslation();
  
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: t('chatbot.welcomeMessage'),
      timestamp: new Date(),
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const [isRecording, setIsRecording] = useState(false);
  const selectedLanguage = i18n.language || 'en'; 
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  // Text-to-Speech Controls
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);

  // Clean up media resources on unmount
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const handleVoiceInput = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
        setInputMessage(t('chatbot.processingVoice'));
      }
      return;
    }

    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach(track => track.stop());
        
        if (audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });
          await sendAudioToSTT(audioBlob);
        } else {
          setError(t('chatbot.voiceInputFailed'));
        }
        
        setIsRecording(false);
      };

      mediaRecorder.onerror = (event) => {
        console.error("Recording error:", event.error);
        setError(t('chatbot.voiceInputFailed'));
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      };

      mediaRecorder.start(100); // Emit data every 100ms
      setIsRecording(true);
      
    } catch (err) {
      console.error("Microphone access error:", err);
      setError(t('chatbot.microphoneError'));
      setIsRecording(false);
    }
  };

  const sendAudioToSTT = async (audioBlob) => {
    try {
      setIsLoading(true);
      const apiKey = "cf04a6d0b99f4c098c0023ad9ac9f128";

      const uploadRes = await fetch('https://api.assemblyai.com/v2/upload', {
        method: 'POST',
        headers: { authorization: apiKey },
        body: audioBlob
      });

      const { upload_url } = await uploadRes.json();
      if (!upload_url) throw new Error('Upload failed');

      const transcriptRes = await fetch('https://api.assemblyai.com/v2/transcript', {
        method: 'POST',
        headers: {
          authorization: apiKey,
          'content-type': 'application/json'
        },
        body: JSON.stringify({ 
          audio_url: upload_url, 
          language_code: selectedLanguage,
          disfluencies: false,
          format_text: true
        })
      });

      const { id: transcriptId } = await transcriptRes.json();
      if (!transcriptId) throw new Error('Transcription request failed');

      const startTime = Date.now();
      const timeout = 30000;
      
      while (Date.now() - startTime < timeout) {
        const pollingRes = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
          headers: { authorization: apiKey }
        });
        const transcriptData = await pollingRes.json();

        if (transcriptData.status === 'completed') {
          setInputMessage(transcriptData.text);
          return;
        }
        
        if (transcriptData.status === 'error') {
          throw new Error(transcriptData.error || "Transcription failed");
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      throw new Error("Transcription timeout");
      
    } catch (err) {
      console.error("STT Error:", err);
      setError(err.message || t('chatbot.voiceInputFailed'));
      setInputMessage("");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlay = (text, messageId) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanedText = text
        // Remove star emoji characters
        .replace(/⭐/g, '')
        // Remove markdown bold formatting
        .replace(/\*\*(.*?)\*\*/g, '$1')
        // Remove markdown italic formatting
        .replace(/\*(.*?)\*/g, '$1')
        // Remove heading markers
        .replace(/#+\s?(.*)/g, '$1')
        // Replace bullet points with "and"
        .replace(/^\s*[•·]\s*/gm, 'and ')
        // Remove multiple spaces
        .replace(/\s+/g, ' ')
        // Remove special characters that don't sound good
        .replace(/[🧴🥣뽁]/g, '')
        // Replace section headers with natural speech
        .replace(/\bREDUCE\b/g, 'For reducing waste,')
        .replace(/\bREUSE\b/g, 'For reusing,')
        .replace(/\bRECYCLE\b/g, 'For recycling,')
        // Clean up any remaining formatting
        .trim();
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
              setError(t('chatbot.errorMessage'));
      setSpeakingMessageId(null);
      setIsPaused(false);
    };

    window.speechSynthesis.speak(utterance);
  } else {
    setError(t('chatbot.ttsNotSupported'));
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

  const handleRateChange = (rate, currentMessage) => {
    setPlaybackRate(rate);
    if (speakingMessageId === currentMessage.id) {
      handlePlay(currentMessage.content, currentMessage.id);
    }
  }

  const WORKER_URL = "https://gemini-worker.lakshmi20041304.workers.dev";

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generatePrompt = (userMessage, languageCode) => {
    const languageNames = {
      en: 'English',
      hi: 'Hindi',
      kn: 'Kannada',
      te: 'Telugu',
      ta: 'Tamil',
      ml: 'Malayalam'
    };
    const languageName = languageNames[languageCode] || 'English';

    return `You are a 3R (Reduce, Reuse, Recycle) assistant. Please respond in ${languageName} following this exact format with star ratings:

EXAMPLES:

User: "Shampoo and conditioner bottles"
Assistant: Shampoo and conditioner bottles are great candidates for recycling! Here's the best way to handle them. 🧴

⭐⭐⭐⭐⭐ **REDUCE**
Switch to solid shampoo and conditioner bars. They work great and completely eliminate plastic packaging.

⭐⭐⭐⭐ **RECYCLE**
A great option! These bottles are typically made from easily recyclable plastic (HDPE). Rinse them out, put the cap back on, and place them in your dry waste bin.

⭐⭐ **REUSE**
They can be refilled with product from bulk-buy stores if you have access to one.

User: "Bubble wrap"
Assistant: Bubble wrap is fun to pop, but let's see how we can handle it sustainably! 뽁뽁

⭐⭐⭐⭐⭐ **REUSE**
This is the best option! Keep it and reuse it for shipping your own packages or for safely storing fragile items at home.

⭐⭐⭐ **RECYCLE**
It can be recycled, but it must be bundled with other plastic films/bags. Don't put loose sheets in your recycling as they can jam machinery. Place it in a larger plastic bag with other soft plastics.

⭐ **REDUCE**
Request minimal or plastic-free packaging when ordering items online.

User: "Yogurt or curd cups"
Assistant: Those small plastic cups from yogurt or curd add up. Here's the plan: 🥣

⭐⭐⭐⭐⭐ **REDUCE**
Make your own curd at home or buy it in larger tubs instead of individual cups. This significantly reduces plastic waste.

⭐⭐⭐ **REUSE**
They are perfect for starting seeds for a small garden or for organizing small items like paper clips and buttons.

⭐⭐ **RECYCLE**
Rinse them thoroughly to remove all food residue and place them in your dry waste bin. Make sure they are completely dry.

Now respond to: "${userMessage}"

Follow the exact format: Start with a friendly intro, then give star ratings (⭐) from 1-5 for each category (**REDUCE**, **REUSE**, **RECYCLE**) based on how effective that option is for this item. Higher stars = better option. Include practical, specific advice for each category.`;
  };

  // Function to format markdown content for better display
  const formatMarkdownContent = (content) => {
    if (!content) return '';
    
    return content
      // Convert **bold** to actual bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      // Convert *text* to emphasized text
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      // Convert ### headings
      .replace(/### (.*)/g, '<div style="font-weight: bold; font-size: 1.1em; margin: 16px 0 8px 0; color: #2E7D32;">$1</div>')
      // Convert bullet points
      .replace(/^\* (.*)/gm, '<div style="margin: 4px 0; padding-left: 16px;">• $1</div>')
      // Convert numbered lists
      .replace(/^\d+\. (.*)/gm, '<div style="margin: 4px 0; padding-left: 16px;">$1</div>')
      // Add spacing after paragraphs
      .replace(/\n\n/g, '<br/><br/>');
  };

  const quickSuggestions = [
    { text: t('quickSuggestions.plasticBottles'), icon: "🥤" },
    { text: t('quickSuggestions.foodWaste'), icon: "🍎" },
    { text: t('quickSuggestions.oldClothes'), icon: "👕" },
    { text: t('quickSuggestions.electronicDevices'), icon: "📱" },
    { text: t('quickSuggestions.paperWaste'), icon: "📄" },
    { text: t('quickSuggestions.glassContainers'), icon: "🍶" },
  ];

  const handleSendMessage = async () => {
    const messageToSend = inputMessage.trim();
    if (!messageToSend) return;

    const userMessage = { id: Date.now(), type: 'user', content: messageToSend, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: generatePrompt(messageToSend, selectedLanguage) }] }] })
      });

      if (!response.ok) throw new Error('Failed to get response from AI');

      const data = await response.json();
      const botResponseText = data.content;
      const botMessage = { id: Date.now() + 1, type: 'bot', content: botResponseText, timestamp: new Date() };
      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      console.error('Error:', err);
              const errorMessage = { id: Date.now() + 1, type: 'bot', content: t('chatbot.errorMessage'), timestamp: new Date(), isError: true };
        setMessages(prev => [...prev, errorMessage]);
        setError(t('chatbot.errorMessage'));
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
    handleStop();
    setMessages([
      { id: 1, type: 'bot', content: t('chatbot.welcomeMessage'), timestamp: new Date() }
    ]);
    setError('');
  };

  return (
    <Card sx={{ height: '70vh', display: 'flex', flexDirection: 'column', borderRadius: 4 }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ p: 2, bgcolor: '#4CAF50', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToy sx={{ mr: 1.5 }} />
            <Typography variant="h6" sx={{ mr: 2 }}>{t('chatbot.title')}</Typography>
            <LanguageSwitcher 
              variant="outlined" 
              sx={{ 
                '& .MuiFormControl-root': { bgcolor: 'white', borderRadius: 1 },
                '& .MuiSelect-select': { fontSize: '0.875rem' }
              }} 
            />
          </Box>
          <Tooltip title={t('chatbot.clearChat')}>
            <IconButton onClick={clearChat} sx={{ color: 'white' }}>
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>

        <Box sx={{ flexGrow: 1, overflow: 'auto', overflowY: 'scroll', p: 2, bgcolor: '#f5f5f5', maxHeight: 'calc(70vh - 200px)' }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ display: 'flex', justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%', flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ bgcolor: message.type === 'user' ? '#2E7D32' : '#757575', mx: 1 }}>
                  {message.type === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Box>
                  <Paper sx={{ p: 1.5, bgcolor: message.type === 'user' ? '#2E7D32' : 'white', color: message.type === 'user' ? 'white' : 'text.primary', borderRadius: 2, maxWidth: '100%', wordBreak: 'break-word', ...(message.isError && { bgcolor: 'error.light', color: 'error.contrastText' }) }}>
                    {message.type === 'bot' && !message.isError ? (
                      <Box 
                        sx={{ 
                          lineHeight: 1.6,
                          '& strong': { fontWeight: 'bold' },
                          '& em': { fontStyle: 'italic' },
                          fontSize: '0.875rem'
                        }}
                        dangerouslySetInnerHTML={{ __html: formatMarkdownContent(message.content) }}
                      />
                    ) : (
                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{message.content}</Typography>
                    )}
                    <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7, textAlign: message.type === 'user' ? 'right' : 'left' }}>{message.timestamp.toLocaleTimeString()}</Typography>
                  </Paper>

                  {message.type === 'bot' && !message.isError && (
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', gap: 0.5, justifyContent: 'flex-start' }}>
                      {speakingMessageId !== message.id ? (
                        <Tooltip title={t('chatbot.readAloud')}>
                          <IconButton size="small" onClick={() => handlePlay(message.content, message.id)}>
                            <VolumeUp fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      ) : (
                        <Paper variant="outlined" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, p: 0.5, borderRadius: 2 }}>
                          <Tooltip title={isPaused ? t('chatbot.resume') : t('chatbot.pause')}>
                            <IconButton size="small" onClick={handlePauseResume}>
                              {isPaused ? <PlayArrow fontSize="small" /> : <Pause fontSize="small" />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title={t('chatbot.stop')}>
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
          {isLoading && (<Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}><Box sx={{ display: 'flex', alignItems: 'center' }}><Avatar sx={{ bgcolor: '#757575', mr: 1 }}><SmartToy /></Avatar><Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}><CircularProgress size={20} sx={{ mr: 1 }} /><Typography variant="body2" component="span">{t('chatbot.thinking')}</Typography></Paper></Box></Box>)}
          <div ref={messagesEndRef} />
        </Box>

        {messages.length <= 1 && (
          <Box sx={{ p: 2, bgcolor: '#e9f5ec' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>{t('chatbot.quickSuggestions')}</Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickSuggestions.map((s, i) => <Chip key={i} label={`${s.icon} ${s.text}`} onClick={() => handleQuickSuggestion(s.text)} clickable size="small" sx={{ bgcolor: 'white', '&:hover': { bgcolor: '#c8e6c9' } }} />)}
            </Box>
          </Box>
        )}

        <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider', position: 'relative' }}>
          {error && <Alert severity="error" onClose={() => setError('')} sx={{ mb: 1.5 }}>{error}</Alert>}
          
          {/* Recording Indicator */}
          {isRecording && (
            <Box sx={{
              position: 'absolute',
              bottom: '100%',
              right: 0,
              mb: 1,
              bgcolor: 'error.main',
              color: 'white',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              animation: 'pulse 1s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 1 },
                '50%': { opacity: 0.7 },
                '100%': { opacity: 1 }
              }
            }}>
              <Box sx={{
                width: 8,
                height: 8,
                bgcolor: 'white',
                borderRadius: '50%',
                mr: 1,
                animation: 'pulse 1s infinite'
              }} />
              <Typography variant="caption">{t('chatbot.recording')}</Typography>
            </Box>
          )}

          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField 
              fullWidth 
              multiline 
              maxRows={3} 
              value={inputMessage} 
              onChange={(e) => setInputMessage(e.target.value)} 
              onKeyPress={handleKeyPress} 
              placeholder={t('chatbot.placeholder')} 
              disabled={isLoading} 
              variant="outlined" 
              size="small" 
            />
            <Tooltip title={t('chatbot.sendMessage')}>
              <span>
                <Button
                  variant="contained"
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  sx={{ minWidth: 'auto', px: 2, backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#2E7D32' } }}
                >
                  <Send />
                </Button>
              </span>
            </Tooltip>
            <Tooltip title={isRecording ? t('chatbot.stopRecording') : t('chatbot.startVoiceInput')}>
              <Box sx={{ position: 'relative' }}>
                {isRecording && (
                  <Box sx={{
                    position: 'absolute',
                    top: -8,
                    right: -8,
                    width: 16,
                    height: 16,
                    bgcolor: 'error.main',
                    borderRadius: '50%',
                    border: '2px solid white'
                  }} />
                )}
                <IconButton
                  color={isRecording ? "error" : "primary"}
                  onClick={handleVoiceInput}
                  disabled={isLoading}
                  sx={{
                    bgcolor: isRecording ? 'rgba(244, 67, 54, 0.1)' : 'transparent',
                    '&:hover': {
                      bgcolor: isRecording ? 'rgba(244, 67, 54, 0.2)' : 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  {isRecording ? (
                    <MicOff sx={{ color: 'error.main' }} />
                  ) : (
                    <Mic />
                  )}
                </IconButton>
              </Box>
            </Tooltip>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecycleRecommendationChatbot;