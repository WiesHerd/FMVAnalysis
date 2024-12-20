const MarketDataFormat = () => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Required Fields</h3>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Field Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">specialty</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Specialty name</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Text</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">p25_total, p50_total, p75_total, p90_total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Total Cash Compensation at each percentile ($)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Number (Dollar Value)</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">p25_wrvu, p50_wrvu, p75_wrvu, p90_wrvu</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Work RVUs at each percentile</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Number</td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">p25_cf, p50_cf, p75_cf, p90_cf</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">Conversion Factors at each percentile ($ per RVU)</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Number (Dollar Value)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Example Format</h3>
        <div className="space-y-4">
          {/* Column Headers Explanation */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Column Headers</h4>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <div className="text-sm font-medium text-blue-600 mb-1">Specialty</div>
                <div className="text-sm text-gray-600">Text name of specialty</div>
                <div className="text-xs text-gray-500 mt-1">Example: Cardiology</div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-600 mb-1">Total Cash ($)</div>
                <div className="text-sm text-gray-600">p25_total, p50_total, etc.</div>
                <div className="text-xs text-gray-500 mt-1">Example: 286364</div>
              </div>
              <div>
                <div className="text-sm font-medium text-blue-600 mb-1">Work RVUs</div>
                <div className="text-sm text-gray-600">p25_wrvu, p50_wrvu, etc.</div>
                <div className="text-xs text-gray-500 mt-1">Example: 3259</div>
              </div>
            </div>
          </div>

          {/* Example CSV Structure */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">CSV File Format</h4>
            <div className="space-y-4">
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Header Row:</div>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  <div className="flex items-center">
                    <span className="text-blue-600">specialty</span>
                    <span className="text-gray-400">,</span>
                    <span className="text-blue-600 ml-1">p25_total,p50_total,p75_total,p90_total</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-blue-600">p25_wrvu,p50_wrvu,p75_wrvu,p90_wrvu</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-blue-600">p25_cf,p50_cf,p75_cf,p90_cf</span>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-sm font-medium text-gray-600 mb-2">Example Data:</div>
                <div className="bg-gray-50 p-3 rounded font-mono text-sm">
                  <div className="flex items-center">
                    <span className="text-green-600">Cardiology</span>
                    <span className="text-gray-400">,</span>
                    <span className="text-green-600 ml-1">286364,333779,391588,462010</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-green-600">3259,4321,5577,7591</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-green-600">64.20,79.20,105.60,145.20</span>
                  </div>
                  <div className="flex items-center mt-2">
                    <span className="text-green-600">Pediatrics</span>
                    <span className="text-gray-400">,</span>
                    <span className="text-green-600 ml-1">220150,275000,315000,390000</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-green-600">4120,5230,6340,7450</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="text-green-600">53.43,52.58,49.68,52.35</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section Labels */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <div className="grid grid-cols-7 gap-2">
              <div className="col-span-1">
                <div className="text-sm font-medium text-gray-600">Specialty</div>
              </div>
              <div className="col-span-2 border-l pl-4">
                <div className="text-sm font-medium text-gray-600">Total Cash Compensation</div>
                <div className="text-xs text-gray-500">25th, 50th, 75th, 90th percentiles</div>
              </div>
              <div className="col-span-2 border-l pl-4">
                <div className="text-sm font-medium text-gray-600">Work RVUs</div>
                <div className="text-xs text-gray-500">25th, 50th, 75th, 90th percentiles</div>
              </div>
              <div className="col-span-2 border-l pl-4">
                <div className="text-sm font-medium text-gray-600">Conversion Factors</div>
                <div className="text-xs text-gray-500">25th, 50th, 75th, 90th percentiles</div>
              </div>
            </div>
          </div>

          {/* Value Formats */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <h4 className="text-sm font-medium text-gray-900 mb-3">Value Formats</h4>
            <div className="grid grid-cols-3 gap-4 divide-x divide-gray-200">
              <div className="pr-4">
                <div className="text-sm font-medium text-gray-900">Total Cash Compensation</div>
                <div className="text-sm text-gray-600 mt-1">Whole numbers only</div>
                <div className="text-sm text-gray-500 mt-1">✓ 286364</div>
                <div className="text-sm text-red-500 mt-1">✗ $286,364</div>
              </div>
              <div className="px-4">
                <div className="text-sm font-medium text-gray-900">Work RVUs</div>
                <div className="text-sm text-gray-600 mt-1">Whole numbers only</div>
                <div className="text-sm text-gray-500 mt-1">✓ 3259</div>
                <div className="text-sm text-red-500 mt-1">✗ 3,259</div>
              </div>
              <div className="pl-4">
                <div className="text-sm font-medium text-gray-900">Conversion Factors</div>
                <div className="text-sm text-gray-600 mt-1">Up to 2 decimal places</div>
                <div className="text-sm text-gray-500 mt-1">✓ 64.20</div>
                <div className="text-sm text-red-500 mt-1">✗ $64.20</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="text-sm font-medium text-blue-800 mb-2">Important Notes</h4>
        <ul className="list-disc list-inside text-sm text-blue-700 space-y-1">
          <li>Use comma (,) as the delimiter</li>
          <li>Do not include currency symbols ($) or commas in numbers</li>
          <li>Ensure specialty names match exactly</li>
          <li>All fields are required</li>
          <li>Total Cash values should be whole numbers</li>
          <li>Conversion Factors can have up to 2 decimal places</li>
          <li>Maximum file size: 10MB</li>
        </ul>
      </div>
    </div>
  );
};

export default MarketDataFormat; 