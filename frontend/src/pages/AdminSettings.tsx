import { useState } from 'react';
import AdminLayout from '../components/AdminLayout';

const AdminSettings = () => {
  const [settings] = useState({
    siteName: 'WhatsApp CRM',
    supportEmail: 'support@crm.com',
    maxUsersPerPlan: {
      free: 1,
      pro: 10,
      enterprise: 100,
    },
    webhookUrl: 'https://lamsa.rooyai.com/webhook/whatsapp',
    enableRegistration: true,
    maintenanceMode: false,
  });

  // const [, setSaved] = useState(false);

  // const handleSave = () => {
  //   // TODO: Implement save functionality
  //   setSaved(true);
  //   setTimeout(() => setSaved(false), 3000);
  // };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-gray-900">⚙️ System Settings</h1>
          <p className="text-gray-600 mt-2">Configure system-wide settings and preferences</p>
        </div>

        {/* Coming Soon Message */}
        <div className="bg-gradient-to-br from-primary-50 to-primary-100 rounded-2xl shadow-xl p-12 text-center border-2 border-primary-200">
          <div className="w-24 h-24 bg-primary-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Advanced Settings Coming Soon</h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            We're building comprehensive system settings including webhook configuration, 
            email templates, subscription plans management, and security settings.
          </p>
        </div>

        {/* Quick Settings Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🌐 General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Site Name</label>
                <input
                  type="text"
                  value={settings.siteName}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Support Email</label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Webhook Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
                <input
                  type="url"
                  value={settings.webhookUrl}
                  disabled
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl bg-gray-50"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Webhook Status</span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Active
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">👥 User Management</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Enable Registration</span>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input type="checkbox" checked={settings.enableRegistration} disabled className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Maintenance Mode</span>
                <label className="relative inline-flex items-center cursor-not-allowed">
                  <input type="checkbox" checked={settings.maintenanceMode} disabled className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-900 mb-4">💳 Subscription Plans</h3>
            <div className="space-y-3">
              <div className="p-4 bg-gray-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Free Plan</span>
                  <span className="text-sm text-gray-600">Max 1 user</span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Pro Plan</span>
                  <span className="text-sm text-gray-600">Max 10 users</span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-900">Enterprise Plan</span>
                  <span className="text-sm text-gray-600">Max 100 users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminSettings;
