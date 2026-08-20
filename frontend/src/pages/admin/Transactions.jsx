import { useMemo, useState } from "react";
import { Search, Wallet, Receipt, RotateCcw, XCircle } from "lucide-react";
import AdminLayout from "../../components/admin/AdminLayout";
import TableShell from "../../components/shared/TableShell";
import mockTransactions from "../../data/mockTransactions";
import { formatDate } from "../../utils/helpers";

const statusStyles = {
  paid: "bg-emerald-50 text-emerald-700",
  refunded: "bg-blue-50 text-blue-700",
  failed: "bg-red-50 text-red-700",
};

export default function Transactions() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(
    () =>
      mockTransactions
        .filter((t) => statusFilter === "all" || t.status === statusFilter)
        .filter(
          (t) =>
            t.patientName.toLowerCase().includes(search.toLowerCase()) ||
            t.service.toLowerCase().includes(search.toLowerCase())
        )
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [search, statusFilter]
  );

  const totalRevenue = mockTransactions
    .filter((t) => t.status === "paid")
    .reduce((sum, t) => sum + t.amount, 0);
  const refundedAmount = mockTransactions
    .filter((t) => t.status === "refunded")
    .reduce((sum, t) => sum + t.amount, 0);
  const failedCount = mockTransactions.filter((t) => t.status === "failed").length;

  const stats = [
    { label: "Total Revenue", value: `৳${totalRevenue.toLocaleString()}`, icon: Wallet, color: "bg-emerald-50 text-emerald-600" },
    { label: "Total Transactions", value: mockTransactions.length, icon: Receipt, color: "bg-teal-50 text-teal-600" },
    { label: "Refunded", value: `৳${refundedAmount.toLocaleString()}`, icon: RotateCcw, color: "bg-blue-50 text-blue-600" },
    { label: "Failed Payments", value: failedCount, icon: XCircle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <AdminLayout>
      <h1 className="text-3xl font-bold text-gray-800 mb-2">Transactions</h1>
      <p className="text-gray-500 mb-6">Ledger of all patient payments across the platform.</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
            <div className={`rounded-xl p-3 ${color}`}>
              <Icon size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-800">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true" />
          <label htmlFor="transactions-search" className="sr-only">
            Search transactions by patient or service
          </label>
          <input
            id="transactions-search"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or service"
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
          />
        </div>
        <label htmlFor="status-filter" className="sr-only">
          Filter by status
        </label>
        <select
          id="status-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="paid">Paid</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      <TableShell
        headers={["Transaction ID", "Patient", "Service", "Method", "Amount", "Status", "Date"]}
        emptyState="No transactions found."
      >
        {filtered.map((txn) => (
          <tr key={txn.id} className="border-b border-gray-50 last:border-0">
            <td className="px-5 py-3 text-gray-500">{txn.id}</td>
            <td className="px-5 py-3 font-medium text-gray-800">{txn.patientName}</td>
            <td className="px-5 py-3 text-gray-600">{txn.service}</td>
            <td className="px-5 py-3 text-gray-600">{txn.method}</td>
            <td className="px-5 py-3 text-gray-600">৳{txn.amount}</td>
            <td className="px-5 py-3">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusStyles[txn.status]}`}>
                {txn.status}
              </span>
            </td>
            <td className="px-5 py-3 text-gray-500">{formatDate(txn.date)}</td>
          </tr>
        ))}
      </TableShell>
    </AdminLayout>
  );
}
