const BudgetCalculator = ({ guestCount, budget, services }) => {
  const venueCost = budget ? budget * 0.4 : 0;
  const foodCost = guestCount && services?.food ? services.food * guestCount : 0;
  const decorationCost = services?.decoration || 0;
  const entertainmentCost = services?.entertainment || 0;
  const transportCost = services?.transportation || 0;
  const accommodationCost = services?.accommodation || 0;

  const total = venueCost + foodCost + decorationCost + entertainmentCost + transportCost + accommodationCost;

  const items = [
    { name: 'Venue', cost: venueCost, percentage: budget ? 40 : 0 },
    { name: 'Food & Catering', cost: foodCost, percentage: guestCount ? Math.round((foodCost / total) * 100) || 0 : 0 },
    { name: 'Decoration', cost: decorationCost, percentage: total ? Math.round((decorationCost / total) * 100) || 0 : 0 },
    { name: 'Entertainment', cost: entertainmentCost, percentage: total ? Math.round((entertainmentCost / total) * 100) || 0 : 0 },
    { name: 'Transportation', cost: transportCost, percentage: total ? Math.round((transportCost / total) * 100) || 0 : 0 },
    { name: 'Accommodation', cost: accommodationCost, percentage: total ? Math.round((accommodationCost / total) * 100) || 0 : 0 }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Calculator</h3>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.name}</span>
            <div className="flex items-center space-x-3">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full" style={{ width: `${item.percentage}%` }}></div>
              </div>
              <span className="text-sm font-medium text-gray-900 w-20 text-right">${item.cost.toLocaleString()}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
        <span className="text-base font-semibold text-gray-900">Total Estimated</span>
        <span className="text-xl font-bold text-purple-600">${total.toLocaleString()}</span>
      </div>
      {budget && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Your Budget</span>
            <span className="font-medium">${budget.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Difference</span>
            <span className={`font-medium ${total > budget ? 'text-red-600' : 'text-green-600'}`}>
              {total > budget ? '+' : ''}${(total - budget).toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetCalculator;