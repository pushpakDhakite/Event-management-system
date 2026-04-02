import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { paymentService } from '../services';
import DashboardSidebar from '../components/DashboardSidebar';

const PaymentPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    booking_id: '',
    amount: '',
    payment_method: 'credit_card',
    description: ''
  });
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvv: '', name: '' });
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    setCardDetails({ ...cardDetails, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const res = await paymentService.create(formData);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  };

  if (result) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <DashboardSidebar />
        <main className="flex-1 p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">Your payment has been processed successfully</p>
            <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2 mb-6">
              <div className="flex justify-between"><span className="text-gray-600">Invoice</span><span className="font-medium">{result.invoice_number}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Amount</span><span className="font-bold text-purple-600">${parseFloat(result.amount).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Method</span><span className="font-medium capitalize">{result.payment_method?.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Status</span><span className="font-medium text-green-600 capitalize">{result.status}</span></div>
              <div className="flex justify-between"><span className="text-gray-600">Date</span><span className="font-medium">{new Date(result.created_at).toLocaleDateString()}</span></div>
            </div>
            <button onClick={() => { setResult(null); setFormData({ booking_id: '', amount: '', payment_method: 'credit_card', description: '' }); }} className="w-full py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Make Another Payment</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Make a Payment</h1>

          {error && <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">{error}</div>}

          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Booking ID *</label>
                <input type="number" name="booking_id" value={formData.booking_id} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="1" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Amount ($) *</label>
                <input type="number" name="amount" value={formData.amount} onChange={handleChange} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="0.00" step="0.01" min="0" required />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'credit_card', label: 'Credit Card', icon: '💳' },
                  { value: 'upi', label: 'UPI', icon: '📱' },
                  { value: 'wallet', label: 'Wallet', icon: '👛' }
                ].map((method) => (
                  <button key={method.value} type="button" onClick={() => setFormData({ ...formData, payment_method: method.value })} className={`p-4 rounded-lg border-2 text-center transition-all ${formData.payment_method === method.value ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-2xl mb-1">{method.icon}</div>
                    <p className="text-sm font-medium text-gray-900">{method.label}</p>
                  </button>
                ))}
              </div>
            </div>

            {formData.payment_method === 'credit_card' && (
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                <p className="text-sm font-medium text-gray-700">Card Details (Dummy)</p>
                <input type="text" name="number" value={cardDetails.number} onChange={handleCardChange} placeholder="4242 4242 4242 4242" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" maxLength={19} />
                <div className="grid grid-cols-3 gap-3">
                  <input type="text" name="expiry" value={cardDetails.expiry} onChange={handleCardChange} placeholder="MM/YY" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" maxLength={5} />
                  <input type="text" name="cvv" value={cardDetails.cvv} onChange={handleCardChange} placeholder="CVV" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" maxLength={4} />
                  <input type="text" name="name" value={cardDetails.name} onChange={handleCardChange} placeholder="Cardholder" className="px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                </div>
              </div>
            )}

            {formData.payment_method === 'upi' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">UPI ID (Dummy)</p>
                <input type="text" placeholder="yourname@upi" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              </div>
            )}

            {formData.payment_method === 'wallet' && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-700 mb-2">Wallet Balance (Dummy)</p>
                <p className="text-2xl font-bold text-purple-600">$1,000.00</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={2} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" placeholder="Payment description"></textarea>
            </div>

            <button type="submit" disabled={processing} className="w-full py-3 text-white font-semibold bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 disabled:opacity-50 flex items-center justify-center space-x-2">
              {processing ? <><div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div><span>Processing...</span></> : <span>Pay ${formData.amount ? parseFloat(formData.amount).toLocaleString() : '0.00'}</span>}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PaymentPage;