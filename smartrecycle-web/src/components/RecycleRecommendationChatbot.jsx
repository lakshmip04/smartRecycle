import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import React, { useState, useRef, useEffect } from 'react';
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
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  Tooltip,
} from '@mui/material';
import {
  Send,
  SmartToy,
  Person,
  Recycling,
  Nature,
  Lightbulb,
  Refresh,
  ExpandMore,
  ExpandLess,
  EcoIcon,
  ReplayIcon,
  ReduceIcon,
  Delete,
  Clear,
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
  const [expandedTips, setExpandedTips] = useState({});
  const messagesEndRef = useRef(null);

  // Voice recognition state and handler
const {
  transcript,
  listening,
  resetTranscript,
  browserSupportsSpeechRecognition,
} = useSpeechRecognition();

useEffect(() => {
  if (!listening && transcript) {
    setInputMessage((prev) => (prev ? prev + ' ' + transcript : transcript));
    resetTranscript();
  }
}, [listening, transcript, resetTranscript]);

const handleVoiceInput = () => {
  if (!browserSupportsSpeechRecognition) {
    alert('Your browser does not support voice recognition.');
    return;
  }

  if (listening) {
    SpeechRecognition.stopListening();
  } else {
    resetTranscript();
    SpeechRecognition.startListening({ continuous: false });
  }
};
const speakText = (text) => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();

    // Clean up markdown symbols
    const cleanedText = text
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove bold
      .replace(/\*(.*?)\*/g, '$1')      // Remove italic
      .replace(/_(.*?)_/g, '$1')        // Remove underscores
      .replace(/`(.*?)`/g, '$1')        // Remove inline code
      .replace(/#+\s?(.*)/g, '$1');     // Remove heading markers

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = 'en-US';
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  } else {
    console.warn('Text-to-speech not supported in this browser.');
  }
};




  // Cloudflare Worker Configuration
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

Guidelines:
- Be encouraging and positive
- Provide specific, actionable advice
- Include environmental impact information when relevant
- Use emojis to make the response engaging
- Keep responses concise but comprehensive
- If the user mentions a specific item, give item-specific advice
- If the user asks generally, provide general 3R principles

Format your response in a friendly, conversational tone with clear sections for Reduce, Reuse, and Recycle.
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
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: generatePrompt(inputMessage)
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

    const data = await response.json();
const botResponseText = data.content;

// ✅ Clean markdown formatting like **bold**, *italic*, etc.
const cleanedText = botResponseText
  .replace(/\*\*(.*?)\*\*/g, '$1')   // remove **bold**
  .replace(/\*(.*?)\*/g, '$1')       // remove *italic*
  .replace(/_(.*?)_/g, '$1')         // remove _underscore_
  .replace(/`(.*?)`/g, '$1')         // remove `code`

const botMessage = {
  id: Date.now() + 1,
  type: 'bot',
  content: cleanedText,
  timestamp: new Date(),
};

