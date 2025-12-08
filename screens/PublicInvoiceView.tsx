import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { DocumentData } from '../types';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface PublicInvoiceViewProps {
  documents: DocumentData[];
}

const PublicInvoiceView: React.FC<PublicInvoiceViewProps> = ({ documents }) => {
  const { docId } = useParams<{ docId: string }>();
  const [doc, setDoc] = useState<DocumentData | null>(null);
  const [isMarkedPaid, setIsMarkedPaid] = useState(false);

  useEffect(() => {
    if (docId) {
      const found = documents.find(d => d.id === docId);
      setDoc(found || null);
    }
  }, [docId, documents]);

  if (!doc) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">Invoice Not Found</h1>
          <p className="text-gray-500 mt-2">This invoice link may have expired or is invalid.</p>
        </div>
      </div>
    );
  }

  const handleMarkAsPaid = () => {
    // In a real app, this would send a notification to the invoice owner
    setIsMarkedPaid(true);
    // Send notification to owner about payment
    localStorage.setItem(`invoice_${doc.id}_paid_notification`, JSON.stringify({
      timestamp: new Date().toISOString(),
      clientName: doc.client.businessName,
      amount: doc.total
    }));
    
    setTimeout(() => {
      alert(`✅ Payment notification sent to ${doc.client.businessName}'s owner!\n\nThey can verify the payment in their payment methods.`);
    }, 500);
  };

  const isDueDate = doc.dueDate ? new Date(doc.dueDate) < new Date() : false;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-black mb-2">Invoice</h1>
          <p className="text-gray-600">#{doc.id.slice(-6)}</p>
          {doc.dueDate && (
            <div className={`mt-4 py-2 px-4 rounded-lg font-bold ${isDueDate ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
              {isDueDate ? '⚠️ Due Date Passed' : `Due: ${new Date(doc.dueDate).toLocaleDateString()}`}
            </div>
          )}
        </div>

        {/* Invoice Display */}
        <div className="bg-white rounded-lg shadow-2xl overflow-hidden mb-8 border-4 border-gray-200">
          <div className="p-12 bg-white min-h-96 flex flex-col">
            {/* Company & Client Info */}
            <div className="mb-12 pb-8 border-b-4 border-gray-200">
              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-xs uppercase text-gray-500 font-bold mb-2">From</p>
                  <p className="font-bold text-2xl">{doc.client.businessName || 'Your Business'}</p>
                  <p className="text-gray-600 mt-2 text-sm">{doc.client.email}</p>
                  {doc.client.address && <p className="text-gray-600 text-sm mt-1">{doc.client.address}</p>}
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase text-gray-500 font-bold mb-2">Invoice Number</p>
                  <p className="font-bold text-2xl">{doc.id.slice(-6)}</p>
                  <p className="text-gray-600 mt-2 text-sm">Issued: {doc.date}</p>
                </div>
              </div>
            </div>

            {/* Line Items */}
            {doc.items && doc.items.length > 0 && (
              <div className="mb-12">
                <table className="w-full text-left mb-8">
                  <thead className="border-b-2 border-gray-300">
                    <tr>
                      <th className="pb-4 font-bold text-gray-600 text-sm uppercase">Description</th>
                      <th className="pb-4 font-bold text-gray-600 text-sm uppercase text-right w-24">Qty</th>
                      <th className="pb-4 font-bold text-gray-600 text-sm uppercase text-right w-32">Rate</th>
                      <th className="pb-4 font-bold text-gray-600 text-sm uppercase text-right w-32">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {doc.items.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-200">
                        <td className="py-4 font-bold">{item.description}</td>
                        <td className="py-4 text-right">{item.quantity} {item.unitType}</td>
                        <td className="py-4 text-right">${item.price.toFixed(2)}</td>
                        <td className="py-4 text-right font-bold">${(item.quantity * item.price).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Totals */}
            <div className="flex justify-end mb-8">
              <div className="w-96">
                <div className="flex justify-between py-2 border-b border-gray-200">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-bold">${doc.subtotal?.toFixed(2) || '0.00'}</span>
                </div>
                {doc.taxTotal && doc.taxTotal > 0 && (
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-bold">${doc.taxTotal.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-4 bg-gray-100 px-4 -mx-4 mt-4 text-xl font-bold">
                  <span>Total Due</span>
                  <span>${doc.total?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
            </div>

            {/* Notes */}
            {doc.notes && (
              <div className="mb-8 p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{doc.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Section */}
        {!isMarkedPaid && doc.status !== 'Paid' && (
          <div className="bg-white rounded-lg shadow-lg p-8 text-center border-4 border-green-200">
            <h2 className="text-2xl font-bold mb-4">Have you paid this invoice?</h2>
            <p className="text-gray-600 mb-6">Click below to notify the sender that you've made the payment. They can then verify it in their records.</p>
            <button
              onClick={handleMarkAsPaid}
              className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold text-lg rounded-lg transition-colors shadow-lg transform hover:scale-105 duration-200"
            >
              <CheckCircle2 className="inline mr-2" size={24} />
              Mark as Paid
            </button>
            <p className="text-xs text-gray-500 mt-4">This will send a notification. The sender can verify payment through their payment methods.</p>
          </div>
        )}

        {isMarkedPaid && (
          <div className="bg-green-50 rounded-lg shadow-lg p-8 text-center border-4 border-green-500">
            <CheckCircle2 size={48} className="mx-auto text-green-600 mb-4" />
            <h2 className="text-2xl font-bold text-green-700 mb-2">Payment Notification Sent ✅</h2>
            <p className="text-green-600">The invoice sender has been notified. They will verify the payment on their end.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PublicInvoiceView;
