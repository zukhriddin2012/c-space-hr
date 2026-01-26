'use client';

import { useState, useEffect } from 'react';
import {
  Bot,
  BookOpen,
  MessageSquare,
  MousePointerClick,
  Clock,
  Settings,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  HelpCircle,
  Users,
  Star,
  Target,
  RefreshCw,
} from 'lucide-react';
import { PageGuard } from '@/components/RoleGuard';
import { PERMISSIONS } from '@/lib/permissions';
import type {
  BotLearningContent,
  BotMessageTemplate,
  BotButtonLabel,
  BotSettings,
  LocalizedContent,
  SupportedLanguage,
} from '@/lib/supabase';

type TabId = 'learning' | 'messages' | 'buttons' | 'settings';

const LANGUAGES: { code: SupportedLanguage; flag: string; name: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'ru', flag: '🇷🇺', name: 'Русский' },
  { code: 'uz', flag: '🇺🇿', name: 'O\'zbek' },
];

const CONTENT_TYPES = [
  { value: 'tip', label: 'Tip', emoji: '💡', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'scenario', label: 'Scenario', emoji: '🎭', color: 'bg-blue-100 text-blue-700' },
  { value: 'quiz', label: 'Quiz', emoji: '🎯', color: 'bg-green-100 text-green-700' },
  { value: 'reflection', label: 'Reflection', emoji: '⭐', color: 'bg-purple-100 text-purple-700' },
];

const CATEGORIES = [
  { value: 'service_excellence', label: 'Service Excellence', icon: Star },
  { value: 'team_collaboration', label: 'Team Collaboration', icon: Users },
  { value: 'customer_handling', label: 'Customer Handling', icon: MessageSquare },
  { value: 'company_values', label: 'Company Values', icon: Target },
  { value: 'professional_growth', label: 'Professional Growth', icon: Lightbulb },
];