setMessages(prev => [...prev, botMessage]);
speakText(cleanedText); // 🔈 Use cleaned text for voice too , Bot speaks here!
    } catch (error) {
      console.error('Error:', error);
      setError('Sorry, I encountered an error. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Sorry, I encountered an error while processing your request. Please try again or contact support if the problem persists.',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errorMessage]);
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
    setMessages([
      {
        id: 1,
        type: 'bot',
        content: 'Hello! I\'m your 3R (Reduce, Reuse, Recycle) assistant. Tell me what type of waste you have, and I\'ll give you personalized recommendations on how to reduce, reuse, or recycle it sustainably! 🌱',
        timestamp: new Date(),
      }
    ]);
    setError('');
  };

  const toggleTipExpansion = (messageId) => {
    setExpandedTips(prev => ({
      ...prev,
      [messageId]: !prev[messageId]
    }));
  };

  const formatBotMessage = (content) => {
    const lines = content.split('\n');
    const sections = [];
    let currentSection = null;
    let currentContent = [];

    lines.forEach(line => {
      const trimmedLine = line.trim();
      if (trimmedLine.toUpperCase().includes('REDUCE')) {
        if (currentSection) {
          sections.push({ type: currentSection, content: currentContent.join('\n') });
        }
        currentSection = 'reduce';
        currentContent = [];
      } else if (trimmedLine.toUpperCase().includes('REUSE')) {
        if (currentSection) {
          sections.push({ type: currentSection, content: currentContent.join('\n') });
        }
        currentSection = 'reuse';
        currentContent = [];
      } else if (trimmedLine.toUpperCase().includes('RECYCLE')) {
        if (currentSection) {
          sections.push({ type: currentSection, content: currentContent.join('\n') });
        }
        currentSection = 'recycle';
        currentContent = [];
      } else if (trimmedLine) {
        currentContent.push(trimmedLine);
      }
    });

    if (currentSection) {
      sections.push({ type: currentSection, content: currentContent.join('\n') });
    }

    return sections.length > 0 ? sections : [{ type: 'general', content: content }];
  };

  const getSectionIcon = (type) => {
    switch (type) {
      case 'reduce': return <Nature color="error" />;
      case 'reuse': return <Refresh color="primary" />;
      case 'recycle': return <Recycling color="success" />;
      default: return <Lightbulb color="info" />;
    }
  };

  const getSectionColor = (type) => {
    switch (type) {
      case 'reduce': return 'error.light';
      case 'reuse': return 'primary.light';
      case 'recycle': return 'success.light';
      default: return 'info.light';
    }
  };

  

  return (
    <Card sx={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
        {/* Header */}
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <SmartToy sx={{ mr: 1 }} />
            <Typography variant="h6">3R Recommendation Chatbot</Typography>
          </Box>
          <Tooltip title="Clear Chat">
            <IconButton onClick={clearChat} sx={{ color: 'white' }}>
              <Clear />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Messages */}
        <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2, bgcolor: 'grey.50' }}>
          {messages.map((message) => (
            <Box
              key={message.id}
              sx={{
                display: 'flex',
                justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
                mb: 2,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', maxWidth: '80%', flexDirection: message.type === 'user' ? 'row-reverse' : 'row' }}>
                <Avatar sx={{ bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main', mx: 1 }}>
                  {message.type === 'user' ? <Person /> : <SmartToy />}
                </Avatar>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: message.type === 'user' ? 'primary.main' : 'white',
                    color: message.type === 'user' ? 'white' : 'text.primary',
                    borderRadius: 2,
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                    ...(message.isError && { bgcolor: 'error.light', color: 'error.contrastText' }),
                  }}
                >
                  {message.type === 'bot' && !message.isError ? (
                    <Box>
                      {formatBotMessage(message.content).map((section, index) => (
                        <Box key={index} sx={{ mb: section.type !== 'general' ? 2 : 0 }}>
                          {section.type !== 'general' && (
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              {getSectionIcon(section.type)}
                              <Typography variant="subtitle1" sx={{ ml: 1, fontWeight: 'bold', textTransform: 'capitalize' }}>
                                {section.type}
                              </Typography>
                            </Box>
                          )}
                          <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                            {section.content}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {message.content}
                    </Typography>
                  )}
                  <Typography variant="caption" sx={{ display: 'block', mt: 1, opacity: 0.7 }}>
                    {message.timestamp.toLocaleTimeString()}
                  </Typography>
                </Paper>
              </Box>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mr: 1 }}>
                  <SmartToy />
                </Avatar>
                <Paper sx={{ p: 2, bgcolor: 'white', borderRadius: 2 }}>
                  <CircularProgress size={20} sx={{ mr: 1 }} />
                  <Typography variant="body2" component="span">
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>

        {/* Quick Suggestions */}
        {messages.length <= 1 && (
          <Box sx={{ p: 2, bgcolor: 'grey.100' }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Quick suggestions:
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {quickSuggestions.map((suggestion, index) => (
                <Chip
                  key={index}
                  label={`${suggestion.icon} ${suggestion.text}`}
                  onClick={() => handleQuickSuggestion(suggestion.text)}
                  clickable
                  size="small"
                  sx={{ bgcolor: 'white', '&:hover': { bgcolor: 'primary.light' } }}
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Input */}
        <Box sx={{ p: 2, bgcolor: 'white', borderTop: 1, borderColor: 'divider' }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              multiline
              maxRows={3}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your waste or ask about recycling..."
              disabled={isLoading}
              variant="outlined"
              size="small"
            />
            <Button
              variant="contained"
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <Send />
            </Button>
            <Button
  variant={listening ? 'outlined' : 'contained'}
  color="secondary"
  onClick={handleVoiceInput}
  disabled={isLoading}
  sx={{ minWidth: 'auto', px: 2 }}
>
  {listening ? '🛑 Stop' : '🎤 Voice'}
</Button>

          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default RecycleRecommendationChatbot; 