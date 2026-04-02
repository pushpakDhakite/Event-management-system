import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardSidebar from '../components/DashboardSidebar';

const AgendaBuilderPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([
    { id: 1, title: 'Registration', start: '09:00', end: '09:30', speaker: '', description: '' },
    { id: 2, title: 'Opening Remarks', start: '09:30', end: '10:00', speaker: '', description: '' },
    { id: 3, title: 'Keynote Session', start: '10:00', end: '11:00', speaker: '', description: '' },
    { id: 4, title: 'Coffee Break', start: '11:00', end: '11:30', speaker: '', description: '' },
    { id: 5, title: 'Workshop Session', start: '11:30', end: '13:00', speaker: '', description: '' },
    { id: 6, title: 'Lunch Break', start: '13:00', end: '14:00', speaker: '', description: '' },
    { id: 7, title: 'Panel Discussion', start: '14:00', end: '15:30', speaker: '', description: '' },
    { id: 8, title: 'Closing Remarks', start: '15:30', end: '16:00', speaker: '', description: '' }
  ]);
  const [editingId, setEditingId] = useState(null);

  const addItem = () => {
    const lastItem = items[items.length - 1];
    const newStart = lastItem ? lastItem.end : '09:00';
    setItems([...items, { id: Date.now(), title: 'New Session', start: newStart, end: newStart, speaker: '', description: '' }]);
  };

  const updateItem = (id, field, value) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const removeItem = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  const moveItem = (index, direction) => {
    const newItems = [...items];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => navigate(-1)} className="text-sm text-purple-600 hover:text-purple-700 mb-2">← Back</button>
              <h1 className="text-2xl font-bold text-gray-900">Agenda Builder</h1>
            </div>
            <button onClick={addItem} className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">+ Add Session</button>
          </div>

          <div className="space-y-3">
            {items.map((item, index) => (
              <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="flex items-center">
                  <div className="flex flex-col border-r border-gray-200">
                    <button onClick={() => moveItem(index, -1)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600">↑</button>
                    <button onClick={() => moveItem(index, 1)} className="p-2 hover:bg-gray-100 text-gray-400 hover:text-gray-600">↓</button>
                  </div>
                  <div className="flex-1 p-4">
                    {editingId === item.id ? (
                      <div className="space-y-3">
                        <input type="text" value={item.title} onChange={(e) => updateItem(item.id, 'title', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium" placeholder="Session title" />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="time" value={item.start} onChange={(e) => updateItem(item.id, 'start', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                          <input type="time" value={item.end} onChange={(e) => updateItem(item.id, 'end', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                        </div>
                        <input type="text" value={item.speaker} onChange={(e) => updateItem(item.id, 'speaker', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Speaker name" />
                        <textarea value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Description"></textarea>
                        <div className="flex space-x-2">
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-white bg-green-600 rounded hover:bg-green-700">Save</button>
                          <button onClick={() => setEditingId(null)} className="px-3 py-1 text-xs text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <p className="text-sm font-medium text-purple-600">{item.start}</p>
                            <p className="text-xs text-gray-500">{item.end}</p>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{item.title}</p>
                            {item.speaker && <p className="text-sm text-gray-500">🎤 {item.speaker}</p>}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => setEditingId(item.id)} className="px-3 py-1 text-xs text-blue-600 bg-blue-50 rounded hover:bg-blue-100">Edit</button>
                          <button onClick={() => removeItem(item.id)} className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Remove</button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button onClick={() => navigate(-1)} className="px-6 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">Cancel</button>
            <button className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90">Save Agenda</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AgendaBuilderPage;