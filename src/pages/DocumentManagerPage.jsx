import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { documentService } from '../services/newFeatures';
import { useAuth } from '../context/AuthContext';
import DashboardSidebar from '../components/DashboardSidebar';

const DocumentManagerPage = () => {
  const { eventId } = useParams();
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => { if (eventId) fetchDocuments(); }, [eventId]);

  const fetchDocuments = async () => {
    try {
      const res = await documentService.getByEvent(eventId);
      setDocuments(res.data.data || []);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('event_id', eventId);
    formData.append('description', description);
    try {
      await documentService.upload(formData);
      setSelectedFile(null);
      setDescription('');
      fetchDocuments();
    } catch (err) { console.error(err); } finally { setUploading(false); }
  };

  const handleDelete = async (id) => {
    try {
      await documentService.delete(id);
      fetchDocuments();
    } catch (err) { console.error(err); }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('image')) return '🖼️';
    if (type?.includes('video')) return '🎬';
    if (type?.includes('spreadsheet') || type?.includes('excel')) return '📊';
    if (type?.includes('document') || type?.includes('word')) return '📝';
    return '📎';
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar />
      <main className="flex-1 p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Documents</h1>

          <form onSubmit={handleUpload} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="font-medium text-gray-900 mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-purple-400 transition-colors">
                <input type="file" onChange={(e) => setSelectedFile(e.target.files[0])} className="hidden" id="fileInput" />
                <label htmlFor="fileInput" className="cursor-pointer">
                  <p className="text-3xl mb-2">📁</p>
                  <p className="text-sm text-gray-600">{selectedFile ? selectedFile.name : 'Click to select a file'}</p>
                  {selectedFile && <p className="text-xs text-gray-500 mt-1">{formatSize(selectedFile.size)}</p>}
                </label>
              </div>
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description (optional)" className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
              <button type="submit" disabled={uploading || !selectedFile} className="px-6 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 disabled:opacity-50">{uploading ? 'Uploading...' : 'Upload'}</button>
            </div>
          </form>

          {loading ? (
            <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div></div>
          ) : documents.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center"><p className="text-gray-500">No documents uploaded yet</p></div>
          ) : (
            <div className="space-y-2">
              {documents.map(doc => (
                <div key={doc.id} className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{getFileIcon(doc.file_type)}</span>
                    <div>
                      <p className="font-medium text-gray-900">{doc.original_name}</p>
                      <p className="text-xs text-gray-500">{formatSize(doc.file_size)} • {doc.description || 'No description'} • {new Date(doc.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(doc.id)} className="px-3 py-1 text-xs text-red-600 bg-red-50 rounded hover:bg-red-100">Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DocumentManagerPage;