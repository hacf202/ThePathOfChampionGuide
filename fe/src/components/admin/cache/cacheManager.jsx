import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { Trash2, RefreshCw, Database, HardDrive, ShieldAlert, CheckCircle2, AlertCircle, Info, Activity } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import Swal from "sweetalert2";

const API_ADMIN_CACHE = `${import.meta.env.VITE_API_URL}/api/admin/cache`;

const CacheManager = () => {
	const { tUI } = useTranslation();
	const [stats, setStats] = useState([]);
	const [loading, setLoading] = useState(false);
	const [rowLoading, setRowLoading] = useState({});

	const fetchStats = useCallback(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const timestamp = Date.now();
			// Thêm t={timestamp} để tránh cache trình duyệt khi lấy stats
			const response = await axios.get(`${API_ADMIN_CACHE}/stats?t=${timestamp}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setStats(response.data || []);
		} catch (error) {
			console.error("Error fetching cache stats:", error);
			if (!silent) {
				Swal.fire({
					icon: "error",
					title: "Lỗi kết nối",
					text: "Không thể lấy thông tin Cache từ máy chủ.",
					confirmButtonColor: "#3b82f6",
				});
			}
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStats();
	}, [fetchStats]);

	const handleClearAll = async () => {
		const result = await Swal.fire({
			title: tUI("admin.cache.confirmTitle") || "Xác nhận xóa toàn bộ?",
			text: tUI("admin.cache.confirmText") || "Hành động này sẽ xóa sạch dữ liệu đệm của tất cả các module. Hệ thống có thể sẽ chậm hơn một chút trong vài giây đầu khi tải lại dữ liệu.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: tUI("admin.cache.confirmBtn") || "Vâng, xóa tất cả!",
			cancelButtonText: tUI("admin.cache.cancelBtn") || "Hủy bỏ",
			background: "#1f2937",
			color: "#f3f4f6",
		});

		if (!result.isConfirmed) return;

		setLoading(true);
		try {
			const token = localStorage.getItem("token");
			await axios.delete(`${API_ADMIN_CACHE}/clear-all`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			await fetchStats(true);
			
			Swal.fire({
				icon: "success",
				title: "Đã làm sạch!",
				text: "Toàn bộ Cache hệ thống đã được xóa.",
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (error) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: error.response?.data?.error || "Không thể xóa cache.",
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleClearCache = async (name) => {
		setRowLoading(prev => ({ ...prev, [name]: true }));
		try {
			const token = localStorage.getItem("token");
			await axios.delete(`${API_ADMIN_CACHE}/clear/${name}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			await fetchStats(true);

			Swal.fire({
				icon: "success",
				title: "Đã xóa!",
				text: `Cache module "${name}" đã được làm sạch.`,
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (error) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: error.response?.data?.error || `Lỗi khi xóa cache ${name}.`,
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setRowLoading(prev => ({ ...prev, [name]: false }));
		}
	};

	const totalKeys = stats.reduce((acc, curr) => acc + (curr.keys || 0), 0);
	const totalHits = stats.reduce((acc, curr) => acc + (curr.stats?.hits || 0), 0);
	const totalMisses = stats.reduce((acc, curr) => acc + (curr.stats?.misses || 0), 0);
	const hitRate = totalHits + totalMisses > 0 
		? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) 
		: 0;

	return (
		<div className="max-w-6xl animate-fadeIn font-secondary">
			<header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3 font-primary">
						<Database className={`h-8 w-8 text-primary-500`} />
						{tUI("admin.cache.title")}
					</h1>
					<p className="text-text-secondary max-w-2xl">
						{tUI("admin.cache.subtitle") || "Quản lý dữ liệu tạm thời trong bộ nhớ RAM của Server để tối ưu hiệu suất."}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => fetchStats()}
						disabled={loading}
						className="flex items-center gap-2 px-4 py-2 bg-surface-bg border border-border rounded-xl hover:bg-surface-hover transition-all text-sm font-bold"
					>
						<RefreshCw size={18} className={loading ? "animate-spin" : ""} />
						{tUI("admin.common.refresh") || "Làm mới"}
					</button>
					<button
						onClick={handleClearAll}
						disabled={loading || stats.length === 0}
						className="flex items-center gap-2 px-6 py-2 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
					>
						<Trash2 size={18} />
						{tUI("admin.cache.clearAll")}
					</button>
				</div>
			</header>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				<StatCard 
					icon={<Database size={24} />} 
					label={tUI("admin.cache.totalModules")} 
					value={stats.length} 
					color="primary"
				/>
				<StatCard 
					icon={<HardDrive size={24} />} 
					label={tUI("admin.cache.totalRecords")} 
					value={totalKeys} 
					color="amber"
				/>
				<StatCard 
					icon={<Activity size={24} />} 
					label={tUI("admin.cache.hitRate") || "Tỷ lệ Hit"} 
					value={`${hitRate}%`} 
					color="emerald"
				/>
				<StatCard 
					icon={<Info size={24} />} 
					label={tUI("admin.cache.totalRequests") || "Tổng yêu cầu"} 
					value={totalHits + totalMisses} 
					color="blue"
				/>
			</div>

			<div className="bg-surface-bg border border-border rounded-3xl overflow-hidden shadow-sm backdrop-blur-sm">
				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-surface-hover/50 text-text-tertiary text-xs uppercase tracking-widest font-bold">
								<th className="px-6 py-5">{tUI("admin.cache.moduleName")}</th>
								<th className="px-6 py-5 text-center">{tUI("admin.cache.cachedKeys")}</th>
								<th className="px-6 py-5 text-center">{tUI("admin.cache.hits")}</th>
								<th className="px-6 py-5 text-center">{tUI("admin.cache.misses")}</th>
								<th className="px-6 py-5 text-center">Hiệu quả</th>
								<th className="px-6 py-5 text-right">{tUI("admin.cache.actions")}</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{stats.length > 0 ? stats.map((item) => {
								const itemTotal = (item.stats?.hits || 0) + (item.stats?.misses || 0);
								const itemRate = itemTotal > 0 ? (((item.stats?.hits || 0) / itemTotal) * 100).toFixed(0) : 0;
								
								return (
									<tr key={item.name} className="hover:bg-surface-hover/30 transition-colors group">
										<td className="px-6 py-5">
											<span className="px-3 py-1.5 bg-primary-500/10 rounded-lg text-sm font-bold text-primary-400 uppercase tracking-tighter">
												{item.name}
											</span>
										</td>
										<td className="px-6 py-5 text-center font-mono text-text-primary text-lg">
											{item.keys}
										</td>
										<td className="px-6 py-5 text-center text-emerald-400 font-mono">
											{item.stats?.hits || 0}
										</td>
										<td className="px-6 py-5 text-center text-amber-400 font-mono">
											{item.stats?.misses || 0}
										</td>
										<td className="px-6 py-5 text-center">
											<div className="flex flex-col items-center gap-1">
												<div className="w-16 h-1.5 bg-white/5 rounded-full overflow-hidden">
													<div 
														className="h-full bg-emerald-500 transition-all duration-500" 
														style={{ width: `${itemRate}%` }}
													/>
												</div>
												<span className="text-[10px] font-bold text-text-tertiary">{itemRate}%</span>
											</div>
										</td>
										<td className="px-6 py-5 text-right">
											<button
												onClick={() => handleClearCache(item.name)}
												disabled={rowLoading[item.name] || loading}
												className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all disabled:opacity-30"
											>
												{rowLoading[item.name] ? (
													<RefreshCw size={20} className="animate-spin" />
												) : (
													<Trash2 size={20} />
												)}
											</button>
										</td>
									</tr>
								);
							}) : (
								<tr>
									<td colSpan="6" className="px-6 py-20 text-center text-text-tertiary">
										{loading ? (
											<div className="flex flex-col items-center gap-4">
												<RefreshCw className="animate-spin text-primary-500" size={32} />
												<p className="animate-pulse font-medium">{tUI("admin.cache.statsLoading") || "Đang tải dữ liệu..."}</p>
											</div>
										) : (
											<div className="flex flex-col items-center gap-2">
												<AlertCircle size={32} />
												<p>{tUI("admin.cache.statsEmpty") || "Không có dữ liệu cache nào được ghi nhận."}</p>
											</div>
										)}
									</td>
								</tr>
							)}
						</tbody>
					</table>
				</div>
			</div>
			
			<div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl flex items-start gap-4">
				<div className="p-2 bg-amber-500/20 rounded-lg text-amber-500 shrink-0">
					<ShieldAlert size={20} />
				</div>
				<p className="text-sm text-amber-200/70 italic leading-relaxed">
					<span className="font-bold text-amber-400 not-italic uppercase mr-2">Lưu ý:</span>
					{tUI("admin.cache.warning") || "Việc xóa cache sẽ buộc máy chủ phải quét lại toàn bộ cơ sở dữ liệu khi có yêu cầu tiếp theo. Chỉ nên thực hiện khi dữ liệu hiển thị bị cũ hoặc gặp lỗi đồng bộ."}
				</p>
			</div>
		</div>
	);
};

const StatCard = ({ icon, label, value, color }) => {
	const colorMap = {
		primary: "bg-primary-500/10 text-primary-500 border-primary-500/20",
		amber: "bg-amber-500/10 text-amber-500 border-amber-500/20",
		emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
		blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
	};

	return (
		<div className="p-6 bg-surface-bg border border-border rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
			<div className="flex items-center gap-4">
				<div className={`p-4 rounded-2xl transition-transform group-hover:scale-110 ${colorMap[color] || colorMap.primary}`}>
					{icon}
				</div>
				<div>
					<p className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-black mb-1">
						{label}
					</p>
					<p className="text-2xl font-black text-text-primary tracking-tight">
						{value}
					</p>
				</div>
			</div>
		</div>
	);
};

export default CacheManager;
