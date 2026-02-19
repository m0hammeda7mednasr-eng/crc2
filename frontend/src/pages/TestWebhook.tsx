import { useState } from 'react';
import api from '../services/api';

const TestWebhook = () => {
  const [phoneNumber, setPhoneNumber] = useState('+201234567890');
  const [message, setMessage] = useState('Test message from webhook');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendTest = async () => {
    setLoading(true);
    setResult('');
    
    try {
      const response = await api.post('/api/webhooks/whatsapp/incoming', {
        phoneNumber,
        content: message,
        type: 'text',
      });
      
      setResult(`✅ Success! Message received: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      setResult(`❌ Error: ${error.response?.data?.error || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Test Webhook</h1>
        <p className="text-gray-600">Test incoming WhatsApp messages</p>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg"
              placeholder="+201234567890"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Message Content
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg"
              placeholder="Type your test message..."
            />
          </div>

          <button
            onClick={handleSendTest}
            disabled={loading}
            className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl transition-all transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-3">
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending...</span>
              </span>
            ) : (
              <span className="flex items-center justify-center space-x-3">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
                <span>Send Test Message</span>
              </span>
            )}
          </button>

          {result && (
            <div className={`p-6 rounded-xl border-2 ${
              result.startsWith('✅') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <pre className="whitespace-pre-wrap font-mono text-sm">{result}</pre>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-blue-900 mb-3">📝 How to use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-blue-800">
          <li>Enter a phone number (with country code)</li>
          <li>Type your test message</li>
          <li>Click "Send Test Message"</li>
          <li>Go to Chat page to see the message appear!</li>
        </ol>
      </div>

      <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-purple-900 mb-3">🔗 Webhook URL:</h3>
        <code className="block bg-purple-100 p-4 rounded-lg text-purple-900 font-mono text-sm break-all">
          POST http://localhost:5000/api/webhooks/whatsapp/incoming
        </code>
        <p className="text-purple-800 mt-3 text-sm">
          Use this URL in your n8n workflow to send messages to the CRM
        </p>
      </div>
    </div>
  );
};

export default TestWebhook;