export default function TelegramBotPage() {
  const [activeTab, setActiveTab] = useState<TabId>('learning');
  const [learningContent, setLearningContent] = useState<BotLearningContent[]>([]);
  const [messageTemplates, setMessageTemplates] = useState<BotMessageTemplate[]>([]);
  const [buttonLabels, setButtonLabels] = useState<BotButtonLabel[]>([]);
  const [botSettings, setBotSettings] = useState<BotSettings[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showLearningModal, setShowLearningModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [showButtonModal, setShowButtonModal] = useState(false);
  const [editingContent, setEditingContent] = useState<BotLearningContent | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<BotMessageTemplate | null>(null);
  const [editingButton, setEditingButton] = useState<BotButtonLabel | null>(null);

  // Filters
  const [contentTypeFilter, setContentTypeFilter] = useState<string>('all');
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>('en');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (activeTab === 'learning') {
        const res = await fetch('/api/telegram-bot/learning-content');
        const data = await res.json();
        if (res.ok) setLearningContent(data.content || []);
        else setError(data.error);
      } else if (activeTab === 'messages') {
        const res = await fetch('/api/telegram-bot/message-templates');
        const data = await res.json();
        if (res.ok) setMessageTemplates(data.templates || []);
        else setError(data.error);
      } else if (activeTab === 'buttons') {
        const res = await fetch('/api/telegram-bot/button-labels');
        const data = await res.json();
        if (res.ok) setButtonLabels(data.labels || []);
        else setError(data.error);
      } else if (activeTab === 'settings') {
        const res = await fetch('/api/telegram-bot/settings');
        const data = await res.json();
        if (res.ok) setBotSettings(data.settings || []);
        else setError(data.error);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteContent = async (id: string) => {
    if (!confirm('Are you sure you want to delete this content?')) return;
    try {
      const res = await fetch(`/api/telegram-bot/learning-content?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setLearningContent(prev => prev.filter(c => c.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      const res = await fetch(`/api/telegram-bot/message-templates?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setMessageTemplates(prev => prev.filter(t => t.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const handleDeleteButton = async (id: string) => {
    if (!confirm('Are you sure you want to delete this button?')) return;
    try {
      const res = await fetch(`/api/telegram-bot/button-labels?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        setButtonLabels(prev => prev.filter(b => b.id !== id));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete');
      }
    } catch {
      alert('Failed to delete');
    }
  };

  const tabs = [
    { id: 'learning' as TabId, label: 'Learning Content', icon: BookOpen },
    { id: 'messages' as TabId, label: 'Message Templates', icon: MessageSquare },
    { id: 'buttons' as TabId, label: 'Button Labels', icon: MousePointerClick },
    { id: 'settings' as TabId, label: 'Settings', icon: Settings },
  ];

  const filteredContent = contentTypeFilter === 'all'
    ? learningContent
    : learningContent.filter(c => c.type === contentTypeFilter);

  const getContentTypeConfig = (type: string) => {
    return CONTENT_TYPES.find(t => t.value === type) || CONTENT_TYPES[0];
  };

  const getCategoryConfig = (category: string) => {
    return CATEGORIES.find(c => c.value === category) || CATEGORIES[0];
  };

  return (
    <PageGuard permission={PERMISSIONS.TELEGRAM_BOT_VIEW}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Bot size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Telegram Bot Admin</h1>
              <p className="text-gray-500">Manage bot content, messages, and settings</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw size={32} className="text-purple-600 animate-spin" />
              <span className="text-gray-500">Loading...</span>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-red-700">
            {error}
          </div>
        ) : (
          <>
            {/* Learning Content Tab */}
            {activeTab === 'learning' && (
              <div>
                {/* Header with Add Button */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setContentTypeFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                        contentTypeFilter === 'all' ? 'bg-purple-100 text-purple-700' : 'bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All
                    </button>
                    {CONTENT_TYPES.map(type => (
                      <button
                        key={type.value}
                        onClick={() => setContentTypeFilter(type.value)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          contentTypeFilter === type.value ? type.color : 'bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {type.emoji} {type.label}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => {
                      setEditingContent(null);
                      setShowLearningModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Content
                  </button>
                </div>

                {/* Content List */}
                {filteredContent.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <BookOpen size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No learning content yet. Click "Add Content" to create one.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredContent.map(content => {
                      const typeConfig = getContentTypeConfig(content.type);
                      const categoryConfig = getCategoryConfig(content.category);
                      return (
                        <div key={content.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                          <div className="p-5">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className={`px-2 py-1 ${typeConfig.color} rounded text-xs font-medium`}>
                                    {typeConfig.emoji} {typeConfig.label}
                                  </span>
                                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                                    {categoryConfig.label}
                                  </span>
                                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                                    content.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                                  }`}>
                                    {content.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                <h3 className="font-semibold text-gray-900 mb-1">
                                  {content.title?.[selectedLang] || content.title?.en || 'Untitled'}
                                </h3>
                                <p className="text-sm text-gray-500 line-clamp-2">
                                  {content.content?.[selectedLang] || content.content?.en || ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => {
                                    setEditingContent(content);
                                    setShowLearningModal(true);
                                  }}
                                  className="p-2 hover:bg-gray-100 rounded-lg"
                                >
                                  <Pencil size={18} className="text-gray-500" />
                                </button>
                                <button
                                  onClick={() => handleDeleteContent(content.id)}
                                  className="p-2 hover:bg-red-50 rounded-lg"
                                >
                                  <Trash2 size={18} className="text-gray-500 hover:text-red-600" />
                                </button>
                              </div>
                            </div>

                            {/* Language Preview */}
                            <div className="mt-4 border-t border-gray-100 pt-4">
                              <div className="flex gap-2 mb-3">
                                {LANGUAGES.map(lang => (
                                  <button
                                    key={lang.code}
                                    onClick={() => setSelectedLang(lang.code)}
                                    className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                      selectedLang === lang.code ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                  >
                                    {lang.flag} {lang.name}
                                  </button>
                                ))}
                              </div>
                              <div className="bg-gray-50 rounded-lg p-4">
                                <p className="text-sm text-gray-700">
                                  {content.content?.[selectedLang] || content.content?.en || 'No content'}
                                </p>
                                {content.type === 'quiz' && content.quiz_options && (
                                  <div className="mt-3 space-y-2">
                                    {content.quiz_options.map((opt: LocalizedContent, idx: number) => (
                                      <div key={idx} className="flex items-center gap-2">
                                        <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-medium ${
                                          idx === content.quiz_correct_index
                                            ? 'bg-green-500 text-white'
                                            : 'bg-gray-200 text-gray-600'
                                        }`}>
                                          {String.fromCharCode(65 + idx)}
                                        </span>
                                        <span className="text-sm text-gray-600">
                                          {opt[selectedLang] || opt.en || ''}
                                        </span>
                                        {idx === content.quiz_correct_index && (
                                          <Check size={14} className="text-green-600" />
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Message Templates Tab */}
            {activeTab === 'messages' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500">Manage message templates for bot communications</p>
                  <button
                    onClick={() => {
                      setEditingTemplate(null);
                      setShowMessageModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Template
                  </button>
                </div>

                {messageTemplates.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <MessageSquare size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No message templates yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messageTemplates.map(template => (
                      <div key={template.id} className="bg-white rounded-xl border border-gray-200 p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-mono">
                                {template.key}
                              </span>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                template.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                              }`}>
                                {template.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500 mb-3">{template.description}</p>

                            {/* Language Tabs */}
                            <div className="flex gap-2 mb-3">
                              {LANGUAGES.map(lang => (
                                <button
                                  key={lang.code}
                                  onClick={() => setSelectedLang(lang.code)}
                                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                                    selectedLang === lang.code ? 'bg-gray-100 text-gray-700' : 'text-gray-500 hover:bg-gray-50'
                                  }`}
                                >
                                  {lang.flag} {lang.name}
                                </button>
                              ))}
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {template.content?.[selectedLang] || template.content?.en || ''}
                              </p>
                            </div>
                            {template.available_placeholders && template.available_placeholders.length > 0 && (
                              <div className="mt-2 flex items-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-500">Placeholders:</span>
                                {template.available_placeholders.map(p => (
                                  <span key={p} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs font-mono">
                                    {'{' + p + '}'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingTemplate(template);
                                setShowMessageModal(true);
                              }}
                              className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                              <Pencil size={18} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteTemplate(template.id)}
                              className="p-2 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 size={18} className="text-gray-500 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Button Labels Tab */}
            {activeTab === 'buttons' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-gray-500">Manage button labels for bot interactions</p>
                  <button
                    onClick={() => {
                      setEditingButton(null);
                      setShowButtonModal(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus size={18} />
                    Add Button
                  </button>
                </div>

                {buttonLabels.length === 0 ? (
                  <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                    <MousePointerClick size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500">No button labels yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {buttonLabels.map(button => (
                      <div key={button.id} className="bg-white rounded-xl border border-gray-200 p-4">
                        <div className="flex items-start justify-between mb-3">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                            {button.key}
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => {
                                setEditingButton(button);
                                setShowButtonModal(true);
                              }}
                              className="p-1.5 hover:bg-gray-100 rounded"
                            >
                              <Pencil size={14} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleDeleteButton(button.id)}
                              className="p-1.5 hover:bg-red-50 rounded"
                            >
                              <Trash2 size={14} className="text-gray-500 hover:text-red-600" />
                            </button>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mb-3">{button.description}</p>
                        <div className="space-y-2">
                          {LANGUAGES.map(lang => (
                            <div key={lang.code} className="flex items-center gap-2">
                              <span className="text-sm">{lang.flag}</span>
                              <span className="flex-1 px-3 py-1.5 bg-gray-100 rounded-lg text-sm">
                                {button.emoji && <span className="mr-1">{button.emoji}</span>}
                                {button.label?.[lang.code] || button.label?.en || ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4">Bot Settings</h3>
                <div className="space-y-4">
                  <SettingItem
                    label="Day Shift Reminder Time"
                    description="When to send checkout reminders for day shift employees"
                    defaultValue="18:30"
                    settingKey="day_shift_reminder_time"
                    settings={botSettings}
                    onUpdate={fetchData}
                  />
                  <SettingItem
                    label="Night Shift Reminder Time"
                    description="When to send checkout reminders for night shift employees (next day)"
                    defaultValue="10:00"
                    settingKey="night_shift_reminder_time"
                    settings={botSettings}
                    onUpdate={fetchData}
                  />
                  <SettingItem
                    label="Auto-Checkout Delay (minutes)"
                    description="How long to wait after reminder before auto-checkout"
                    defaultValue="45"
                    settingKey="auto_checkout_delay_minutes"
                    settings={botSettings}
                    onUpdate={fetchData}
                  />
                  <SettingItem
                    label="Day Shift Cutoff Hour"
                    description="Check-ins before this hour are considered day shift"
                    defaultValue="12"
                    settingKey="day_shift_cutoff_hour"
                    settings={botSettings}
                    onUpdate={fetchData}
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Learning Content Modal */}
        {showLearningModal && (
          <LearningContentModal
            content={editingContent}
            onClose={() => setShowLearningModal(false)}
            onSave={() => {
              setShowLearningModal(false);
              fetchData();
            }}
          />
        )}

        {/* Message Template Modal */}
        {showMessageModal && (
          <MessageTemplateModal
            template={editingTemplate}
            onClose={() => setShowMessageModal(false)}
            onSave={() => {
              setShowMessageModal(false);
              fetchData();
            }}
          />
        )}

        {/* Button Label Modal */}
        {showButtonModal && (
          <ButtonLabelModal
            button={editingButton}
            onClose={() => setShowButtonModal(false)}
            onSave={() => {
              setShowButtonModal(false);
              fetchData();
            }}
          />
        )}
      </div>
    </PageGuard>
  );
}

// Setting Item Component
function SettingItem({
  label,
  description,
  defaultValue,
  settingKey,
  settings,
  onUpdate,
}: {
  label: string;
  description: string;
  defaultValue: string;
  settingKey: string;
  settings: BotSettings[];
  onUpdate: () => void;
}) {
  const currentSetting = settings.find(s => s.key === settingKey);
  const [value, setValue] = useState(currentSetting?.value || defaultValue);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/telegram-bot/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: settingKey, value, description }),
      });
      if (res.ok) {
        onUpdate();
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <p className="font-medium text-gray-900">{label}</p>
        <p className="text-sm text-gray-500">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          className="w-24 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-center"
        />
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {isSaving ? '...' : 'Save'}
        </button>
      </div>
    </div>
  );
}

// Learning Content Modal Component
function LearningContentModal({
  content,
  onClose,
  onSave,
}: {
  content: BotLearningContent | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    type: content?.type || 'tip',
    category: content?.category || 'service_excellence',
    title: content?.title || { en: '', ru: '', uz: '' },
    content: content?.content || { en: '', ru: '', uz: '' },
    quiz_options: content?.quiz_options || [{ en: '', ru: '', uz: '' }, { en: '', ru: '', uz: '' }],
    quiz_correct_index: content?.quiz_correct_index || 0,
    quiz_explanation: content?.quiz_explanation || { en: '', ru: '', uz: '' },
    is_active: content?.is_active ?? true,
    display_order: content?.display_order || 0,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const url = '/api/telegram-bot/learning-content';
      const method = content ? 'PUT' : 'POST';
      const body = content ? { id: content.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const updateLocalizedField = (field: 'title' | 'content' | 'quiz_explanation', lang: SupportedLanguage, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: { ...prev[field], [lang]: value },
    }));
  };

  const updateQuizOption = (index: number, lang: SupportedLanguage, value: string) => {
    setFormData(prev => {
      const newOptions = [...prev.quiz_options];
      newOptions[index] = { ...newOptions[index], [lang]: value };
      return { ...prev, quiz_options: newOptions };
    });
  };

  const addQuizOption = () => {
    setFormData(prev => ({
      ...prev,
      quiz_options: [...prev.quiz_options, { en: '', ru: '', uz: '' }],
    }));
  };

  const removeQuizOption = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quiz_options: prev.quiz_options.filter((_, i) => i !== index),
      quiz_correct_index: prev.quiz_correct_index >= index && prev.quiz_correct_index > 0
        ? prev.quiz_correct_index - 1
        : prev.quiz_correct_index,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {content ? 'Edit Learning Content' : 'Add Learning Content'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Type & Category */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={formData.type}
                onChange={e => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                {CONTENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={e => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              >
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-4">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                  activeLang === lang.code ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>

          {/* Title */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Title ({activeLang.toUpperCase()})</label>
            <input
              type="text"
              value={formData.title[activeLang]}
              onChange={e => updateLocalizedField('title', activeLang, e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="Enter title..."
            />
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Content ({activeLang.toUpperCase()})</label>
            <textarea
              value={formData.content[activeLang]}
              onChange={e => updateLocalizedField('content', activeLang, e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="Enter content..."
            />
          </div>

          {/* Quiz Options (only for quiz type) */}
          {formData.type === 'quiz' && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Quiz Options ({activeLang.toUpperCase()})</label>
                <div className="space-y-2">
                  {formData.quiz_options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => setFormData(prev => ({ ...prev, quiz_correct_index: idx }))}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium ${
                          formData.quiz_correct_index === idx
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {String.fromCharCode(65 + idx)}
                      </button>
                      <input
                        type="text"
                        value={opt[activeLang] || ''}
                        onChange={e => updateQuizOption(idx, activeLang, e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg"
                        placeholder={`Option ${String.fromCharCode(65 + idx)}...`}
                      />
                      {formData.quiz_options.length > 2 && (
                        <button
                          onClick={() => removeQuizOption(idx)}
                          className="p-2 text-gray-400 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {formData.quiz_options.length < 5 && (
                  <button
                    onClick={addQuizOption}
                    className="mt-2 text-sm text-purple-600 hover:underline"
                  >
                    + Add option
                  </button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Explanation ({activeLang.toUpperCase()})</label>
                <textarea
                  value={formData.quiz_explanation[activeLang]}
                  onChange={e => updateLocalizedField('quiz_explanation', activeLang, e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  placeholder="Explanation for the correct answer..."
                />
              </div>
            </>
          )}

          {/* Active & Order */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="w-4 h-4 text-purple-600"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input
                type="number"
                value={formData.display_order}
                onChange={e => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Message Template Modal Component
function MessageTemplateModal({
  template,
  onClose,
  onSave,
}: {
  template: BotMessageTemplate | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    key: template?.key || '',
    description: template?.description || '',
    content: template?.content || { en: '', ru: '', uz: '' },
    available_placeholders: template?.available_placeholders || [],
    is_active: template?.is_active ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');
  const [newPlaceholder, setNewPlaceholder] = useState('');

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const url = '/api/telegram-bot/message-templates';
      const method = template ? 'PUT' : 'POST';
      const body = template ? { id: template.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const addPlaceholder = () => {
    if (newPlaceholder && !formData.available_placeholders.includes(newPlaceholder)) {
      setFormData(prev => ({
        ...prev,
        available_placeholders: [...prev.available_placeholders, newPlaceholder],
      }));
      setNewPlaceholder('');
    }
  };

  const removePlaceholder = (p: string) => {
    setFormData(prev => ({
      ...prev,
      available_placeholders: prev.available_placeholders.filter(x => x !== p),
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {template ? 'Edit Message Template' : 'Add Message Template'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Key & Description */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
              <input
                type="text"
                value={formData.key}
                onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
                placeholder="e.g., checkout_reminder"
                disabled={!!template}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="What this template is for..."
              />
            </div>
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-4">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                  activeLang === lang.code ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Content ({activeLang.toUpperCase()})</label>
            <textarea
              value={formData.content[activeLang]}
              onChange={e => setFormData(prev => ({ ...prev, content: { ...prev.content, [activeLang]: e.target.value } }))}
              rows={6}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
              placeholder="Enter message content..."
            />
          </div>

          {/* Placeholders */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Available Placeholders</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.available_placeholders.map(p => (
                <span key={p} className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                  {'{' + p + '}'}
                  <button onClick={() => removePlaceholder(p)} className="text-gray-400 hover:text-red-600">
                    <X size={12} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newPlaceholder}
                onChange={e => setNewPlaceholder(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg font-mono text-sm"
                placeholder="e.g., employee_name"
              />
              <button
                onClick={addPlaceholder}
                className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                Add
              </button>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Button Label Modal Component
function ButtonLabelModal({
  button,
  onClose,
  onSave,
}: {
  button: BotButtonLabel | null;
  onClose: () => void;
  onSave: () => void;
}) {
  const [formData, setFormData] = useState({
    key: button?.key || '',
    description: button?.description || '',
    label: button?.label || { en: '', ru: '', uz: '' },
    emoji: button?.emoji || '',
    is_active: button?.is_active ?? true,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [activeLang, setActiveLang] = useState<SupportedLanguage>('en');

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const url = '/api/telegram-bot/button-labels';
      const method = button ? 'PUT' : 'POST';
      const body = button ? { id: button.id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        onSave();
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to save');
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {button ? 'Edit Button Label' : 'Add Button Label'}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {/* Key */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Key</label>
            <input
              type="text"
              value={formData.key}
              onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg font-mono"
              placeholder="e.g., confirm_checkout"
              disabled={!!button}
            />
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="What this button is for..."
            />
          </div>

          {/* Emoji */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Emoji (optional)</label>
            <input
              type="text"
              value={formData.emoji}
              onChange={e => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="e.g., ✅"
            />
          </div>

          {/* Language Tabs */}
          <div className="flex gap-2 mb-4">
            {LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => setActiveLang(lang.code)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1 ${
                  activeLang === lang.code ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {lang.flag} {lang.name}
              </button>
            ))}
          </div>

          {/* Label */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Button Label ({activeLang.toUpperCase()})</label>
            <input
              type="text"
              value={formData.label[activeLang]}
              onChange={e => setFormData(prev => ({ ...prev, label: { ...prev.label, [activeLang]: e.target.value } }))}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg"
              placeholder="Enter button text..."
            />
          </div>

          {/* Preview */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
            <div className="bg-gray-100 rounded-lg p-4 flex justify-center">
              <span className="px-4 py-2 bg-blue-500 text-white rounded-lg">
                {formData.emoji && <span className="mr-1">{formData.emoji}</span>}
                {formData.label[activeLang] || 'Button Text'}
              </span>
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={e => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-purple-600"
            />
            <label htmlFor="is_active" className="text-sm text-gray-700">Active</label>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
