import React, { useEffect, useState } from "react";
import LineChart from "../assets/LineChart";

export default function CryptoTable() {
  const [cryptoData, setCryptoData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDataCache, setPageDataCache] = useState({});

  const fetchCryptoData = (page) => {
    // Check if data for this page is already cached
    if (pageDataCache[page]) {
      setCryptoData(pageDataCache[page]);
      return;
    }

    // Fetch data if it's not cached
    fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=${page}&sparkline=true&price_change_percentage=1h,24h,7d`
    )
    
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        return response.json();
      })
      .then((data) => {
        setCryptoData(data);

        // Cache the data for future use
        setPageDataCache((prevCache) => ({
          ...prevCache,
          [page]: data,
        }));
      })
      .catch((error) => console.error("Error fetching data:", error));
  };

  useEffect(() => {
    fetchCryptoData(currentPage);

    const interval = setInterval(() => {
      fetchCryptoData(currentPage);
    }, 60000);

    return () => clearInterval(interval);
  }, [currentPage]);

  const handlePageChange = (pageNumber) => {
    // If the requested page data is already cached, we don't need to fetch it again
    if (pageDataCache[pageNumber]) {
      setCryptoData(pageDataCache[pageNumber]);
    }
    setCurrentPage(pageNumber);
  };

  return (
    <div id="cryptotable" className="container mx-auto mt-3 xl:px-20">
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto text-center text-white">
          <thead className="border-b">
            <tr>
              <th className="px-4 py-4">#</th>
              <th className="pl-11 text-left py-2">Name</th>
              <th className="px-4 py-2">Price</th>
              <th className="px-4 py-2">1h %</th>
              <th className="px-4 py-2">24h %</th>
              <th className="px-4 py-2">7d %</th>
              <th className="px-4 py-2">Market Cap</th>
              <th className="px-4 py-2">Volume (24h)</th>
              <th className="px-4 py-2">Circulating Supply</th>
              <th className="px-4 py-2">Indicator (last 7 days)</th>
            </tr>
          </thead>
          <tbody>
            {cryptoData.map((coin, index) => (
              <tr
                key={coin.id}
                className="bg-gray-900 border-b border-slate-600 hover:bg-gray-800"
              >
                <td className="px-4 py-7">
                  {(currentPage - 1) * 10 + index + 1}
                </td>
                <td className="px-4 py-7 flex items-center ">
                  <img
                    src={coin.image}
                    alt={coin.name}
                    width="24"
                    height="24"
                    className="mr-2"
                  />
                  <p className="min-w-50 text-left">
                    <span>{coin.name}</span>{" "}
                    <span className="text-gray-400 ml-1">
                      ({coin.symbol.toUpperCase()})
                    </span>
                  </p>
                </td>
                <td className="px-4 py-2">
                  ${coin.current_price.toLocaleString()}
                </td>
                <td
                  className={`px-4 py-2 ${
                    coin.price_change_percentage_1h_in_currency < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {coin.price_change_percentage_1h_in_currency?.toFixed(2)}%
                </td>
                <td
                  className={`px-4 py-2 ${
                    coin.price_change_percentage_24h < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {coin.price_change_percentage_24h?.toFixed(2)}%
                </td>
                <td
                  className={`px-4 py-2 ${
                    coin.price_change_percentage_7d_in_currency < 0
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {coin.price_change_percentage_7d_in_currency?.toFixed(2)}%
                </td>
                <td className="px-4 py-2">
                  ${coin.market_cap.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  ${coin.total_volume.toLocaleString()}
                </td>
                <td className="px-4 py-2">
                  {coin.circulating_supply.toLocaleString()}{" "}
                  {coin.symbol.toUpperCase()}
                </td>
                <td className="px-4 py-2 w-4 h-2">
                  {coin.sparkline_in_7d?.price ? ( // Check if data exists
                    <LineChart
                      sparklineData={coin.sparkline_in_7d.price}
                      isPositive={
                        coin.price_change_percentage_7d_in_currency >= 0
                      }
                    />
                  ) : (
                    <span className="text-gray-500">N/A</span> // Show placeholder if data is missing
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-center my-5">
        <nav>
          <ul className="flex items-center space-x-2 bg-gray-900 p-2 rounded">
            <li>
              <a
                className="text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => handlePageChange(currentPage - 1)}
                href="#cryptotable"
              >
                &laquo;
              </a>
            </li>
            {[1, 2, 3].map((pageNumber) => (
              <li key={pageNumber}>
                <a
                  className={`text-white px-4 py-2 rounded hover:bg-gray-600 ${
                    pageNumber === currentPage ? "bg-yellow-500" : ""
                  }`}
                  onClick={() => handlePageChange(pageNumber)}
                  href="#cryptotable"
                >
                  {pageNumber}
                </a>
              </li>
            ))}
            <li>
              <a
                className="text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => handlePageChange(currentPage + 1)}
                href="#cryptotable"
              >
                &raquo;
              </a>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
