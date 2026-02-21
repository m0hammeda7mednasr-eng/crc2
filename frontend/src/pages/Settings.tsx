import { useState, useEffect } from 'react';
import api from '../services/api';

interface ShopifyConnection {
  isConnected: boolean;
  shopDomain?: string;
}

const Settings = () => {
  const [n8nWebhookUrl, setN8nWebhookUrl] = useState('');
  const [shopifyConnection, setShopifyConnection] = useState<ShopifyConnection>({
    isConnected: false
  });
  
  // Webhook Token (unique per user)
  const [webhookToken, setWebhookToken] = useState('');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [loadingWebhookToken, setLoadingWebhookToken] = useState(false);
  
  // Shopify credentials form
  const [showCredentialsForm, setShowCredentialsForm] = useState(false);
  const [shopifyDomain, setShopifyDomain] = useState('');
  const [shopifyClientId, setShopifyClientId] = useState('');
  const [shopifyClientSecret, setShopifyClientSecret] = useState('');
  
  // Shopify webhook URL from backend
  const [shopifyWebhookUrl, setShopifyWebhookUrl] = useState('');
  const [shopifyRedirectUri, setShopifyRedirectUri] = useState('');
  const [loadingWebhookUrl, setLoadingWebhookUrl] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [testingConnection, setTestingConnection] = useState(false);

  useEffect(() => {
    fetchSettings();
    fetchWebhookToken();
    fetchShopifyWebhookUrl();
    fetchShopifyRedirectUri();
    
    // Check if redirected from Shopify OAuth
    const params = new URLSearchParams(window.location.search);
    if (params.get('shopify') === 'connected') {
      setMessage('Shopify connected successfully!');
      fetchSettings();
      // Clean URL
      window.history.replaceState({}, '', '/settings');
    }
  }, []);

  const fetchWebhookToken = async () => {
    try {
      setLoadingWebhookToken(true);
      const response = await api.get('/api/settings/webhook-token');
      setWebhookToken(response.data.webhookToken);
      setWebhookUrl(response.data.webhookUrl);
    } catch (error) {
      console.error('Failed to fetch webhook token:', error);
    } finally {
      setLoadingWebhookToken(false);
    }
  };

  const fetchShopifyWebhookUrl = async () => {
    try {
      setLoadingWebhookUrl(true);
      const userId = getUserId();
      if (!userId) return;
      
      const response = await api.get(`/api/webhook/shopify/url?userId=${userId}`);
      setShopifyWebhookUrl(response.data.webhookUrl);
    } catch (error) {
      console.error('Failed to fetch webhook URL:', error);
    } finally {
      setLoadingWebhookUrl(false);
    }
  };

  const fetchShopifyRedirectUri = async () => {
    try {
      const response = await api.get('/api/shopify/redirect-uri');
      setShopifyRedirectUri(response.data.redirectUri);
    } catch (error) {
      console.error('Failed to fetch redirect URI:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      const { settings } = response.data;
      
      if (settings) {
        setN8nWebhookUrl(settings.n8nWebhookUrl || '');
        
        // Check Shopify connection status
        if (settings.shopifyAccessToken && settings.shopifyDomain) {
          setShopifyConnection({
            isConnected: true,
            shopDomain: settings.shopifyDomain,
          });
        }
      }
    } catch (error: any) {
      console.error('Failed to fetch settings:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        setMessage('Session expired. Please logout and login again.');
      }
    }
  };

  // Get user ID for Shopify webhook payload
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (!token) return '';
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.userId;
    } catch {
      return '';
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setMessage('Webhook URL copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRegenerateToken = async () => {
    if (!confirm('Are you sure? This will invalidate your current webhook URL and you\'ll need to update all integrations.')) {
      return;
    }

    try {
      setLoadingWebhookToken(true);
      const response = await api.post('/api/settings/webhook-token/regenerate');
      setWebhookToken(response.data.webhookToken);
      setWebhookUrl(response.data.webhookUrl);
      setMessage('Webhook token regenerated! Update your integrations with the new URL.');
    } catch (error: any) {
      console.error('Failed to regenerate token:', error);
      setMessage(error.response?.data?.error || 'Failed to regenerate token');
    } finally {
      setLoadingWebhookToken(false);
    }
  };

  const copyShopifyWebhookUrl = () => {
    if (!shopifyWebhookUrl) return;
    navigator.clipboard.writeText(shopifyWebhookUrl);
    setMessage('Shopify Webhook URL copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const copyRedirectUri = () => {
    navigator.clipboard.writeText(shopifyRedirectUri);
    setMessage('Redirect URI copied to clipboard!');
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.put('/api/settings', { n8nWebhookUrl });
      setMessage('Settings saved successfully!');
    } catch (error: any) {
      console.error('Settings update error:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save settings';
      setMessage(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopifyDomain.trim() || !shopifyClientId.trim() || !shopifyClientSecret.trim()) {
      setMessage('Please fill in all Shopify credentials');
      return;
    }

    try {
      setLoading(true);
      setMessage('');
      
      await api.post('/api/shopify/credentials', {
        shopifyDomain: shopifyDomain.trim(),
        shopifyClientId: shopifyClientId.trim(),
        shopifyClientSecret: shopifyClientSecret.trim(),
      });
      
      setMessage('Credentials saved! Now click "Connect with Shopify" to authorize.');
      setShowCredentialsForm(false);
    } catch (error: any) {
      console.error('Failed to save credentials:', error);
      setMessage(error.response?.data?.error || 'Failed to save credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleShopifyConnect = async () => {
    try {
      setLoading(true);
      setMessage('');
      
      const response = await api.get('/api/shopify/auth/start');
      const { authUrl } = response.data;
      
      // Redirect to Shopify OAuth page
      window.location.href = authUrl;
    } catch (error: any) {
      console.error('Failed to initiate Shopify OAuth:', error);
      
      if (error.response?.data?.code === 'CREDENTIALS_NOT_CONFIGURED') {
        setMessage('Please configure your Shopify credentials first');
        setShowCredentialsForm(true);
      } else {
        setMessage(error.response?.data?.error || 'Failed to connect to Shopify');
      }
      setLoading(false);
    }
  };

  const handleShopifyDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect your Shopify store? This will stop order synchronization.')) {
      return;
    }

    try {
      setLoading(true);
      await api.post('/api/shopify/disconnect');
      setShopifyConnection({ isConnected: false });
      setMessage('Shopify store disconnected successfully');
      setShopifyDomain('');
      setShopifyClientId('');
      setShopifyClientSecret('');
    } catch (error: any) {
      console.error('Failed to disconnect Shopify:', error);
      setMessage(error.response?.data?.error || 'Failed to disconnect Shopify');
    } finally {
      setLoading(false);
    }
  };

  const handleTestShopifyConnection = async () => {
    try {
      setTestingConnection(true);
      const response = await api.get('/api/shopify/test-connection');
      setMessage(`Connection successful! Shop: ${response.data.shop.name}`);
    } catch (error: any) {
      console.error('Connection test failed:', error);
      setMessage(error.response?.data?.error || 'Connection test failed. Please reconnect your store.');
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
        <p className="text-gray-600">Configure your integrations and preferences</p>
      </div>

      {message && (
        <div className={`p-4 rounded-xl border-2 animate-fade-in ${
          message.includes('success') || message.includes('successful')
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="flex items-center space-x-3">
            {message.includes('success') || message.includes('successful') ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            <p className="font-medium">{message}</p>
          </div>
        </div>
      )}

      {/* WhatsApp Integration */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">WhatsApp Integration</h2>
              <p className="text-gray-600">Configure your n8n webhook for WhatsApp messages</p>
            </div>
          </div>

          {/* Incoming Webhook URL - Read Only */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              🔐 Your Unique Webhook URL
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={loadingWebhookToken ? 'Loading...' : webhookUrl}
                readOnly
                className="flex-1 px-6 py-4 border-2 border-gray-300 rounded-xl bg-gray-50 text-gray-700 text-sm font-mono"
              />
              <button
                type="button"
                onClick={copyWebhookUrl}
                disabled={loadingWebhookToken}
                className="px-6 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2 disabled:opacity-50"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <div className="mt-3 flex items-start space-x-2">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-gray-600 space-y-1">
                <p className="font-semibold">This is YOUR unique webhook URL - different from other users!</p>
                <p>Use this URL in n8n or any integration to send incoming WhatsApp messages to your CRM.</p>
                <p className="text-xs text-gray-500">Token: <code className="bg-gray-100 px-2 py-0.5 rounded font-mono">{webhookToken || 'Loading...'}</code></p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleRegenerateToken}
              disabled={loadingWebhookToken}
              className="mt-3 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg hover:bg-yellow-200 transition-colors text-sm font-medium disabled:opacity-50"
            >
              🔄 Regenerate Token (will invalidate old URL)
            </button>
          </div>

          {/* Outgoing Webhook URL - User Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              n8n Outgoing Webhook URL
            </label>
            <input
              type="url"
              value={n8nWebhookUrl}
              onChange={(e) => setN8nWebhookUrl(e.target.value)}
              className="w-full px-6 py-4 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent shadow-sm text-lg"
              placeholder="https://your-n8n-instance.com/webhook/..."
            />
            <p className="text-sm text-gray-500 mt-3 flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>This URL will receive outgoing messages from your CRM to send via WhatsApp</span>
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-8 py-4 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl hover:from-primary-700 hover:to-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl transition-all transform hover:scale-105"
        >
          {loading ? (
            <span className="flex items-center justify-center space-x-3">
              <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Saving...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center space-x-3">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Save WhatsApp Settings</span>
            </span>
          )}
        </button>
      </form>

      {/* Shopify Integration */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center">
            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Shopify Integration</h2>
            <p className="text-gray-600">Connect your Shopify store and configure webhooks</p>
          </div>
        </div>

        {/* Important Notice - Explain the difference */}
        <div className="mb-6 p-5 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-300 rounded-xl">
          <div className="flex items-start space-x-3">
            <svg className="w-6 h-6 text-indigo-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-indigo-900">
              <p className="font-bold mb-2">📌 مهم جداً: فيه 2 روابط مختلفة تماماً!</p>
              <div className="space-y-2">
                <div className="p-2 bg-white rounded border border-blue-200">
                  <p className="font-semibold text-blue-900">1️⃣ Shopify Webhook URL (الأزرق) 👇</p>
                  <p className="text-xs text-blue-700">• يُستخدم في: Shopify Admin → Settings → Notifications → Webhooks</p>
                  <p className="text-xs text-blue-700">• الغرض: استقبال الطلبات (Orders) من Shopify</p>
                  <p className="text-xs text-blue-700">• فريد لكل متجر (مختلف لكل عميل)</p>
                </div>
                <div className="p-2 bg-white rounded border border-yellow-200">
                  <p className="font-semibold text-yellow-900">2️⃣ Redirect URI (الأصفر) 👇</p>
                  <p className="text-xs text-yellow-700">• يُستخدم في: Shopify Admin → Settings → Apps → Develop apps</p>
                  <p className="text-xs text-yellow-700">• الغرض: ربط Custom App بـ Shopify (OAuth)</p>
                  <p className="text-xs text-yellow-700">• واحد لكل المتاجر (نفس الرابط للجميع)</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Shopify Webhook Configuration - Simple */}
        <div className="mb-6 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-900">🔗 Shopify Webhook URL</h3>
              <p className="text-sm text-blue-700">Copy this URL and use it in Shopify</p>
            </div>
          </div>
          
          {/* The URL - Big and Clear */}
          <div className="mb-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={loadingWebhookUrl ? 'Loading...' : (shopifyWebhookUrl || 'Loading...')}
                readOnly
                className="flex-1 px-6 py-4 border-2 border-blue-400 rounded-xl bg-white text-gray-800 text-base font-mono shadow-sm"
              />
              <button
                type="button"
                onClick={copyShopifyWebhookUrl}
                disabled={loadingWebhookUrl || !shopifyWebhookUrl}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 disabled:opacity-50 font-bold shadow-lg flex items-center space-x-2"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span>Copy</span>
              </button>
            </div>
            
            {shopifyWebhookUrl && shopifyWebhookUrl.includes('https://') ? (
              <div className="mt-3 p-3 bg-green-50 border border-green-300 rounded-lg flex items-center space-x-2">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-800 font-semibold">✅ Ready for Shopify! (HTTPS detected)</p>
              </div>
            ) : shopifyWebhookUrl ? (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Using localhost - Need ngrok for Shopify</p>
                <p className="text-xs text-yellow-700">Run: <code className="bg-yellow-100 px-2 py-1 rounded font-mono">npx ngrok http 5000</code></p>
              </div>
            ) : null}
          </div>

          {/* Quick Instructions */}
          <div className="p-4 bg-white rounded-lg border border-blue-200">
            <p className="text-sm font-semibold text-blue-900 mb-2">📝 Shopify Setup (3 steps):</p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Copy the URL above ☝️</li>
              <li>Go to Shopify: Settings → Notifications → Webhooks → Create webhook</li>
              <li>Event: <code className="bg-blue-100 px-2 py-0.5 rounded">Order creation</code>, Format: <code className="bg-blue-100 px-2 py-0.5 rounded">JSON</code>, Paste URL, Save ✅</li>
            </ol>
          </div>
        </div>

        {/* Redirect URI Display - Always Visible */}
        {shopifyRedirectUri && (
          <div className="mb-6 p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-xl">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-yellow-600 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-yellow-900">📋 Redirect URI للربط بـ Shopify</h3>
                <p className="text-sm text-yellow-700">استخدم هذا الرابط عند إنشاء Custom App في Shopify</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={shopifyRedirectUri}
                  readOnly
                  className="flex-1 px-6 py-4 border-2 border-yellow-400 rounded-xl bg-white text-gray-800 text-base font-mono shadow-sm"
                />
                <button
                  type="button"
                  onClick={copyRedirectUri}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl hover:from-yellow-700 hover:to-orange-700 transition-all transform hover:scale-105 font-bold shadow-lg flex items-center space-x-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <span>Copy</span>
                </button>
              </div>
            </div>

            <div className="p-4 bg-white rounded-lg border border-yellow-200">
              <p className="text-sm font-semibold text-yellow-900 mb-3">📝 خطوات الربط من Shopify Admin:</p>
              <ol className="text-sm text-yellow-800 space-y-2 list-decimal list-inside">
                <li>اذهب إلى متجرك في Shopify Admin: <code className="bg-yellow-100 px-2 py-0.5 rounded">your-store.myshopify.com/admin</code></li>
                <li>من القائمة: <span className="font-semibold">Settings → Apps and sales channels → Develop apps</span></li>
                <li>اضغط <span className="font-semibold">"Create an app"</span> أو اختر تطبيق موجود</li>
                <li>في تبويب <span className="font-semibold">"Configuration"</span>:
                  <ul className="mt-1 mr-6 space-y-1 list-disc list-inside text-xs">
                    <li>في <span className="font-semibold">App URL</span>: الصق الرابط أعلاه</li>
                    <li>في <span className="font-semibold">Allowed redirection URL(s)</span>: الصق نفس الرابط</li>
                  </ul>
                </li>
                <li>احفظ التغييرات، ثم انسخ <span className="font-semibold">API key</span> و <span className="font-semibold">API secret key</span></li>
                <li>ارجع هنا وأدخل البيانات في الأسفل ✅</li>
              </ol>
              <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-900">
                <span className="font-semibold">💡 ملاحظة:</span> الربط يتم من Shopify Admin مباشرة (Custom App Development)، مش من Shopify Partners!
              </div>
            </div>
          </div>
        )}

        {/* OAuth Connection Status */}
        {shopifyConnection.isConnected ? (
          <div className="space-y-4">
            <div className="p-6 bg-green-50 border-2 border-green-200 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-bold text-green-900">Connected</span>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
              <div className="space-y-2 text-sm text-green-800">
                <p><span className="font-semibold">Store:</span> {shopifyConnection.shopDomain}</p>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={handleTestShopifyConnection}
                disabled={testingConnection}
                className="flex-1 px-6 py-3 bg-purple-100 text-purple-700 rounded-xl hover:bg-purple-200 font-medium transition-colors disabled:opacity-50"
              >
                {testingConnection ? 'Testing...' : 'Test Connection'}
              </button>
              <button
                onClick={handleShopifyDisconnect}
                disabled={loading}
                className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 font-medium transition-colors disabled:opacity-50"
              >
                Disconnect Store
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {!showCredentialsForm ? (
              <>
                <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                  <p className="text-gray-700 mb-4">
                    Connect your Shopify store securely using OAuth. You'll need:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Your Shopify store domain (e.g., your-store.myshopify.com)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Client ID (Shopify calls it "API Key")</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Client Secret (Shopify calls it "API Secret Key")</span>
                    </li>
                  </ul>
                </div>

                <button
                  onClick={() => setShowCredentialsForm(true)}
                  className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                >
                  <span className="flex items-center justify-center space-x-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span>Configure Shopify Credentials</span>
                  </span>
                </button>
              </>
            ) : (
              <form onSubmit={handleSaveCredentials} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Shop Domain
                  </label>
                  <input
                    type="text"
                    value={shopifyDomain}
                    onChange={(e) => setShopifyDomain(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="your-store.myshopify.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client ID (API Key)
                  </label>
                  <input
                    type="text"
                    value={shopifyClientId}
                    onChange={(e) => setShopifyClientId(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your Shopify API Key"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Client Secret (API Secret Key)
                  </label>
                  <input
                    type="password"
                    value={shopifyClientSecret}
                    onChange={(e) => setShopifyClientSecret(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter your Shopify API Secret Key"
                    required
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowCredentialsForm(false)}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Save Credentials'}
                  </button>
                </div>
              </form>
            )}

            {!showCredentialsForm && (
              <>
                <button
                  onClick={handleShopifyConnect}
                  disabled={loading}
                  className="w-full px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg shadow-xl transition-all transform hover:scale-105"
                >
                  {loading ? (
                    <span className="flex items-center justify-center space-x-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Connecting...</span>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center space-x-3">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Connect with Shopify</span>
                    </span>
                  )}
                </button>

                <p className="text-xs text-gray-500 text-center">
                  You'll be redirected to Shopify to authorize this connection
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
