const LoadingSkeleton = ({ type = 'card', count = 3 }) => {
  const skeletons = {
    card: Array(count).fill(null).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="h-2 bg-gray-200 rounded mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
        <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
        <div className="flex justify-between">
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
        </div>
      </div>
    )),
    table: Array(count).fill(null).map((_, i) => (
      <div key={i} className="flex items-center space-x-4 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      </div>
    )),
    stats: Array(4).fill(null).map((_, i) => (
      <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-16"></div>
          </div>
          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    )),
    text: Array(count).fill(null).map((_, i) => (
      <div key={i} className="animate-pulse space-y-3">
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
      </div>
    ))
  };

  return <div className="grid gap-6">{skeletons[type] || skeletons.card}</div>;
};

export default LoadingSkeleton;
