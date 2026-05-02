import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
	Database, RefreshCw, AlertTriangle, CheckCircle2,
	HardDrive, FileText, BarChart3, TrendingUp,
	Edit3, Save, X, AlertCircle, Layers
} from "lucide-react";

const API_DB_STATS = `${import.meta.env.VITE_API_URL}/api/admin/db-stats`;

const getToken = () => localStorage.getItem("token");

const statusColor = {
	ok:       { bar: "bg-emerald-500", text: "text-emerald-400", badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
	warning:  { bar: "bg-amber-500",   text: "text-amber-400",   badge: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
	critical: { bar: "bg-red-500",     text: "text-red-400",     badge: "bg-red-500/10 text-red-400 border-red-500/20" },
	empty:    { bar: "bg-white/10",    text: "text-text-tertiary", badge: "bg-white/5 text-text-tertiary border-white/10" },
};

const statusLabel = { ok: "Bình thường", warning: "Cảnh báo", critical: "Nguy hiểm", empty: "Trống" };

// ── Sub-components ──────────────────────────────────────────────────────────

const StatCard = ({ icon, label, value, sub, color = "primary" }) => {
	const colorMap = {
		primary: "bg-primary-500/10 text-primary-500",
		emerald: "bg-emerald-500/10 text-emerald-400",
		amber:   "bg-amber-500/10 text-amber-400",
		red:     "bg-red-500/10 text-red-400",
	};
	return (
		<div className="p-5 bg-surface-bg border border-border rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
			<div className="flex items-center gap-4">
				<div className={`p-3 rounded-xl ${colorMap[color]}`}>{icon}</div>
				<div>
					<p className="text-[11px] text-text-tertiary uppercase tracking-widest font-black mb-1">{label}</p>
					<p className="text-2xl font-black text-text-primary tracking-tight">{value}</p>
					{sub && <p className="text-xs text-text-tertiary mt-0.5">{sub}</p>}
				</div>
			</div>
		</div>
	);
};

const UsageBar = ({ percent, status }) => {
	const clampedPercent = Math.min(percent, 100);
	const color = statusColor[status]?.bar || "bg-primary-500";
	return (
		<div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
			<div
				className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
				style={{ width: `${clampedPercent}%` }}
			/>
		</div>
	);
};

// ── Main Component ─────────────────────────────────────────────────────────

const DbStatsManager = () => {
	const [overview, setOverview] = useState(null);
	const [collections, setCollections] = useState([]);
	const [summary, setSummary] = useState(null);
	const [loading, setLoading] = useState(false);
	const [editingRow, setEditingRow] = useState(null); // { name, value }
	const [toast, setToast] = useState(null); // { type, message }

	const showToast = (type, message) => {
		setToast({ type, message });
		setTimeout(() => setToast(null), 3500);
	};

	const fetchAll = useCallback(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const headers = { Authorization: `Bearer ${getToken()}` };
			const [overviewRes, collectionsRes] = await Promise.all([
				axios.get(`${API_DB_STATS}/overview`, { headers }),
				axios.get(`${API_DB_STATS}/collections`, { headers }),
			]);
			setOverview(overviewRes.data);
			setCollections(collectionsRes.data.collections || []);
			setSummary(collectionsRes.data.summary || null);
		} catch (err) {
			console.error(err);
			showToast("error", "Không thể tải dữ liệu. Kiểm tra kết nối CSDL.");
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	useEffect(() => { fetchAll(); }, [fetchAll]);

	const handleSaveLimit = async (collectionName, newLimit) => {
		try {
			await axios.put(
				`${API_DB_STATS}/collection-limit`,
				{ collectionName, newLimit: parseInt(newLimit) },
				{ headers: { Authorization: `Bearer ${getToken()}` } }
			);
			setEditingRow(null);
			await fetchAll(true);
			showToast("success", `Đã cập nhật giới hạn cho "${collectionName}".`);
		} catch (err) {
			showToast("error", err.response?.data?.error || "Lỗi khi cập nhật giới hạn.");
		}
	};

	const storagePercent = overview?.storage?.usagePercent || 0;
	const storageStatus = storagePercent >= 90 ? "critical" : storagePercent >= 70 ? "warning" : "ok";

	return (
		<div className="max-w-7xl animate-fadeIn font-secondary">
			{/* Toast */}
			{toast && (
				<div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm font-bold transition-all duration-300 ${
					toast.type === "success"
						? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
						: "bg-red-500/10 border-red-500/30 text-red-300"
				}`}>
					{toast.type === "success" ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
					{toast.message}
				</div>
			)}

			{/* Header */}
			<header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3 font-primary uppercase tracking-tight">
						<div className="p-2 bg-primary-500 rounded-xl">
							<Database className="h-7 w-7 text-white" />
						</div>
						Quản Lý Giới Hạn CSDL
					</h1>
					<p className="text-text-secondary max-w-2xl font-medium">
						Theo dõi mức sử dụng MongoDB Atlas, kiểm soát số lượng documents từng collection và cảnh báo khi tiệm cận giới hạn.
					</p>
				</div>
				<button
					onClick={() => fetchAll()}
					disabled={loading}
					className="group flex items-center gap-2 px-4 py-2.5 bg-surface-bg border border-border rounded-xl hover:bg-surface-hover hover:border-primary-500/50 transition-all text-sm font-bold shadow-sm"
				>
					<RefreshCw size={18} className={loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
					Làm mới
				</button>
			</header>

			{/* Storage Overview */}
			{overview && (
				<section className="mb-8 p-6 bg-surface-bg border border-border rounded-3xl shadow-xl">
					<h2 className="text-base font-black text-text-primary uppercase tracking-widest mb-5 flex items-center gap-2">
						<HardDrive size={18} className="text-primary-500" />
						Tổng quan lưu trữ — MongoDB Atlas Free Tier
					</h2>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
						<StatCard
							icon={<HardDrive size={22} />}
							label="Đã dùng (Storage)"
							value={`${overview.storage.totalStorageMB} MB`}
							sub={`/ ${overview.storage.limitMB} MB giới hạn`}
							color={storageStatus === "ok" ? "emerald" : storageStatus === "warning" ? "amber" : "red"}
						/>
						<StatCard
							icon={<FileText size={22} />}
							label="Dữ liệu thực"
							value={`${overview.storage.dataStorageMB} MB`}
							sub="Không tính index"
						/>
						<StatCard
							icon={<BarChart3 size={22} />}
							label="Index Size"
							value={`${overview.storage.indexStorageMB} MB`}
						/>
						<StatCard
							icon={<Layers size={22} />}
							label="Tổng documents"
							value={overview.objects.total.toLocaleString()}
							sub={`${overview.objects.collections} collections`}
							color="primary"
						/>
					</div>

					{/* Global Storage Bar */}
					<div>
						<div className="flex justify-between text-xs font-bold mb-2">
							<span className="text-text-tertiary uppercase tracking-widest">Mức sử dụng tổng thể</span>
							<span className={statusColor[storageStatus]?.text}>{storagePercent}%</span>
						</div>
						<div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
							<div
								className={`h-full rounded-full transition-all duration-1000 ${statusColor[storageStatus]?.bar}`}
								style={{ width: `${Math.min(storagePercent, 100)}%` }}
							/>
						</div>
						<div className="flex justify-between text-[10px] text-text-tertiary mt-1.5">
							<span>0 MB</span>
							<span>{overview.storage.limitMB} MB</span>
						</div>
					</div>

					{storagePercent >= 80 && (
						<div className="mt-4 flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-sm font-bold">
							<AlertTriangle size={18} />
							Cảnh báo: Dung lượng lưu trữ sắp đạt giới hạn! Hãy xem xét nâng cấp gói MongoDB Atlas.
						</div>
					)}
				</section>
			)}

			{/* Summary badges */}
			{summary && (
				<div className="flex flex-wrap gap-3 mb-6">
					<span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-black uppercase tracking-wider">
						<CheckCircle2 size={14} /> Bình thường: {collections.filter(c => c.status === "ok").length}
					</span>
					<span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs font-black uppercase tracking-wider">
						<AlertTriangle size={14} /> Cảnh báo: {summary.warningCount}
					</span>
					<span className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-black uppercase tracking-wider">
						<AlertCircle size={14} /> Nguy hiểm: {summary.criticalCount}
					</span>
					<span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500/10 border border-primary-500/20 rounded-xl text-primary-400 text-xs font-black uppercase tracking-wider">
						<TrendingUp size={14} /> Tổng: {summary.totalDocs.toLocaleString()} docs
					</span>
				</div>
			)}

			{/* Collections Table */}
			<section className="bg-surface-bg border border-border rounded-3xl overflow-hidden shadow-xl">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-surface-hover/30 text-text-tertiary text-[10px] uppercase tracking-widest font-black border-b border-border">
								<th className="px-6 py-4">Collection</th>
								<th className="px-6 py-4 text-center">Documents</th>
								<th className="px-6 py-4 text-center w-48">Giới hạn</th>
								<th className="px-6 py-4">Mức sử dụng</th>
								<th className="px-6 py-4 text-center">Storage</th>
								<th className="px-6 py-4 text-center">Trạng thái</th>
								<th className="px-6 py-4 text-right">Thao tác</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{loading ? (
								Array.from({ length: 6 }).map((_, i) => (
									<tr key={i}>
										<td colSpan="7" className="px-6 py-4">
											<div className="h-4 bg-white/5 rounded animate-pulse" />
										</td>
									</tr>
								))
							) : collections.length === 0 ? (
								<tr>
									<td colSpan="7" className="py-20 text-center text-text-tertiary">
										<Database size={48} className="opacity-10 mx-auto mb-4" />
										<p className="text-sm font-bold uppercase tracking-widest opacity-50">Không có dữ liệu</p>
									</td>
								</tr>
							) : (
								collections.map((col) => {
									const sc = statusColor[col.status];
									const isEditing = editingRow?.name === col.name;
									return (
										<tr key={col.name} className="hover:bg-surface-hover/20 transition-colors group">
											<td className="px-6 py-4">
												<div className="flex items-center gap-2">
													<div className={`h-2 w-2 rounded-full ${sc.bar} shadow-[0_0_8px_rgba(255,255,255,0.2)]`} />
													<div>
														<p className="text-sm font-black text-text-primary group-hover:text-primary-400 transition-colors">{col.label}</p>
														<p className="text-[10px] font-mono text-text-tertiary">{col.name}</p>
													</div>
												</div>
											</td>
											<td className="px-6 py-4 text-center font-mono font-bold text-text-primary">
												{col.count.toLocaleString()}
											</td>
											<td className="px-6 py-4 text-center">
												{isEditing ? (
													<div className="flex items-center gap-1.5">
														<input
															type="number"
															value={editingRow.value}
															onChange={(e) => setEditingRow({ ...editingRow, value: e.target.value })}
															className="w-24 bg-page-bg border border-primary-500 rounded-lg px-2 py-1 text-sm font-mono text-center focus:outline-none focus:ring-1 focus:ring-primary-500"
															autoFocus
														/>
														<button
															onClick={() => handleSaveLimit(col.name, editingRow.value)}
															className="p-1.5 text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all"
														>
															<Save size={14} />
														</button>
														<button
															onClick={() => setEditingRow(null)}
															className="p-1.5 text-text-tertiary hover:bg-white/5 rounded-lg transition-all"
														>
															<X size={14} />
														</button>
													</div>
												) : (
													<span className="font-mono text-sm text-text-secondary">{col.limit.toLocaleString()}</span>
												)}
											</td>
											<td className="px-6 py-4 min-w-[160px]">
												<div className="flex flex-col gap-1.5">
													<UsageBar percent={col.usagePercent} status={col.status} />
													<span className={`text-[10px] font-black ${sc.text}`}>{col.usagePercent}%</span>
												</div>
											</td>
											<td className="px-6 py-4 text-center text-xs font-mono text-text-secondary">
												<div className="flex flex-col">
													<span>{col.storageSizeKB.toFixed(1)} KB</span>
													{col.avgObjSizeBytes > 0 && (
														<span className="text-text-tertiary text-[10px]">~{col.avgObjSizeBytes}B/doc</span>
													)}
												</div>
											</td>
											<td className="px-6 py-4 text-center">
												<span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${sc.badge}`}>
													{col.status === "ok" && <CheckCircle2 size={12} />}
													{col.status === "warning" && <AlertTriangle size={12} />}
													{col.status === "critical" && <AlertCircle size={12} />}
													{statusLabel[col.status]}
												</span>
											</td>
											<td className="px-6 py-4 text-right">
												{!isEditing && (
													<button
														onClick={() => setEditingRow({ name: col.name, value: col.limit })}
														className="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-primary-400 hover:bg-primary-500/10 rounded-xl transition-all"
														title="Sửa giới hạn"
													>
														<Edit3 size={16} />
													</button>
												)}
											</td>
										</tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>

				{/* Footer */}
				<div className="px-6 py-4 border-t border-border bg-surface-hover/5 flex items-center justify-between">
					<p className="text-[10px] text-text-tertiary uppercase tracking-widest font-black">
						{collections.length} Collections • Cập nhật: {new Date().toLocaleTimeString("vi-VN")}
					</p>
					<p className="text-[10px] text-text-tertiary">
						⚡ Giới hạn tùy chỉnh chỉ tồn tại trong phiên hiện tại (reset khi khởi động lại server)
					</p>
				</div>
			</section>

			{/* Info Box */}
			<div className="mt-6 p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl flex items-start gap-3">
				<Database size={18} className="text-primary-400 mt-0.5 shrink-0" />
				<div className="text-xs text-text-secondary leading-relaxed space-y-1">
					<p><strong className="text-text-primary">MongoDB Atlas Free Tier:</strong> 512 MB storage, shared RAM/CPU.</p>
					<p><strong className="text-text-primary">Giới hạn tùy chỉnh:</strong> Chỉ để cảnh báo nội bộ, không giới hạn thật từ phía CSDL. Cần sửa trực tiếp trong file <code className="bg-white/5 px-1 rounded">dbStats.js</code> để lưu vĩnh viễn.</p>
					<p><strong className="text-text-primary">Nâng cấp:</strong> Khi dung lượng vượt 70%, hãy xem xét nâng cấp lên MongoDB Atlas M2 (9$/tháng) hoặc M5 (25$/tháng).</p>
				</div>
			</div>
		</div>
	);
};

export default DbStatsManager;
