const ServiceCard = ({ service, onBook }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
          <p className="text-sm text-gray-500">{service.vendor_name}</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-purple-600">${service.price?.toLocaleString()}</p>
          {service.duration_minutes && (
            <p className="text-xs text-gray-500">{service.duration_minutes} min</p>
          )}
        </div>
      </div>
      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{service.description}</p>
      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-1">
          <span className="text-yellow-400">★</span>
          <span className="text-sm font-medium">{service.vendor_rating?.toFixed(1) || 'N/A'}</span>
        </div>
        {onBook && (
          <button
            onClick={() => onBook(service)}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-500 rounded-lg hover:opacity-90 transition-opacity"
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default ServiceCard;