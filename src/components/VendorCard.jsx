import { Link } from 'react-router-dom';

const VendorCard = ({ vendor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            {vendor.business_name?.charAt(0) || vendor.name?.charAt(0) || 'V'}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{vendor.business_name || vendor.name}</h3>
            <p className="text-sm text-gray-500">{vendor.category_name || vendor.category}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-gray-600 line-clamp-2">{vendor.description}</p>
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-yellow-400">★</span>
            <span className="text-sm font-medium text-gray-900">{vendor.rating?.toFixed(1) || '0.0'}</span>
            <span className="text-sm text-gray-500">({vendor.review_count || 0})</span>
          </div>
          <div className="text-sm text-gray-500">
            {vendor.city && <span>{vendor.city}{vendor.state && `, ${vendor.state}`}</span>}
          </div>
        </div>
        <Link to={`/vendors/${vendor.id}`} className="mt-4 block text-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
          View Services
        </Link>
      </div>
    </div>
  );
};

export default VendorCard;