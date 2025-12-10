import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../App';
import { Input, Button, Modal } from '../components/UI';
import { Chat, Message, User } from '../types';
import * as Icons from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [users, setUsers] = useState<User[]>([]);

  // New Chat Modal
  const [isNewChatOpen, setIsNewChatOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [groupName, setGroupName] = useState('');

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Get chats where user is participant
        const { data: chatParticipantsData, error: cpError } = await supabase
          .from('chat_participants')
          .select('chat_id')
          .eq('user_id', user.id);
        
        if (cpError) throw cpError;
        
        const chatIds = chatParticipantsData?.map(cp => cp.chat_id) || [];
        
        if (chatIds.length > 0) {
          const { data: chatsData, error: chatsError } = await supabase
            .from('chats')
            .select('*')
            .in('id', chatIds);
          if (chatsError) throw chatsError;
          setChats((chatsData || []).map(c => ({
            id: c.id,
            orgId: c.org_id,
            name: c.name,
            participantIds: c.participant_ids || []
          })));
        } else {
          setChats([]);
        }
        
        // Get users for org
        const { data: usersData, error: usersError } = await supabase
          .from('users')
          .select('*')
          .eq('org_id', user.orgId);
        
        if (usersError) throw usersError;
        setUsers((usersData || []).map(u => ({
          id: u.id,
          orgId: u.org_id,
          username: u.username,
          fullName: u.full_name || '',
          email: u.email || '',
          role: u.role || 'MEMBER',
          avatar: u.avatar,
          status: u.status || 'OFFLINE',
          lastSeen: u.last_seen ? new Date(u.last_seen).getTime() : undefined,
          timezone: u.timezone || 'UTC',
          department: u.department
        })));
      } catch (error) {
        console.error('Error loading chats:', error);
      }
    };
    
    loadData();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel(`org:${user.orgId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, () => {
        if (activeChatId) {
          loadMessages(activeChatId);
        }
        loadData();
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, activeChatId]);

  const loadMessages = async (chatId: string) => {
    try {
      const { data: messagesData, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_id', chatId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setMessages((messagesData || []).map(m => ({
        id: m.id,
        chatId: m.chat_id,
        userId: m.user_id,
        content: m.content,
        createdAt: new Date(m.created_at).getTime()
      })));
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    if (activeChatId) {
      loadMessages(activeChatId);
    }
  }, [activeChatId]);

  const handleSend = async () => {
    if (!user || !activeChatId || !messageInput.trim()) return;
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          chat_id: activeChatId,
          user_id: user.id,
          content: messageInput.trim(),
          created_at: new Date().toISOString()
        });
      if (error) throw error;
      setMessageInput('');
      loadMessages(activeChatId);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleCreateChat = async () => {
    if (!user || selectedUserIds.length === 0) return;
    try {
      const participants = [...selectedUserIds, user.id];
      const { data: newChatData, error } = await supabase
        .from('chats')
        .insert({
          org_id: user.orgId,
          name: groupName || undefined,
          participant_ids: participants
        })
        .select()
        .single();
      
      if (error) throw error;
      
      if (newChatData) {
        // Insert chat participants
        for (const participantId of participants) {
          await supabase
            .from('chat_participants')
            .insert({
              chat_id: newChatData.id,
              user_id: participantId
            });
        }
        
        setActiveChatId(newChatData.id);
        setIsNewChatOpen(false);
        setSelectedUserIds([]);
        setGroupName('');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const getChatName = (chat: Chat) => {
    if (chat.name) return chat.name;
    const otherIds = chat.participantIds.filter(id => id !== user?.id);
    const names = users.filter(u => otherIds.includes(u.id)).map(u => u.username).join(', ');
    return names || 'Unknown Chat';
  };

  const activeChat = chats.find(c => c.id === activeChatId);

  return (
    <div className="h-[calc(100vh-8rem)] animate-in fade-in duration-500 flex flex-col">
      <header className="mb-6 flex justify-between items-end">
         <div>
            <h1 className="text-4xl font-display font-bold text-text mb-1">Comms Channel</h1>
            <p className="font-sans text-textMuted text-sm">SECURE TEAM MESSAGING</p>
         </div>
         <Button onClick={() => setIsNewChatOpen(true)}>
            <Icons.Plus size={16} /> New Channel
         </Button>
      </header>

      <div className="flex-1 border border-white/10 rounded-lg flex overflow-hidden bg-surface shadow-lg">
         {/* Sidebar */}
         <div className={`w-full md:w-80 border-r-2 border-white/10 bg-background/50 p-4 flex-col ${activeChatId ? 'hidden md:flex' : 'flex'}`}>
            <div className="mb-4">
               <Input placeholder="Search channels..." />
            </div>
            <div className="space-y-1 overflow-y-auto flex-1 custom-scrollbar">
               {chats.map(chat => (
                  <div 
                     key={chat.id} 
                     onClick={() => setActiveChatId(chat.id)}
                     className={`p-3 rounded-md cursor-pointer transition-all border-2 ${activeChatId === chat.id ? 'bg-primary/10 border-primary/50' : 'border-transparent hover:bg-white/5'}`}
                  >
                     <div className="flex justify-between items-center mb-1">
                        <span className="font-sans font-bold text-sm text-text">{getChatName(chat)}</span>
                        <span className="text-xs text-textMuted font-mono">
                           {new Date(chat.lastMessageAt).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                        </span>
                     </div>
                  </div>
               ))}
               {chats.length === 0 && <p className="text-textMuted text-sm text-center font-sans mt-4">No channels found.</p>}
            </div>
         </div>

         {/* Chat Area */}
         <div className={`flex-1 flex-col bg-surface ${activeChatId ? 'flex' : 'hidden md:flex'}`}>
            {activeChat ? (
               <>
                  <div className="p-4 border-b-2 border-white/10 flex justify-between items-center bg-background/30">
                     <div className="flex items-center gap-2">
                        <button onClick={() => setActiveChatId(null)} className="md:hidden p-2 text-textMuted hover:text-text"><Icons.ArrowLeft size={20} /></button>
                        <span className="font-display font-bold text-lg text-text">
                           {getChatName(activeChat)}
                        </span>
                     </div>
                     <div className="flex gap-2 text-textMuted">
                        <Icons.MoreHorizontal size={24} className="cursor-pointer hover:text-text" />
                     </div>
                  </div>
                  
                  <div className="flex-1 p-6 space-y-4 overflow-y-auto custom-scrollbar">
                     {messages.map(msg => {
                        const isMe = msg.senderId === user?.id;
                        const sender = users.find(u => u.id === msg.senderId);
                        return (
                           <div key={msg.id} className={`flex gap-3 items-end ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                               <div className="w-8 h-8 rounded-full bg-secondary/10 border border-secondary/20 flex items-center justify-center font-bold text-xs uppercase">{sender?.username.substring(0,2)}</div>
                               <div className={`p-3 rounded-xl max-w-[70%] border border-white/10 ${isMe ? 'bg-primary text-background rounded-br-none' : 'bg-background rounded-bl-none'}`}>
                                 {!isMe && <p className="text-secondary font-sans text-xs mb-1 font-bold">{sender?.username}</p>}
                                 <p className="text-md font-sans leading-relaxed">{msg.content}</p>
                              </div>
                           </div>
                        )
                     })}
                  </div>

                  <div className="p-4 bg-background border-t-2 border-white/10 flex gap-4 items-center">
                     <input 
                        className="flex-1 bg-surface border-2 border-white/10 rounded-full px-6 py-3 text-text focus:outline-none font-sans text-sm placeholder:text-textMuted/50 focus:ring-2 focus:ring-primary transition-all"
                        placeholder="Transmit message..."
                        value={messageInput}
                        onChange={e => setMessageInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                     />
                     <button onClick={handleSend} className="w-12 h-12 rounded-full bg-primary text-background flex items-center justify-center hover:scale-110 transition-transform shadow-lg shadow-primary/20">
                        <Icons.Send size={20} />
                     </button>
                  </div>
               </>
            ) : (
               <div className="flex-1 flex flex-col items-center justify-center text-textMuted/50">
                  <Icons.MessageSquare size={64} className="mb-4" />
                  <p className="font-display text-2xl">SELECT CHANNEL</p>
                  <p className="font-sans text-sm text-textMuted">CHOOSE A CONVERSATION TO BEGIN</p>
               </div>
            )}
         </div>
      </div>

      {/* NEW CHANNEL MODAL */}
      <Modal isOpen={isNewChatOpen} onClose={() => setIsNewChatOpen(false)} title="Establish New Channel">
         <div className="space-y-6">
            <Input label="Channel Name (Optional)" value={groupName} onChange={e => setGroupName(e.target.value)} placeholder="e.g. Project-Omega-Team" />
            
            <div>
               <label className="font-sans font-semibold text-textMuted text-xs uppercase tracking-wider ml-1 mb-2 block">Participants</label>
               <div className="max-h-[200px] overflow-y-auto space-y-2 border border-white/10 rounded-md p-2 custom-scrollbar bg-background">
                  {users.filter(u => u.id !== user?.id).map(u => (
                     <div 
                        key={u.id} 
                        onClick={() => {
                           const selected = selectedUserIds.includes(u.id);
                           setSelectedUserIds(selected ? selectedUserIds.filter(id => id !== u.id) : [...selectedUserIds, u.id]);
                        }}
                        className={`flex items-center gap-3 p-3 rounded-md cursor-pointer border-2 transition-all ${selectedUserIds.includes(u.id) ? 'bg-primary/20 border-primary/50' : 'border-transparent hover:bg-white/5'}`}
                     >
                        <div className={`w-5 h-5 rounded border-2 border-white/30 flex items-center justify-center ${selectedUserIds.includes(u.id) ? 'bg-primary' : 'bg-surface'}`}>
                           {selectedUserIds.includes(u.id) && <Icons.Check size={12} className="text-white"/>}
                        </div>
                        <span className="text-text text-sm font-sans">{u.username}</span>
                        <span className="text-textMuted text-xs ml-auto font-sans font-bold uppercase bg-surface px-2 py-1 rounded border border-white/10">{u.role}</span>
                     </div>
                  ))}
               </div>
            </div>

            <Button onClick={handleCreateChat} className="w-full">
               Create Channel
            </Button>
         </div>
      </Modal>
    </div>
  );
}
