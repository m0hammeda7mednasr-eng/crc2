import { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import socketService from '../services/socket';
import { Customer, Message } from '../types';
import useIsMobile from '../hooks/useIsMobile';
import ChatHeader from '../components/ChatHeader';

const Chat = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const isMobile = useIsMobile();
  const [loading, setLoading] = useState(false);
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCustomers();

    socketService.on('customer:new', (customer: Customer) => {
      setCustomers((prev) => [customer, ...prev]);
    });

    socketService.on('message:new', (message: Message) => {
      if (selectedCustomer && message.customerId === selectedCustomer.id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update unread count for incoming messages
      if (message.direction === 'incoming' && (!selectedCustomer || message.customerId !== selectedCustomer.id)) {
        setCustomers(prev => 
          prev.map(c => 
            c.id === message.customerId 
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 } 
              : c
          )
        );
      }
    });

    // Listen for customer updates
    socketService.on('customer:updated', (data: { customer: Customer }) => {
      setCustomers(prev => 
        prev.map(c => 
          c.id === data.customer.id 
            ? { ...c, ...data.customer } 
            : c
        )
      );
    });

    // Listen for customer deletion
    socketService.on('customer:deleted', (data: { customerId: string }) => {
      setCustomers(prev => prev.filter(c => c.id !== data.customerId));
      if (selectedCustomer?.id === data.customerId) {
        setSelectedCustomer(null);
        setMessages([]);
      }
    });

    // Listen for message status updates
    socketService.on('message:status', (data: { messageId: string; status: string }) => {
      setMessages(prev => 
        prev.map(m => 
          m.id === data.messageId 
            ? { ...m, status: data.status as Message['status'] } 
            : m
        )
      );
    });

    return () => {
      socketService.off('customer:new');
      socketService.off('message:new');
      socketService.off('customer:updated');
      socketService.off('customer:deleted');
      socketService.off('message:status');
    };
  }, [selectedCustomer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchCustomers = async () => {
    try {
      const response = await api.get('/api/customers');
      setCustomers(response.data.customers);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const fetchMessages = async (customerId: string) => {
    try {
      const response = await api.get(`/api/messages/${customerId}`);
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleCustomerSelect = async (customer: Customer) => {
    setSelectedCustomer(customer);
    fetchMessages(customer.id);
    
    // Mark as read
    if (customer.unreadCount > 0) {
      try {
        await api.post(`/api/customers/${customer.id}/read`);
        setCustomers(prev => 
          prev.map(c => 
            c.id === customer.id 
              ? { ...c, unreadCount: 0 } 
              : c
          )
        );
      } catch (error) {
        console.error('Failed to mark as read:', error);
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !selectedImage) || !selectedCustomer) return;

    setLoading(true);
    try {
      let imageUrl: string | undefined;

      // Upload image first if selected
      if (selectedImage) {
        setUploadingImage(true);
        const formData = new FormData();
        formData.append('image', selectedImage);

        const uploadResponse = await api.post('/api/messages/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        imageUrl = uploadResponse.data.imageUrl;
        setUploadingImage(false);
      }

      // Send message
      const response = await api.post('/api/messages/send', {
        customerId: selectedCustomer.id,
        content: inputText.trim() || (imageUrl ? 'Image' : 'Message'),
        type: imageUrl ? 'image' : 'text',
        imageUrl,
      });
      
      // Add message to local state immediately
      if (response.data.data) {
        setMessages((prev) => [...prev, response.data.data]);
      }
      
      // Reset form
      setInputText('');
      setSelectedImage(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      const errorMsg = error.response?.data?.error || 'Failed to send message. Please try again.';
      alert(errorMsg);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setSelectedImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerPhone.trim()) return;

    setLoading(true);
    try {
      // Create customer directly
      await api.post('/api/customers', {
        phoneNumber: newCustomerPhone,
        name: newCustomerName || undefined,
      });

      // Refresh customers list
      await fetchCustomers();
      
      // Reset form
      setNewCustomerPhone('');
      setNewCustomerName('');
      setShowAddCustomer(false);
    } catch (error: any) {
      console.error('Failed to add customer:', error);
      const errorMessage = error.response?.data?.error || 'Failed to add customer. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (!confirm('Are you sure you want to delete this chat? This will delete all messages and cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/api/customers/${customerId}`);
      setCustomers(prev => prev.filter(c => c.id !== customerId));
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('Failed to delete chat');
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      {/* Add Customer Modal */}
      {showAddCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Add New Customer</h3>
              <button
                onClick={() => setShowAddCustomer(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="+201234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name (Optional)
                </label>
                <input
                  type="text"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="Customer Name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddCustomer(false)}
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 font-medium shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Adding...</span>
                    </span>
                  ) : (
                    'Add Customer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="h-full flex bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
        {/* Customer List - Enhanced Design */}
        <div className={`w-full md:w-1/3 border-r border-gray-200 flex flex-col bg-gradient-to-b from-gray-50 to-white ${isMobile && selectedCustomer ? 'hidden' : ''}`}>
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Chats</h2>
              <button
                onClick={() => setShowAddCustomer(true)}
                className="p-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 shadow-lg transition-all"
                title="Add New Customer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <svg className="w-5 h-5 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {customers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                  </svg>
                </div>
                <p className="text-gray-600 font-medium mb-2">No customers yet</p>
                <p className="text-sm text-gray-500 mb-4">Add your first customer to start chatting</p>
                <button
                  onClick={() => setShowAddCustomer(true)}
                  className="px-6 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-medium transition-colors"
                >
                  Add Customer
                </button>
              </div>
            ) : (
              <>
                {customers.map((customer) => (
                  <div
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className={`group p-4 border-b border-gray-100 cursor-pointer transition-all hover:bg-gray-50 ${
                      selectedCustomer?.id === customer.id 
                        ? 'bg-primary-50 border-l-4 border-l-primary-600' 
                        : (customer.unreadCount || 0) > 0 
                        ? 'bg-blue-50'
                        : ''
                    }`}
                  >
                  <div className="flex items-center space-x-3">
                    {/* Profile Image or Avatar */}
                    <div className="relative">
                      {customer.profileImage ? (
                        <img 
                          src={customer.profileImage} 
                          alt={customer.name || 'Customer'} 
                          className="w-12 h-12 rounded-full object-cover shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                          {((customer.name || customer.phoneNumber || '?').charAt(0).toUpperCase())}
                        </div>
                      )}
                      
                      {/* Unread Badge */}
                      {(customer.unreadCount || 0) > 0 && (
                        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          {customer.unreadCount > 9 ? '9+' : customer.unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${(customer.unreadCount || 0) > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                        {customer.name || customer.phoneNumber || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{customer.phoneNumber || 'No phone'}</p>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCustomer(customer.id);
                      }}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete chat"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    
                    {selectedCustomer?.id === customer.id && (
                      <div className="w-2 h-2 bg-primary-600 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
              </>
            )}
          </div>
        </div>

        {/* Chat Area - Enhanced Design */}
        <div className="flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-white">
          {selectedCustomer ? (
            <>
              {/* Mobile Header with Back Button */}
              {isMobile && <ChatHeader customer={selectedCustomer} onBack={() => setSelectedCustomer(null)} />}
              
              {/* Desktop Header */}
              <div className="p-6 border-b border-gray-200 bg-white shadow-sm hidden md:block">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                    {((selectedCustomer.name || selectedCustomer.phoneNumber || '?').charAt(0).toUpperCase())}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">
                      {selectedCustomer.name || selectedCustomer.phoneNumber || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-500">{selectedCustomer.phoneNumber || 'No phone'}</p>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'0.05\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }}>
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <p className="text-gray-500">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outgoing' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    >
                      <div
                        className={`max-w-xs md:max-w-md rounded-2xl shadow-md ${
                          message.direction === 'outgoing'
                            ? 'bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-br-none'
                            : 'bg-white text-gray-900 rounded-bl-none border border-gray-200'
                        }`}
                      >
                        {message.type === 'image' && message.imageUrl && (
                          <div className="p-2">
                            <img 
                              src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${message.imageUrl}`}
                              alt="Shared image" 
                              className="rounded-xl max-w-full cursor-pointer hover:opacity-90 transition-opacity"
                              onClick={() => window.open(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${message.imageUrl}`, '_blank')}
                            />
                          </div>
                        )}
                        <div className="px-4 py-3">
                          <p className="break-words">{message.content}</p>
                          <div className="flex items-center justify-between mt-2">
                            <p className={`text-xs ${message.direction === 'outgoing' ? 'text-primary-100' : 'text-gray-500'}`}>
                              {message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                            </p>
                            {/* Message Status Indicators */}
                            {message.direction === 'outgoing' && (
                              <div className="flex items-center ml-2">
                                {message.status === 'sending' && (
                                  <span className="text-primary-100 text-xs">⏰</span>
                                )}
                                {message.status === 'sent' && (
                                  <span className="text-primary-100 text-sm">✓</span>
                                )}
                                {message.status === 'delivered' && (
                                  <span className="text-primary-100 text-sm">✓✓</span>
                                )}
                                {message.status === 'read' && (
                                  <span className="text-blue-300 text-sm">✓✓</span>
                                )}
                                {message.status === 'failed' && (
                                  <span className="text-red-300 text-xs">❌</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200 bg-white">
                {/* Image Preview */}
                {imagePreview && (
                  <div className="mb-4 relative inline-block">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-32 rounded-xl border-2 border-primary-300 shadow-md"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full hover:bg-red-600 flex items-center justify-center shadow-lg"
                    >
                      ×
                    </button>
                    {uploadingImage && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 rounded-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex space-x-3">
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageSelect}
                    className="hidden"
                  />

                  {/* Image upload button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={loading || uploadingImage}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    title="Attach image"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-6 py-3 border border-gray-300 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm"
                  />
                  <button
                    type="submit"
                    disabled={loading || uploadingImage || (!inputText.trim() && !selectedImage)}
                    className="px-8 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-full hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-lg transition-all flex items-center space-x-2"
                  >
                    {uploadingImage ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <span>Send</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Welcome to Your CRM</h3>
                <p className="text-gray-500">Select a customer to start chatting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
