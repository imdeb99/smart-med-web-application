export default function TableShell({ headers, emptyState, children }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 uppercase border-b border-gray-100">
            {headers.map((header) => (
              <th key={header} scope="col" className="px-5 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {emptyState && (
            <tr>
              <td colSpan={headers.length} className="px-5 py-8 text-center text-gray-400">
                {emptyState}
              </td>
            </tr>
          )}
          {children}
        </tbody>
      </table>
    </div>
  );
}
