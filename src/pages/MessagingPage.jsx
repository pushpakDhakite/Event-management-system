import { useState, useEffect, useRef } from 'react';
import { messageService } from '../services/newFeatures';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const MessagingPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { scrollToBottom(); }, [messages]);

  const fetchConversations = async () => {
    try {
      const res = await messageService.getConversations();
      setConversations(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const openConversation = async (contactId) => {
    setSelectedContact(conversations.find(c => c.contact_id === contactId));
    try {
      const res = await messageService.getMessages(contactId);
      setMessages(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedContact) return;
    try {
      await messageService.send({ receiver_id: selectedContact.contact_id, message: newMessage });
      setNewMessage('');
      openConversation(selectedContact.contact_id);
    } catch (err) { console.error(err); }
  };

  const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-6xl mx-auto h-[calc(100vh-140px)]">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
          <div className="grid grid-cols-3 gap-4 h-full">
            <div className="col-span-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">Conversations</h3>
              </div>
              {loading ? <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div></div> :
              <div className="overflow-y-auto" style={{ maxHeight: 'calc(100% - 60px)' }}>
                {conversations.length === 0 ? <p className="p-4 text-sm text-gray-500 text-center">No conversations yet</p> :
                conversations.map(c => (
                  <button key={c.contact_id} onClick={() => openConversation(c.contact_id)} className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors ${selectedContact?.contact_id === c.contact_id ? 'bg-purple-50' : ''}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">{c.contact_name?.charAt(0)}</div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{c.contact_name}</p>
                          <p className="text-xs text-gray-500 truncate max-w-[150px]">{c.last_message}</p>
                        </div>
                      </div>
                      {c.unread_count > 0 && <span className="px-2 py-0.5 text-xs bg-purple-600 text-white rounded-full">{c.unread_count}</span>}
                    </div>
                  </button>
                ))}
              </div>}
            </div>

            <div className="col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col">
              {selectedContact ? (
                <>
                  <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">{selectedContact.contact_name?.charAt(0)}</div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedContact.contact_name}</p>
                      <p className="text-xs text-gray-500">{selectedContact.contact_email || ''}</p>
                    </div>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map(m => (
                      <div key={m.id} className={`flex ${m.sender_id === user.id ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] px-4 py-2 rounded-lg text-sm ${m.sender_id === user.id ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
                          <p>{m.message}</p>
                          <p className={`text-xs mt-1 ${m.sender_id === user.id ? 'text-purple-200' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                  <form onSubmit={sendMessage} className="p-4 border-t border-gray-200 flex space-x-3">
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none text-sm" />
                    <button type="submit" className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Send</button>
                  </form>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-gray-500">
                  <div className="text-center">
                    <p className="text-4xl mb-2">💬</p>
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MessagingPage;