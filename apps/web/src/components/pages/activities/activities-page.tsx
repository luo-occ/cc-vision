'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Activity, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export default function ActivitiesPage() {
  // Mock data for activities - in real app this would come from API
  const activities = [
    {
      id: 1,
      type: 'buy',
      symbol: 'AAPL',
      quantity: 10,
      price: 150.00,
      date: '2024-01-15',
      total: 1500.00
    },
    {
      id: 2,
      type: 'sell',
      symbol: 'GOOGL',
      quantity: 5,
      price: 120.00,
      date: '2024-01-10',
      total: 600.00
    },
    {
      id: 3,
      type: 'buy',
      symbol: 'TSLA',
      quantity: 8,
      price: 200.00,
      date: '2024-01-08',
      total: 1600.00
    }
  ];

  if (activities.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <Activity className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">No Activities Yet</h2>
          <p className="mt-2 text-muted-foreground">
            Your trading activities will appear here once you start making transactions.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <div className="px-4 py-6 md:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Activities</h1>
          <p className="mt-1 text-muted-foreground">
            View your complete trading history and transaction details.
          </p>
        </div>

        {/* Activities Summary */}
        <div className="grid gap-6 md:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activities.length}</div>
              <p className="text-xs text-muted-foreground">
                All time transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Buy Orders</CardTitle>
              <ArrowDownLeft className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {activities.filter(a => a.type === 'buy').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Purchase transactions
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sell Orders</CardTitle>
              <ArrowUpRight className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {activities.filter(a => a.type === 'sell').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sale transactions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Activities List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activities</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-4 rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-full ${
                      activity.type === 'buy' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {activity.type === 'buy' ? (
                        <ArrowDownLeft className="h-4 w-4" />
                      ) : (
                        <ArrowUpRight className="h-4 w-4" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold">
                        {activity.type.charAt(0).toUpperCase() + activity.type.slice(1)} {activity.symbol}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {activity.quantity} shares @ ${activity.price.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">
                      ${activity.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(activity.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}