// fe/src/components/admin/auditLogs/AuditLogList.jsx
import React, { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { useTranslation } from "../../../hooks/useTranslation";
import { 
	History, 
	Filter, 
	ChevronLeft, 
	ChevronRight, 
	Eye, 
	Clock, 
	User, 
	Tag, 
	Activity,
	X,
	Plus,
	Minus,
	RefreshCw
} from "lucide-react";
import axios from "axios";

const JsonDiffViewer = ({ data, otherData, side = "new" }) => {
	const { tUI } = useTranslation();
	
	if (!data) {
		return (
			<div className="h-full flex flex-col items-center justify-center text-slate-300 italic opacity-50">
				<Activity className="w-12 h-12 mb-2" />
				{tUI("admin.auditLog.modal.noData")}
			</div>
		);
	}

	const keys = Object.keys(data);
	// Sắp xếp key để hiển thị nhất quán
	keys.sort();

	return (
		<div className="space-y-1">
			{keys.map(key => {
				const val = data[key];
				const otherVal = otherData ? otherData[key] : undefined;
				
				let isChanged = false;
				let isAdded = false;
				let isRemoved = false;

				if (otherData) {
					if (!(key in otherData)) {
						if (side === "new") isAdded = true;
						else isRemoved = true;
					} else if (JSON.stringify(val) !== JSON.stringify(otherVal)) {
						isChanged = true;
					}
				} else {
					// Nếu không có otherData (CREATE/DELETE), highlight toàn bộ theo hướng
					if (side === "new") isAdded = true;
					else isRemoved = true;
				}

				const highlightClass = isAdded ? "bg-emerald-100/30 dark:bg-emerald-900/30 text-emerald-900 dark:text-emerald-100 border-emerald-200 dark:border-emerald-800" :
									isRemoved ? "bg-rose-100/30 dark:bg-rose-900/30 text-rose-900 dark:text-rose-100 border-rose-200 dark:border-rose-800" :
									isChanged ? (side === "new" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100 border-emerald-100 dark:border-emerald-800" : "bg-rose-50 dark:bg-rose-900/20 text-rose-900 dark:text-rose-100 border-rose-100 dark:border-rose-800") :
									"text-text-secondary border-transparent";

				return (
					<div key={key} className={`group flex flex-col p-2 rounded-xl border transition-all ${highlightClass}`}>
						<div className="flex items-center justify-between gap-2">
							<span className="font-black text-[11px] uppercase tracking-tight opacity-70 shrink-0">{key}</span>
							<div className="flex items-center gap-1.5 overflow-hidden">
								{isAdded && <Plus className="w-3 h-3 text-emerald-500 shrink-0" />}
								{isRemoved && <Minus className="w-3 h-3 text-rose-500 shrink-0" />}
								{isChanged && <RefreshCw className="w-3 h-3 text-amber-500 shrink-0" />}
							</div>
						</div>
						<div className="text-[13px] font-mono break-all mt-1 pr-2">
							{typeof val === 'object' ? JSON.stringify(val, null, 2) : String(val)}
						</div>
					</div>
				);
			})}
		</div>
	);
};

const AuditLogList = () => {
	const { tUI, language } = useTranslation();
	const { token } = useAuth();
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState({
		entityType: "",
		action: "",
		page: 1,
		limit: 20
	});
	const [selectedLog, setSelectedLog] = useState(null);

	const fetchLogs = async () => {
		setLoading(true);
		try {
			const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/audit-logs`, {
				params: filters,
				headers: { Authorization: `Bearer ${token}` }
			});
			setLogs(response.data.items || []);
			setError(null);
		} catch (err) {
			console.error("Error fetching audit logs:", err);
			setError(tUI("admin.common.errorLoad"));
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchLogs();
	}, [filters.entityType, filters.action, filters.page]);

	const handleFilterChange = (e) => {
		const { name, value } = e.target;
		setFilters(prev => ({ ...prev, [name]: value, page: 1 }));
	};

	const getActionColor = (action) => {
		switch (action) {
			case "CREATE": return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800";
			case "UPDATE": return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800";
			case "DELETE": return "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-800";
			case "ROLLBACK": return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800";
			default: return "text-text-secondary bg-surface-bg border border-border";
		}
	};

	const [isRollingBack, setIsRollingBack] = useState(false);

	const handleRollback = async (logId) => {
		if (!window.confirm(tUI("admin.auditLog.modal.rollbackConfirm"))) return;

		setIsRollingBack(true);
		try {
			const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/admin/audit-logs/rollback/${logId}`, {}, {
				headers: { Authorization: `Bearer ${token}` }
			});
			alert(res.data.message || "Hoàn tác thành công!");
			setSelectedLog(null);
			fetchLogs(); // Refresh list to show the ROLLBACK log
		} catch (err) {
			console.error("Rollback error:", err);
			alert(err.response?.data?.error || "Lỗi khi hoàn tác dữ liệu.");
		} finally {
			setIsRollingBack(false);
		}
	};

	const entityTypes = [
		"champion", "power", "relic", "item", "rune", 
		"boss", "adventure", "bonusStar", "guide", "card"
	];

	return (
		<div className="p-6 space-y-6 animate-in fade-in duration-500 bg-page-bg min-h-full">
			{/* Header */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div>
					<h1 className="text-3xl font-black text-text-primary flex items-center gap-2 uppercase tracking-tighter italic">
						<History className="w-8 h-8 text-primary-600" />
						{tUI("admin.auditLog.title")}
					</h1>
					<p className="text-text-secondary text-sm font-medium">{tUI("admin.auditLog.subtitle")}</p>
				</div>

				<div className="flex flex-wrap items-center gap-3">
					{/* Type Filter */}
					<div className="relative">
						<Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
						<select
							name="entityType"
							value={filters.entityType}
							onChange={handleFilterChange}
							className="pl-9 pr-8 py-2.5 bg-surface-bg border border-border rounded-xl text-sm text-text-primary shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 appearance-none min-w-[180px] font-semibold transition-all"
						>
							<option value="">{tUI("admin.auditLog.filterByType")}</option>
							{entityTypes.map(type => (
								<option key={type} value={type}>
									{tUI(`shared.entities.${type}`)}
								</option>
							))}
						</select>
					</div>

					{/* Action Filter */}
					<select
						name="action"
						value={filters.action}
						onChange={handleFilterChange}
						className="px-4 py-2.5 bg-surface-bg border border-border rounded-xl text-sm text-text-primary shadow-sm focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 min-w-[160px] font-semibold transition-all"
					>
						<option value="">{tUI("admin.auditLog.filterByAction")}</option>
						<option value="CREATE">{tUI("admin.auditLog.actions.CREATE")}</option>
						<option value="UPDATE">{tUI("admin.auditLog.actions.UPDATE")}</option>
						<option value="DELETE">{tUI("admin.auditLog.actions.DELETE")}</option>
						<option value="ROLLBACK">{tUI("admin.auditLog.actions.ROLLBACK") || "ROLLBACK"}</option>
					</select>

					<button 
						onClick={fetchLogs}
						className="p-2.5 bg-surface-bg hover:bg-surface-hover border border-border rounded-xl text-text-secondary transition-all shadow-sm active:scale-95"
					>
						<Clock className="w-5 h-5" />
					</button>
				</div>
			</div>

			{/* Main Content */}
			<div className="bg-surface-bg border border-border rounded-[32px] overflow-hidden shadow-2xl shadow-black/5">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-surface-bg/80 text-text-secondary text-[11px] font-black uppercase tracking-[0.2em] border-b border-border">
								<th className="px-8 py-5 ">{tUI("admin.auditLog.table.timestamp")}</th>
								<th className="px-8 py-5 ">{tUI("admin.auditLog.table.user")}</th>
								<th className="px-8 py-5 ">{tUI("admin.auditLog.table.action")}</th>
								<th className="px-8 py-5 ">{tUI("admin.auditLog.table.entity")}</th>
								<th className="px-8 py-5 text-right">{tUI("admin.auditLog.table.details")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{loading ? (
								Array.from({ length: 5 }).map((_, i) => (
									<tr key={i} className="animate-pulse">
										<td colSpan={5} className="px-8 py-6">
											<div className="h-10 bg-slate-100 rounded-2xl w-full"></div>
										</td>
									</tr>
								))
							) : logs.length === 0 ? (
								<tr>
									<td colSpan={5} className="px-8 py-32 text-center text-slate-400">
										<Activity className="w-16 h-16 mx-auto mb-4 opacity-10" />
										<p className="text-xl font-bold italic uppercase tracking-tighter">{tUI("admin.common.noData")}</p>
									</td>
								</tr>
							) : (
								logs.map((log) => (
									<tr key={log.logId} className="hover:bg-primary-50/10 transition-colors group">
										<td className="px-8 py-5">
											<div className="text-sm font-bold text-text-primary whitespace-nowrap">
												{new Date(log.timestamp).toLocaleTimeString(language === "vi" ? "vi-VN" : "en-US", { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
											</div>
											<div className="text-[11px] text-text-secondary font-medium whitespace-nowrap">
												{new Date(log.timestamp).toLocaleDateString(language === "vi" ? "vi-VN" : "en-US")}
											</div>
										</td>
										<td className="px-8 py-5">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-2xl bg-surface-bg border border-border flex items-center justify-center text-text-secondary shadow-inner group-hover:bg-surface-bg transition-all">
													<User className="w-5 h-5" />
												</div>
												<div>
													<div className="text-sm font-black text-text-primary">{log.userName}</div>
													<div className="text-[10px] text-text-secondary font-mono uppercase truncate w-24">
														{log.userId}
													</div>
												</div>
											</div>
										</td>
										<td className="px-8 py-5">
											<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm ${getActionColor(log.action)}`}>
												{tUI(`admin.auditLog.actions.${log.action}`)}
											</span>
										</td>
										<td className="px-8 py-5">
											<div className="flex items-center gap-3">
												<div className="w-8 h-8 rounded-xl bg-primary-100/50 flex items-center justify-center">
													<Tag className="w-4 h-4 text-primary-600 dark:text-primary-400" />
												</div>
												<div>
													<div className="text-sm text-text-primary font-black tracking-tight">
														{log.entityName || "---"}
													</div>
													<div className="text-[11px] text-text-secondary flex items-center gap-1 font-medium">
														{tUI(`shared.entities.${log.entityType}`)}
														<span className="text-border mx-1">/</span>
														<code className="bg-surface-bg border border-border px-1.5 py-0.5 rounded text-[10px] font-mono text-text-secondary">
															{log.entityId}
														</code>
													</div>
												</div>
											</div>
										</td>
										<td className="px-8 py-5 text-right">
											<button 
												onClick={() => setSelectedLog(log)}
												className="p-3 text-text-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/40 rounded-2xl transition-all shadow-sm hover:shadow-md active:scale-95"
											>
												<Eye className="w-6 h-6" />
											</button>
										</td>
									</tr>
								))
							)}
						</tbody>
					</table>
				</div>

				{/* Pagination */}
				<div className="px-8 py-5 bg-surface-bg/50 border-t border-border flex items-center justify-between">
					<div className="text-[11px] font-black uppercase tracking-widest text-text-secondary">
						{tUI("admin.common.selectedItems", { count: logs.length })}
					</div>
					<div className="flex items-center gap-4">
						<button 
							disabled={filters.page === 1}
							onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))}
							className="p-2.5 text-text-secondary hover:text-primary-600 disabled:opacity-30 transition-all active:scale-90"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
						<span className="text-base font-black text-text-primary w-8 text-center bg-surface-bg border border-border rounded-xl py-1 shadow-inner">
							{filters.page}
						</span>
						<button 
							disabled={logs.length < filters.limit}
							onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))}
							className="p-2.5 text-text-secondary hover:text-primary-600 disabled:opacity-30 transition-all active:scale-90"
						>
							<ChevronRight className="w-6 h-6" />
						</button>
					</div>
				</div>
			</div>

			{/* Detail Modal */}
			{selectedLog && (
				<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
					<div className="absolute inset-0 bg-modal-overlay-bg backdrop-blur-md" onClick={() => setSelectedLog(null)} />
					<div className="relative bg-modal-bg border border-border rounded-[40px] w-full max-w-5xl max-h-[90vh] flex flex-col shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-300 overflow-hidden">
						{/* Modal Header */}
						<div className="p-8 border-b border-border flex items-center justify-between bg-surface-bg/30">
							<div className="flex items-center gap-5">
								<div className={`p-4 rounded-[20px] shadow-xl ${getActionColor(selectedLog.action)}`}>
									<History className="w-8 h-8" />
								</div>
								<div>
									<h2 className="text-3xl font-black text-text-primary uppercase tracking-tighter italic">
										{tUI("admin.auditLog.modal.title")}
									</h2>
									<p className="text-text-secondary text-base font-medium">
										{selectedLog.entityName} <span className="text-border mx-2">|</span> <span className="font-mono text-xs">{selectedLog.entityId}</span>
									</p>
								</div>
							</div>
							<button 
								onClick={() => setSelectedLog(null)}
								className="p-3 bg-surface-bg border border-border hover:bg-surface-hover rounded-2xl text-text-secondary hover:text-text-primary transition-all shadow-sm active:scale-95"
							>
								<X className="w-6 h-6" />
							</button>
						</div>

						{/* Modal Body */}
						<div className="p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8 bg-modal-bg">
							{/* Old Data */}
							<div className="flex flex-col space-y-4">
								<div className="flex items-center gap-3 px-2">
									<div className="w-2 h-8 bg-rose-500 rounded-full" />
									<h3 className="text-lg font-black text-text-primary uppercase tracking-tighter">
										{tUI("admin.auditLog.modal.oldData")}
									</h3>
								</div>
								<div className="bg-surface-bg rounded-[32px] p-6 border-2 border-border font-mono text-[13px] overflow-auto min-h-[400px] shadow-inner">
									<JsonDiffViewer data={selectedLog.oldData} otherData={selectedLog.newData} side="old" />
								</div>
							</div>

							{/* New Data */}
							<div className="flex flex-col space-y-4">
								<div className="flex items-center gap-3 px-2">
									<div className="w-2 h-8 bg-emerald-500 rounded-full" />
									<h3 className="text-lg font-black text-text-primary uppercase tracking-tighter">
										{tUI("admin.auditLog.modal.newData")}
									</h3>
								</div>
								<div className="bg-surface-bg rounded-[32px] p-6 border-2 border-border font-mono text-[13px] overflow-auto min-h-[400px] shadow-inner">
									<JsonDiffViewer data={selectedLog.newData} otherData={selectedLog.oldData} side="new" />
								</div>
							</div>
						</div>

						{/* Modal Footer */}
						<div className="p-6 border-t border-border flex items-center justify-center gap-4 bg-surface-bg/30">
							<button 
								onClick={() => setSelectedLog(null)}
								className="px-10 py-4 bg-surface-bg border border-border hover:bg-surface-hover text-text-secondary rounded-2xl transition-all font-black uppercase tracking-widest text-sm shadow-sm active:scale-95"
							>
								{tUI("common.close")}
							</button>

							{selectedLog.action !== "ROLLBACK" && (
								<button 
									onClick={() => handleRollback(selectedLog.logId)}
									disabled={isRollingBack}
									className="px-10 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl transition-all font-black uppercase tracking-widest text-sm shadow-xl active:scale-95 flex items-center gap-2 disabled:opacity-50"
								>
									{isRollingBack ? (
										<RefreshCw className="w-5 h-5 animate-spin" />
									) : (
										<RefreshCw className="w-5 h-5" />
									)}
									{tUI("admin.auditLog.modal.rollback") || "Rollback"}
								</button>
							)}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default AuditLogList;
