'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { FileText, Mail, CheckCircle, Download, Shield, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';

interface DocumentData {
  id: string;
  candidate_id: string;
  candidate_name: string;
  candidate_email: string;
  document_type: string;
  position: string;
  branch: string;
  start_date: string;
  end_date: string;
  salary: string;
  work_hours: string;
  created_at: string;
  signed_at: string | null;
  signature_data: string | null;
}

type Step = 'email' | 'otp' | 'document' | 'signature' | 'success';

export default function DocumentSigningPage() {
  const params = useParams();
  const token = params.token as string;

  const [step, setStep] = useState<Step>('email');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [document, setDocument] = useState<DocumentData | null>(null);

  // Email verification
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);

  // OTP verification
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState('');
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Signature
  const [signatureType, setSignatureType] = useState<'draw' | 'type'>('draw');
  const [typedName, setTypedName] = useState('');
  const [selectedStyle, setSelectedStyle] = useState(1);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Canvas
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);

  // Fetch document info
  useEffect(() => {
    fetchDocument();
  }, [token]);

  const fetchDocument = async () => {
    try {
      const res = await fetch(`/api/documents/sign/${token}`);
      if (res.ok) {
        const data = await res.json();
        setDocument(data.document);
        setEmail(data.document.candidate_email);
        setTypedName(data.document.candidate_name);

        // If already signed, show success
        if (data.document.signed_at) {
          setStep('success');
        }
      } else {
        const data = await res.json();
        setError(data.error || 'Document not found');
      }
    } catch (err) {
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async () => {
    setSendingOtp(true);
    try {
      const res = await fetch(`/api/documents/sign/${token}/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStep('otp');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to send verification code');
      }
    } catch (err) {
      setError('Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setOtpError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP
  const handleVerifyOtp = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setOtpError('Please enter the complete code');
      return;
    }

    setVerifyingOtp(true);
    try {
      const res = await fetch(`/api/documents/sign/${token}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp: otpCode }),
      });

      if (res.ok) {
        setStep('document');
      } else {
        const data = await res.json();
        setOtpError(data.error || 'Invalid code');
      }
    } catch (err) {
      setOtpError('Verification failed');
    } finally {
      setVerifyingOtp(false);
    }
  };

  // Canvas drawing
  useEffect(() => {
    if (step === 'signature' && signatureType === 'draw') {
      initCanvas();
    }
  }, [step, signatureType]);

  const initCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Set drawing style
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);
    ctx.beginPath();
    ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx) return;

    ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  // Touch support for canvas
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    setIsDrawing(true);
    setHasDrawn(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  // Submit signature
  const handleSubmit = async () => {
    if (!agreed) return;

    let signatureData = '';

    if (signatureType === 'draw') {
      const canvas = canvasRef.current;
      if (!canvas || !hasDrawn) {
        setError('Please draw your signature');
        return;
      }
      signatureData = canvas.toDataURL('image/png');
    } else {
      if (!typedName.trim()) {
        setError('Please enter your name');
        return;
      }
      signatureData = JSON.stringify({
        type: 'typed',
        name: typedName,
        style: selectedStyle,
      });
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/documents/sign/${token}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature_type: signatureType,
          signature_data: signatureData,
        }),
      });

      if (res.ok) {
        setStep('success');
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to submit signature');
      }
    } catch (err) {
      setError('Failed to submit signature');
    } finally {
      setSubmitting(false);
    }
  };

  // Progress indicator
  const getStepNumber = () => {
    switch (step) {
      case 'email': return 1;
      case 'otp': return 2;
      case 'document': return 3;
      case 'signature': return 4;
      case 'success': return 5;
      default: return 1;
    }
  };

  const ProgressSteps = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {[1, 2, 3, 4].map((num) => (
        <div key={num} className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            num < getStepNumber()
              ? 'bg-green-500 text-white'
              : num === getStepNumber()
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'
              : 'bg-gray-200 text-gray-500'
          }`}>
            {num < getStepNumber() ? '✓' : num}
          </div>
          {num < 4 && (
            <div className={`w-8 md:w-12 h-1 rounded ${
              num < getStepNumber() ? 'bg-green-500' : 'bg-gray-200'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !document) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Document Not Found</h1>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  // Step 1: Email Verification
  if (step === 'email') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Подписание документа</h1>
            <p className="text-gray-500 mt-2">C-Space Coworking</p>
          </div>

          <ProgressSteps />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ваш email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-all"
              placeholder="example@email.com"
            />
            <p className="text-xs text-gray-500 mt-2">Введите email, указанный при подаче заявки</p>
          </div>

          <button
            onClick={handleSendOtp}
            disabled={!email || sendingOtp}
            className="w-full mt-6 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendingOtp ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Отправка...
              </>
            ) : (
              <>
                Получить код подтверждения
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 mt-6">
            Документ: {document?.document_type}<br />
            Кандидат: {document?.candidate_name}
          </p>
        </div>
      </div>
    );
  }

  // Step 2: OTP Verification
  if (step === 'otp') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Проверьте почту</h1>
            <p className="text-gray-500 mt-2">Мы отправили 6-значный код на</p>
            <p className="text-purple-600 font-medium">{email}</p>
          </div>

          <ProgressSteps />

          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { otpInputRefs.current[index] = el; }}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-purple-500 outline-none"
              />
            ))}
          </div>

          {otpError && (
            <p className="text-center text-red-500 text-sm mb-4">{otpError}</p>
          )}

          <button
            onClick={handleVerifyOtp}
            disabled={verifyingOtp}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors disabled:opacity-50"
          >
            {verifyingOtp ? 'Проверка...' : 'Подтвердить'}
          </button>

          <div className="text-center mt-4">
            <button
              onClick={handleSendOtp}
              className="text-purple-600 text-sm hover:underline"
            >
              Отправить код повторно
            </button>
            <p className="text-xs text-gray-400 mt-2">Код действителен 10 минут</p>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Document Review
  if (step === 'document') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h1 className="font-semibold text-gray-900">{document?.document_type}</h1>
                  <p className="text-sm text-gray-500">{document?.candidate_name} • {document?.position}</p>
                </div>
              </div>
              <ProgressSteps />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Document Preview */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="font-semibold text-gray-900 mb-4">Просмотр документа</h2>

                {/* Term Sheet Content */}
                <div className="bg-white border rounded-lg p-8 shadow-md">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-6">
                    <p className="text-xs text-gray-400">Условия трудоустройства</p>
                    <div className="text-right">
                      <div className="w-20 h-8 bg-purple-100 rounded flex items-center justify-center">
                        <span className="text-purple-600 font-bold text-xs">C-SPACE</span>
                      </div>
                    </div>
                  </div>

                  <h2 className="text-2xl font-bold text-purple-600 text-center mb-6">УСЛОВИЯ ТРУДОУСТРОЙСТВА</h2>
                  <p className="text-center text-gray-600 mb-8">Должность: {document?.position}</p>

                  {/* Section 1 */}
                  <div className="mb-6">
                    <h3 className="text-purple-600 font-semibold mb-3">1. Информация о кандидате</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">ФИО</span>
                        <span>{document?.candidate_name}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">Должность</span>
                        <span>{document?.position}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">Филиал</span>
                        <span>{document?.branch}</span>
                      </div>
                    </div>
                  </div>

                  {/* Section 3 */}
                  <div className="mb-6">
                    <h3 className="text-purple-600 font-semibold mb-3">3. Условия трудоустройства</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">Дата начала</span>
                        <span>{document?.start_date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">Дата окончания</span>
                        <span>{document?.end_date}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">Рабочие часы</span>
                        <span>{document?.work_hours}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-purple-600 font-medium">Зарплата</span>
                        <span className="font-medium">{document?.salary}</span>
                      </div>
                    </div>
                  </div>

                  {/* Signature Area */}
                  <div className="mt-8 pt-6 border-t">
                    <h3 className="text-purple-600 font-semibold mb-4">8. Подтверждение и подписи</h3>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="border-2 border-dashed border-purple-300 rounded-xl p-4 bg-purple-50">
                        <h4 className="text-purple-600 font-medium text-sm mb-2">КАНДИДАТ</h4>
                        <p className="text-sm text-gray-600 mb-2">ФИО: {document?.candidate_name}</p>
                        <div className="h-16 border-2 border-dashed border-purple-300 rounded-lg flex items-center justify-center cursor-pointer hover:bg-purple-100 transition-colors"
                             onClick={() => setStep('signature')}>
                          <span className="text-purple-600 text-sm font-medium">+ Нажмите, чтобы подписать</span>
                        </div>
                      </div>
                      <div className="border-2 border-gray-200 rounded-xl p-4">
                        <h4 className="text-purple-600 font-medium text-sm mb-2">ПРЕДСТАВИТЕЛЬ C-SPACE</h4>
                        <p className="text-sm text-gray-600 mb-2">ФИО: Абдурахмонов Зухриддин</p>
                        <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-sm">Ожидание подписи кандидата</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-4">Детали документа</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Тип:</span>
                    <span className="text-gray-900">{document?.document_type}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Должность:</span>
                    <span className="text-gray-900">{document?.position}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Филиал:</span>
                    <span className="text-gray-900">{document?.branch}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Дата начала:</span>
                    <span className="text-gray-900">{document?.start_date}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Зарплата:</span>
                    <span className="text-gray-900 font-medium">{document?.salary}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep('signature')}
                className="w-full px-6 py-4 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                <FileText className="w-5 h-5" />
                Подписать документ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Signature
  if (step === 'signature') {
    return (
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <div className="bg-white border-b sticky top-0 z-40">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setStep('document')}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div>
                  <h1 className="font-semibold text-gray-900">Создайте подпись</h1>
                  <p className="text-sm text-gray-500">Выберите способ подписания</p>
                </div>
              </div>
              <ProgressSteps />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Signature Tabs */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="flex border-b">
              <button
                onClick={() => setSignatureType('draw')}
                className={`flex-1 px-6 py-4 font-medium ${
                  signatureType === 'draw'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ✏️ Нарисовать подпись
              </button>
              <button
                onClick={() => setSignatureType('type')}
                className={`flex-1 px-6 py-4 font-medium ${
                  signatureType === 'type'
                    ? 'text-purple-600 border-b-2 border-purple-600 bg-purple-50'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                ⌨️ Напечатать подпись
              </button>
            </div>

            {/* Draw Signature */}
            {signatureType === 'draw' && (
              <div className="p-8">
                <p className="text-sm text-gray-600 mb-4">Используйте мышь или палец, чтобы нарисовать вашу подпись</p>

                <div className="border-2 border-gray-200 rounded-xl overflow-hidden mb-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full bg-white cursor-crosshair"
                    style={{ touchAction: 'none' }}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={stopDrawing}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <button
                    onClick={clearCanvas}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800 flex items-center gap-2"
                  >
                    <Trash2 className="w-5 h-5" />
                    Очистить
                  </button>
                </div>
              </div>
            )}

            {/* Type Signature */}
            {signatureType === 'type' && (
              <div className="p-8">
                <p className="text-sm text-gray-600 mb-4">Введите ваше полное имя, и мы создадим подпись</p>

                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none mb-6"
                  placeholder="Введите ваше имя"
                />

                <p className="text-sm text-gray-500 mb-3">Выберите стиль:</p>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  {[1, 2, 3].map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`border-2 rounded-xl p-4 hover:border-purple-500 transition-colors ${
                        selectedStyle === style ? 'border-purple-500' : 'border-gray-200'
                      }`}
                    >
                      <p className={`text-2xl text-gray-800 ${
                        style === 1 ? 'font-cursive italic' :
                        style === 2 ? 'font-serif italic' :
                        'font-sans font-light'
                      }`}>
                        {typedName || 'Ваше имя'}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="bg-gray-50 rounded-xl p-6 text-center">
                  <p className="text-sm text-gray-500 mb-2">Предпросмотр подписи:</p>
                  <p className={`text-4xl text-gray-800 ${
                    selectedStyle === 1 ? 'font-cursive italic' :
                    selectedStyle === 2 ? 'font-serif italic' :
                    'font-sans font-light'
                  }`}>
                    {typedName || 'Ваше имя'}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Agreement & Submit */}
          <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
              <span className="text-sm text-gray-600">
                Я подтверждаю, что прочитал(а) и понял(а) все условия, изложенные в документе &quot;Условия трудоустройства&quot;,
                и добровольно соглашаюсь с ними. Моя электронная подпись имеет такую же юридическую силу, как и собственноручная.
              </span>
            </label>

            {error && (
              <p className="mt-4 text-red-500 text-sm">{error}</p>
            )}

            <button
              onClick={handleSubmit}
              disabled={!agreed || submitting || (signatureType === 'draw' && !hasDrawn) || (signatureType === 'type' && !typedName.trim())}
              className="w-full mt-6 px-6 py-4 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Отправка...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Подписать и отправить
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 5: Success
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 text-center">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">Документ подписан!</h1>
          <p className="text-gray-500 mb-6">
            Ваша подпись успешно сохранена. Копия подписанного документа отправлена на вашу почту.
          </p>

          <div className="bg-gray-50 rounded-xl p-4 mb-6 text-left">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{document?.document_type}</p>
                <p className="text-sm text-gray-500">
                  Подписано {new Date().toLocaleDateString('ru-RU', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600">
              <Shield className="w-4 h-4" />
              Документ защищён электронной подписью
            </div>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-6 text-left">
            <h3 className="font-medium text-blue-900 mb-2">Следующие шаги:</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Приходите {document?.start_date} к 8:50 в {document?.branch}</li>
              <li>• Принесите паспорт для оформления</li>
              <li>• Ознакомьтесь с программой адаптации</li>
            </ul>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            Скачать подписанный PDF
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Копия также отправлена на {document?.candidate_email}
          </p>
        </div>
      </div>
    );
  }

  return null;
}
