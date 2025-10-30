// import React, { useState, useEffect } from "react";
// import { Send } from "lucide-react";
// import api from "../api/axiosInstance";
// import toast from "react-hot-toast";

// const ChatBox = ({ userId, roomId }) => {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState("");
//   const [loading, setLoading] = useState(true);
//   const [chatId, setChatId] = useState(null); // store conversation id if needed

//   const scrollToBottom = () => {
//     const scrollArea = document.getElementById("chat-scroll-area");
//     if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
//   };

//   useEffect(scrollToBottom, [messages]);

//   // Fetch existing chat
//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!userId || !roomId) return;
//       try {
//         setLoading(true);
//         const res = await api.post("/chat/get", { userId, roomId });
//         const existingMessages = res.data.conversations[0]?.messages || [];
//         setMessages(existingMessages);
//         setChatId(res.data.conversations[0]?._id || null);
//       } catch (err) {
//         console.error(err);
//         toast.error("Failed to load messages");
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchMessages();
//   }, [userId, roomId]);

//   // 🧠 Send message to AI agent backend
//   const sendMessage = async () => {
//     if (!input.trim()) return;
//     const userMsg = input.trim();
//     setInput("");

//     // Show user message immediately
//     setMessages((prev) => [...prev, { user: userMsg }]);

//     try {
//       const res = await api.post("/chat/agent", {
//         userId,
//         roomId,
//         message: userMsg,
//         conversationId: chatId,
//       });

//       const { result, chatId: newChatId } = res.data;
//       if (newChatId) setChatId(newChatId);

//       // Append both user and agent messages for rendering
//       setMessages((prev) => [...prev, { agent: result.agent }]);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to send message");
//     }
//   };

//   const handleKeyDown = (e) => {
//     if (e.key === "Enter" && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   // 🧠 Render helper to show alternating user/agent bubbles
//   const renderMessage = (msg, idx) => {
//     if (msg.user) {
//       return (
//         <div key={idx} className="flex justify-end">
//           <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm bg-blue-500 text-white rounded-br-none">
//             <p>{msg.user}</p>
//           </div>
//         </div>
//       );
//     } else if (msg.agent) {
//       return (
//         <div key={idx} className="flex justify-start">
//           <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm bg-gray-200 text-gray-800 rounded-bl-none">
//             <p>{msg.agent}</p>
//           </div>
//         </div>
//       );
//     }
//     return null;
//   };

//   return (
//     <div className="flex flex-col h-[500px] md:h-[600px] bg-white border rounded-2xl shadow-sm overflow-hidden">
//       {/* Header */}
//       <div className="px-4 py-2 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg">
//         Room Chat
//       </div>

//       {/* Messages */}
//       <div
//         id="chat-scroll-area"
//         className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
//       >
//         {loading ? (
//           <div className="flex justify-center items-center h-full text-gray-500 animate-pulse">
//             Loading messages...
//           </div>
//         ) : messages.length === 0 ? (
//           <div className="flex justify-center items-center h-full text-gray-400 italic">
//             No messages yet. Start the conversation!
//           </div>
//         ) : (
//           messages.map(renderMessage)
//         )}
//       </div>

//       {/* Input */}
//       <div className="p-3 border-t bg-white flex items-center gap-2">
//         <textarea
//           autoFocus={false}
//           className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none"
//           rows={1}
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={handleKeyDown}
//           placeholder="Type a message..."
//         />
//         <button
//           onClick={sendMessage}
//           className="bg-blue-500 hover:bg-blue-600 transition text-white p-2 rounded-xl shadow-sm disabled:opacity-50"
//           disabled={!input.trim()}
//         >
//           <Send className="w-5 h-5" />
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ChatBox;



import React, { useState, useEffect } from "react";
import { Send } from "lucide-react";
import api from "../api/axiosInstance";
import toast from "react-hot-toast";

const ChatBox = ({ userId, roomId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [agentTyping, setAgentTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState(null);

  const scrollToBottom = () => {
    const scrollArea = document.getElementById("chat-scroll-area");
    if (scrollArea) scrollArea.scrollTop = scrollArea.scrollHeight;
  };

  useEffect(scrollToBottom, [messages, agentTyping]);

  // 🧠 Send message to backend
  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    const userMsg = input.trim();
    setInput("");
    setSending(true);

    // show user msg instantly
    setMessages((prev) => [...prev, { user: userMsg }]);
    setAgentTyping(true);

    try {
      const res = await api.post("/chat/agent", {
        userId,
        roomId,
        message: userMsg,
        conversationId: chatId,
      });

      const { result, chatId: newChatId } = res.data;
      if (newChatId) setChatId(newChatId);

      setAgentTyping(false);

      // append agent reply
      setMessages((prev) => [...prev, { agent: result.agent }]);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send message");
      setAgentTyping(false);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Animated "typing..." effect
  const TypingIndicator = () => {
    const [dots, setDots] = useState(".");
    useEffect(() => {
      const interval = setInterval(() => {
        setDots((prev) => (prev.length < 3 ? prev + "." : "."));
      }, 400);
      return () => clearInterval(interval);
    }, []);
    return <span className="italic text-gray-500">Agent is typing{dots}</span>;
  };

  const renderMessage = (msg, idx) => {
    if (msg.user) {
      return (
        <div key={idx} className="flex justify-end">
          <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm bg-blue-500 text-white rounded-br-none">
            <p>{msg.user}</p>
          </div>
        </div>
      );
    } else if (msg.agent) {
      return (
        <div key={idx} className="flex justify-start">
          <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm bg-gray-200 text-gray-800 rounded-bl-none">
            <p>{msg.agent}</p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col h-[500px] md:h-[600px] bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 border-b bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-lg">
        Room Chat
      </div>

      {/* Messages */}
      <div
        id="chat-scroll-area"
        className="flex-1 overflow-y-auto p-3 space-y-2 bg-gray-50"
      >
        {messages.length === 0 ? (
          <div className="flex justify-center items-center h-full text-gray-400 italic">
            Start a new conversation!
          </div>
        ) : (
          <>
            {messages.map(renderMessage)}
            {agentTyping && (
              <div className="flex justify-start">
                <div className="max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm bg-gray-200 text-gray-800 rounded-bl-none">
                  <TypingIndicator />
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t bg-white flex items-center gap-2">
        <textarea
          disabled={sending}
          className="flex-1 resize-none border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none disabled:opacity-50"
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={sending ? "Waiting for agent..." : "Type a message..."}
        />
        <button
          onClick={sendMessage}
          className="bg-blue-500 hover:bg-blue-600 transition text-white p-2 rounded-xl shadow-sm disabled:opacity-50"
          disabled={!input.trim() || sending}
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatBox;
