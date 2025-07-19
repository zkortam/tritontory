"use client";

import { useState } from "react";
import { FALLBACK_STOCK_DATA, type StockData } from "@/lib/stock-service";

export default function StockTestPage() {
  const [stocks] = useState<StockData[]>(FALLBACK_STOCK_DATA);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Stock Ticker Test Page</h1>
      <p className="text-gray-600 mb-8">
        This page displays the static stock data used in the ticker. All values are set to 0.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <div
            key={stock.symbol}
            className="p-4 border rounded-lg shadow-sm"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg">{stock.symbol}</h3>
              <span className="text-sm font-medium text-gray-500">
                {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
              </span>
            </div>
            <div className="text-2xl font-bold">
              ${stock.price.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h3 className="font-bold mb-2">Debug Information:</h3>
        <ul className="text-sm space-y-1">
          <li>• Stock symbols loaded: {stocks.length}</li>
          <li>• All values set to 0 (static data)</li>
          <li>• No API calls made</li>
          <li>• Environment: {process.env.NODE_ENV}</li>
        </ul>
      </div>
    </div>
  );
} 