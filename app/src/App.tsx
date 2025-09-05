// used ai for the ui to save time

import './App.css';
import { io } from 'socket.io-client';
import { useEffect, useState, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid';

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Container,
  CssBaseline,
  List,
  ListItem,
  ListItemText,
  Paper,
  TextField,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';

// lucide react icons, i tried installing MUI icons but
// it was too heavy

import {
  ThumbsUp,
  ThumbsUpIcon,
  MessageSquare,
  ChevronDown,
  Send
} from 'lucide-react';

interface Comment {
  _id: string;
  text: string;
  createdAt: string;
}

interface Message {
  _id: string;
  text: string;
  sender: string;
  likes: number;
  likedBy: string[];
  comments: Comment[];
  createdAt: string;
}

interface MessageCardProps {
  message: Message;
  clientId: string;
  onLike: (messageId: string) => void;
  onComment: (messageId: string, text: string) => void;
}



const socket = io('http://localhost:3000', {
  autoConnect: false
});


const MessageCard: React.FC<MessageCardProps> = ({ message, clientId, onLike, onComment }) => {
  const [commentInput, setCommentInput] = useState("");
  const hasLiked = message.likedBy.includes(clientId);

  const handleCommentSubmit = () => {
    if (!commentInput.trim()) return;
    onComment(message._id, commentInput);
    setCommentInput("");
  };

  return (
    <ListItem sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <Paper
        elevation={3}
        sx={{
          p: 2,
          bgcolor: 'primary.main',
          color: 'primary.contrastText',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '75%',
        }}
      >
        <Typography variant="body2" sx={{ color: 'rgba(255, 255, 255, 0.7)', mb: 0.5 }}>
          {message.sender}
        </Typography>
        <Typography variant="body1" sx={{ mb: 1 }}>
          {message.text}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
          <IconButton
            size="small"
            onClick={() => onLike(message._id)}
            sx={{ color: 'primary.contrastText' }}
          >
            {hasLiked ? <ThumbsUp fontSize="small" /> : <ThumbsUpIcon fontSize="small" />}
          </IconButton>
          <Typography variant="body2">{message.likes}</Typography>

          <MessageSquare />
          <Typography variant="body2">{message.comments.length}</Typography>

          <Typography variant="caption" sx={{ ml: 'auto', color: 'rgba(255, 255, 255, 0.5)' }}>
            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Typography>
        </Box>
      </Paper>

      {message.comments.length > 0 && (
        <Accordion sx={{ width: '100%', maxWidth: '75%', mt: 1, boxShadow: 'none', bgcolor: 'transparent' }}>
          <AccordionSummary expandIcon={<ChevronDown />}>
            <Typography variant="caption" sx={{ color: '#555' }}>
              View {message.comments.length} comment(s)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <List dense>
              {message.comments.map(comment => (
                <ListItem key={comment._id}>
                  <ListItemText
                    primary={comment.text}
                    secondary={new Date(comment.createdAt).toLocaleString()}
                    primaryTypographyProps={{ fontSize: '0.9rem' }}
                  />
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      )}

      <Box sx={{ display: 'flex', width: '100%', maxWidth: '75%', mt: 1, gap: 1 }}>
        <TextField
          fullWidth
          size="small"
          variant="outlined"
          placeholder="Add a comment..."
          value={commentInput}
          onChange={(e) => setCommentInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleCommentSubmit();
            }
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '20px',
              backgroundColor: '#f0f0f0',
            },
          }}
        />
        <IconButton onClick={handleCommentSubmit} color="primary">
          <Send />
        </IconButton>
      </Box>
    </ListItem>
  );
};


function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [clientId, setClientId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const messageEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // i prefer to store this in local storage, 
    let id = localStorage.getItem('chat-client-id');
    if (!id) {
      id = uuidv4();
      localStorage.setItem('chat-client-id', id);
    }
    setClientId(id);

    socket.connect();
    setIsLoading(true);

    socket.on("message", (incomingMessages: Message[] | Message) => {
      // the response can be an array or one object, so this checks if it's either
      const newMessagesArray = Array.isArray(incomingMessages) ? incomingMessages : [incomingMessages];

      setMessages((prevMessages) => {
        // i decided to use hash map for better loop ups
        // also the syntax is easy to work with
        const messageMap = new Map(prevMessages.map(msg => [msg._id, msg]));

        newMessagesArray.forEach(newMsg => {
          messageMap.set(newMsg._id, newMsg);
        });

        // converted it back to an array and sort it by the created at date
        return Array.from(messageMap.values()).sort(
          (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      });

      setIsLoading(false);
    });

    return () => {
      socket.off("message");
      socket.disconnect();
    };
  }, [socket]); //i removed that socket variable that i put in the dependency array during the call because i want this to run only once (i changed my mind 😂)


  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    socket.emit("message", input);
    setInput("");
  };

  const handleLike = (messageId: string) => {
    socket.emit('likeMessage', { messageId, clientId });
  };

  const handleComment = (messageId: string, text: string) => {
    socket.emit('commentMessage', { messageId, text });
  };

  return (
    <>
      <CssBaseline />
      <Container maxWidth="md" sx={{ height: '100vh', display: 'flex', flexDirection: 'column', p: 0 }}>
        <Box sx={{ py: 2, borderBottom: '1px solid #ddd' }}>
          <Typography variant="h4" component="h1" align="center" fontWeight="semibold">
            Chat App
          </Typography>
        </Box>

        <Box sx={{ flexGrow: 1, p: 2, overflowY: 'auto', bgcolor: '#f9f9f9' }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
              <CircularProgress />
            </Box>
          ) : (
            <List>
              {messages.map((m) => (
                <MessageCard
                  key={m._id}
                  message={m}
                  clientId={clientId}
                  onLike={handleLike}
                  onComment={handleComment}
                />
              ))}
              <div ref={messageEndRef} />
            </List>
          )}
        </Box>

        <Box sx={{ p: 2, borderTop: '1px solid #ddd', bgcolor: '#fff' }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault(); // i did not use preventDefault during the call but when i was testing this, i needed to use this
                sendMessage();
              }
            }}
          />
        </Box>
      </Container>
    </>
  );
}

export default App;
