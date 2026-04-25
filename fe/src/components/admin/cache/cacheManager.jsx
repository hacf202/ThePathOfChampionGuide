import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
	Trash2, RefreshCw, Database, HardDrive, ShieldAlert, 
	CheckCircle2, AlertCircle, Info, Activity, Search, 
	Cpu, Clock, Terminal, Globe, ChevronRight, Library
} from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";
import Swal from "sweetalert2";

const API_ADMIN_CACHE = `${import.meta.env.VITE_API_URL}/api/admin/cache`;

const CacheManager = () => {
	const { tUI } = useTranslation();
	const [activeTab, setActiveTab] = useState("overview"); // "overview" | "redis"
	const [stats, setStats] = useState([]);
	const [redisInfo, setRedisInfo] = useState(null);
	const [redisKeys, setRedisKeys] = useState([]);
	const [keyPattern, setKeyPattern] = useState("*");
	const [loading, setLoading] = useState(false);
	const [rowLoading, setRowLoading] = useState({});

	// --- Actions ---

	const fetchStats = useCallback(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const timestamp = Date.now();
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

	const fetchRedisInfo = useCallback(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_ADMIN_CACHE}/redis-info`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setRedisInfo(response.data);
		} catch (error) {
			console.error("Error fetching Redis info:", error);
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	const fetchRedisKeys = useCallback(async (pattern = "*", silent = false) => {
		if (!silent) setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_ADMIN_CACHE}/redis-keys?pattern=${encodeURIComponent(pattern)}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setRedisKeys(response.data.keys || []);
		} catch (error) {
			console.error("Error scanning Redis keys:", error);
		} finally {
			if (!silent) setLoading(false);
		}
	}, []);

	useEffect(() => {
		if (activeTab === "overview") {
			fetchStats();
		} else {
			fetchRedisInfo();
			fetchRedisKeys(keyPattern);
		}
	}, [activeTab, fetchStats, fetchRedisInfo, fetchRedisKeys, keyPattern]);

	const handleClearAll = async () => {
		const result = await Swal.fire({
			title: tUI("admin.cache.confirmTitle") || "Xác nhận xóa toàn bộ?",
			text: tUI("admin.cache.confirmText") || "Hành động này sẽ xóa sạch dữ liệu đệm của tất cả các module.",
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
				title: tUI("admin.cache.clearSuccess") || "Đã làm sạch!",
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
				title: tUI("admin.cache.purgeSuccess", { name }) || "Đã xóa!",
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

	const handleDeleteRedisKey = async (key) => {
		const result = await Swal.fire({
			title: "Xác nhận xóa key?",
			text: tUI("admin.cache.redis.deleteConfirm", { key }) || `Bạn có chắc muốn xóa key "${key}"?`,
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Xóa ngay",
			background: "#1f2937",
			color: "#f3f4f6",
		});

		if (!result.isConfirmed) return;

		setRowLoading(prev => ({ ...prev, [key]: true }));
		try {
			const token = localStorage.getItem("token");
			await axios.delete(`${API_ADMIN_CACHE}/redis-key/${encodeURIComponent(key)}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			
			fetchRedisKeys(keyPattern, true);

			Swal.fire({
				icon: "success",
				title: tUI("admin.cache.redis.deleteSuccess") || "Đã xóa key!",
				timer: 1500,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (error) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: error.response?.data?.error || "Không thể xóa key.",
				confirmButtonColor: "#3b82f6",
			});
		} finally {
			setRowLoading(prev => ({ ...prev, [key]: false }));
		}
	};

	// --- Render Helpers ---

	const totalKeys = stats.reduce((acc, curr) => acc + (curr.keys || 0), 0);
	const totalHits = stats.reduce((acc, curr) => acc + (curr.stats?.hits || 0), 0);
	const totalMisses = stats.reduce((acc, curr) => acc + (curr.stats?.misses || 0), 0);
	const hitRate = totalHits + totalMisses > 0 
		? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) 
		: 0;

	return (
		<div className="max-w-7xl animate-fadeIn font-secondary">
			{/* Header */}
			<header className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
				<div>
					<h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3 font-primary uppercase tracking-tight">
						<div className="p-2 bg-primary-500 rounded-xl">
							<Database className="h-7 w-7 text-white" />
						</div>
						{tUI("admin.cache.title")}
					</h1>
					<p className="text-text-secondary max-w-2xl font-medium">
						{tUI("admin.cache.subtitle")}
					</p>
				</div>
				<div className="flex gap-2">
					<button
						onClick={() => activeTab === "overview" ? fetchStats() : (fetchRedisInfo() || fetchRedisKeys(keyPattern))}
						disabled={loading}
						className="group flex items-center gap-2 px-4 py-2.5 bg-surface-bg border border-border rounded-xl hover:bg-surface-hover hover:border-primary-500/50 transition-all text-sm font-bold shadow-sm"
					>
						<RefreshCw size={18} className={`${loading ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
						{tUI("admin.common.refresh") || "Làm mới"}
					</button>
					{activeTab === "overview" && (
						<button
							onClick={handleClearAll}
							disabled={loading || stats.length === 0}
							className="flex items-center gap-2 px-6 py-2.5 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20 disabled:opacity-50"
						>
							<Trash2 size={18} />
							{tUI("admin.cache.clearAll")}
						</button>
					)}
				</div>
			</header>

			{/* Tabs Navigation */}
			<div className="flex gap-2 mb-8 p-1.5 bg-surface-bg border border-border rounded-2xl w-fit">
				<TabButton 
					active={activeTab === "overview"} 
					onClick={() => setActiveTab("overview")} 
					icon={<Activity size={18} />}
					label={tUI("admin.cache.tabs.overview") || "Tổng quan"}
				/>
				<TabButton 
					active={activeTab === "redis"} 
					onClick={() => setActiveTab("redis")} 
					icon={<Terminal size={18} />}
					label={tUI("admin.cache.tabs.redis") || "Redis Manager"}
				/>
			</div>

			{activeTab === "overview" ? (
				<>
					{/* Overview Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
						<StatCard 
							icon={<Library className="h-6 w-6" />} 
							label={tUI("admin.cache.totalModules")} 
							value={stats.length} 
							color="primary"
						/>
						<StatCard 
							icon={<Database className="h-6 w-6" />} 
							label={tUI("admin.cache.totalRecords")} 
							value={totalKeys} 
							color="amber"
						/>
						<StatCard 
							icon={<Activity className="h-6 w-6" />} 
							label={tUI("admin.cache.hitRate") || "Tỷ lệ Hit"} 
							value={`${hitRate}%`} 
							color="emerald"
						/>
						<StatCard 
							icon={<Globe className="h-6 w-6" />} 
							label={tUI("admin.cache.totalRequests") || "Tổng yêu cầu"} 
							value={totalHits + totalMisses} 
							color="blue"
						/>
					</div>

					{/* Modules Table */}
					<div className="bg-surface-bg border border-border rounded-3xl overflow-hidden shadow-xl shadow-black/5">
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr className="bg-surface-hover/30 text-text-tertiary text-[10px] uppercase tracking-widest font-black border-b border-border">
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
											<tr key={item.name} className="hover:bg-surface-hover/20 transition-colors group">
												<td className="px-6 py-5">
													<div className="flex items-center gap-3">
														<div className="h-2 w-2 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
														<span className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-primary-400 transition-colors">
															{item.name}
														</span>
													</div>
												</td>
												<td className="px-6 py-5 text-center font-mono font-bold text-text-primary text-base">
													{item.keys}
												</td>
												<td className="px-6 py-5 text-center text-emerald-400 font-mono font-bold">
													{item.stats?.hits || 0}
												</td>
												<td className="px-6 py-5 text-center text-amber-400 font-mono font-bold">
													{item.stats?.misses || 0}
												</td>
												<td className="px-6 py-5 text-center">
													<div className="flex flex-col items-center gap-1.5">
														<div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
															<div 
																className={`h-full transition-all duration-1000 ease-out ${itemRate > 70 ? 'bg-emerald-500' : itemRate > 40 ? 'bg-amber-500' : 'bg-red-500'}`}
																style={{ width: `${itemRate}%` }}
															/>
														</div>
														<span className="text-[10px] font-black text-text-tertiary">{itemRate}%</span>
													</div>
												</td>
												<td className="px-6 py-5 text-right">
													<button
														onClick={() => handleClearCache(item.name)}
														disabled={rowLoading[item.name] || loading}
														className="p-2.5 text-text-tertiary hover:text-white hover:bg-red-500 rounded-xl transition-all disabled:opacity-30 active:scale-95 shadow-sm"
														title="Clear Module Cache"
													>
														{rowLoading[item.name] ? (
															<RefreshCw size={18} className="animate-spin" />
														) : (
															<Trash2 size={18} />
														)}
													</button>
												</td>
											</tr>
										);
									}) : (
										<tr>
											<td colSpan="6" className="px-6 py-24 text-center">
												{loading ? (
													<div className="flex flex-col items-center gap-4">
														<div className="relative">
															<Database className="text-primary-500/20" size={48} />
															<div className="absolute inset-0 flex items-center justify-center">
																<RefreshCw className="animate-spin text-primary-500" size={24} />
															</div>
														</div>
														<p className="text-text-tertiary font-bold animate-pulse uppercase tracking-widest text-xs">
															{tUI("admin.cache.statsLoading")}
														</p>
													</div>
												) : (
													<div className="flex flex-col items-center gap-4 text-text-tertiary">
														<AlertCircle size={48} className="opacity-20" />
														<p className="font-bold uppercase tracking-widest text-xs">
															{tUI("admin.cache.statsEmpty")}
														</p>
													</div>
												)}
											</td>
										</tr>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</>
			) : (
				/* Redis Console Tab */
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Sidebar: Redis Info */}
					<div className="lg:col-span-1 space-y-6">
						<section className="bg-surface-bg border border-border rounded-3xl p-6 shadow-xl">
							<h3 className="text-lg font-black text-text-primary mb-6 flex items-center gap-2 uppercase tracking-tight border-b border-border pb-4">
								<Cpu size={20} className="text-primary-500" />
								{tUI("admin.cache.redis.infoTitle") || "Redis Server"}
							</h3>
							
							{redisInfo ? (
								<div className="space-y-4">
									<InfoRow 
										label={tUI("admin.cache.redis.connected") || "Trạng thái"} 
										value={redisInfo.connected ? "ONLINE" : "OFFLINE"} 
										status={redisInfo.connected ? "success" : "error"}
									/>
									<InfoRow label={tUI("admin.cache.redis.version") || "Phiên bản"} value={redisInfo.version} />
									<InfoRow 
										label={tUI("admin.cache.redis.uptime") || "Uptime"} 
										value={formatUptime(redisInfo.uptime)} 
										icon={<Clock size={14} />}
									/>
									<InfoRow 
										label={tUI("admin.cache.redis.memory") || "Bộ nhớ"} 
										value={redisInfo.memory} 
										icon={<HardDrive size={14} />}
									/>
									<InfoRow 
										label={tUI("admin.cache.redis.clients") || "Kết nối"} 
										value={redisInfo.clients} 
										icon={<Globe size={14} />}
									/>
								</div>
							) : (
								<div className="flex items-center justify-center py-10 animate-pulse">
									<p className="text-text-tertiary text-sm font-bold">Đang tải thông tin...</p>
								</div>
							)}
						</section>

						<div className="p-5 bg-primary-500/5 border border-primary-500/10 rounded-2xl">
							<div className="flex items-center gap-2 text-primary-400 font-bold text-xs uppercase tracking-widest mb-2">
								<Terminal size={14} />
								Console Message
							</div>
							<p className="text-xs text-text-tertiary leading-relaxed">
								Hệ thống đang kết nối trực tiếp tới Redis instance thông qua <b>ioredis</b>. 
								Mọi thao tác xóa key sẽ có hiệu lực ngay lập tức trên toàn hệ thống.
							</p>
						</div>
					</div>

					{/* Main: Key Explorer */}
					<div className="lg:col-span-2 space-y-6">
						<section className="bg-surface-bg border border-border rounded-3xl shadow-xl flex flex-col h-full min-h-[600px]">
							<div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-hover/10">
								<h3 className="text-lg font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
									<Search size={20} className="text-primary-500" />
									{tUI("admin.cache.redis.explorerTitle") || "Key Explorer"}
								</h3>
								
								<div className="relative flex-grow max-w-md">
									<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
										<Terminal size={16} className="text-text-tertiary" />
									</div>
									<input
										type="text"
										value={keyPattern}
										onChange={(e) => setKeyPattern(e.target.value)}
										onKeyDown={(e) => e.key === "Enter" && fetchRedisKeys(keyPattern)}
										placeholder={tUI("admin.cache.redis.searchPlaceholder") || "Search keys..."}
										className="w-full bg-page-bg border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-mono"
									/>
									<button 
										onClick={() => fetchRedisKeys(keyPattern)}
										className="absolute inset-y-0 right-0 px-3 text-primary-500 hover:text-primary-400 font-bold text-xs"
									>
										SCAN
									</button>
								</div>
							</div>

							<div className="flex-1 overflow-auto p-0">
								{redisKeys.length > 0 ? (
									<div className="divide-y divide-border">
										{redisKeys.map((key) => (
											<div key={key} className="flex items-center justify-between p-4 hover:bg-surface-hover/30 transition-all group">
												<div className="flex items-center gap-3 overflow-hidden">
													<ChevronRight size={14} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-all -ml-2" />
													<code className="text-sm font-mono text-text-primary truncate font-bold bg-white/5 px-2 py-1 rounded">
														{key}
													</code>
												</div>
												<button
													onClick={() => handleDeleteRedisKey(key)}
													disabled={rowLoading[key] || loading}
													className="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all"
													title="Delete Key"
												>
													{rowLoading[key] ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
												</button>
											</div>
										))}
									</div>
								) : (
									<div className="h-full flex flex-col items-center justify-center py-20 text-text-tertiary">
										<Terminal size={40} className="opacity-10 mb-4" />
										<p className="text-sm font-bold uppercase tracking-widest opacity-50">
											{tUI("admin.cache.redis.noKeys") || "No keys found"}
										</p>
									</div>
								)}
							</div>
							
							<div className="p-4 border-t border-border bg-surface-hover/5 flex justify-between items-center">
								<span className="text-[10px] font-black text-text-tertiary uppercase tracking-widest">
									FOUND {redisKeys.length} KEYS
								</span>
								<button 
									onClick={() => fetchRedisKeys(keyPattern)}
									className="text-[10px] font-black text-primary-500 hover:text-primary-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
								>
									<RefreshCw size={10} />
									{tUI("admin.cache.redis.refreshKeys") || "Làm mới"}
								</button>
							</div>
						</section>
					</div>
				</div>
			)}
			
			{/* Bottom Warning */}
			<div className="mt-8 p-6 bg-amber-500/5 border border-amber-500/20 rounded-3xl flex items-start gap-4 backdrop-blur-md">
				<div className="p-3 bg-amber-500/20 rounded-2xl text-amber-500 shrink-0 shadow-lg shadow-amber-500/10">
					<ShieldAlert size={24} />
				</div>
				<div>
					<h4 className="text-amber-400 font-black text-sm uppercase tracking-widest mb-1">Cảnh báo bảo mật & Hiệu suất</h4>
					<p className="text-sm text-text-secondary leading-relaxed font-medium">
						{tUI("admin.cache.warning")}
					</p>
				</div>
			</div>
		</div>
	);
};

// --- Sub-components ---

const TabButton = ({ active, onClick, icon, label }) => (
	<button
		onClick={onClick}
		className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all tracking-tight ${
			active 
				? "bg-primary-500 text-white shadow-lg shadow-primary-500/20" 
				: "text-text-tertiary hover:text-text-primary hover:bg-surface-hover/50"
		}`}
	>
		{icon}
		{label}
	</button>
);

const StatCard = ({ icon, label, value, color }) => {
	const colorMap = {
		primary: "bg-primary-500/10 text-primary-500 border-primary-500/20 shadow-primary-500/5",
		amber: "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5",
		emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5",
		blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 shadow-blue-500/5",
	};

	return (
		<div className="p-6 bg-surface-bg border border-border rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-500 group hover:-translate-y-2 relative overflow-hidden">
			<div className="absolute top-0 right-0 p-4 opacity-[0.03] transition-opacity group-hover:opacity-[0.08]">
				{icon}
			</div>
			<div className="flex items-center gap-5 relative z-10">
				<div className={`p-4 rounded-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-inner ${colorMap[color] || colorMap.primary}`}>
					{icon}
				</div>
				<div>
					<p className="text-[10px] text-text-tertiary uppercase tracking-[0.25em] font-black mb-1.5 opacity-60">
						{label}
					</p>
					<p className="text-3xl font-black text-text-primary tracking-tighter">
						{value}
					</p>
				</div>
			</div>
		</div>
	);
};

const InfoRow = ({ label, value, status, icon }) => (
	<div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0 group">
		<span className="text-xs font-bold text-text-tertiary flex items-center gap-2 group-hover:text-text-secondary transition-colors">
			{icon}
			{label}
		</span>
		<span className={`text-xs font-black tracking-tight ${
			status === "success" ? "text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded" : 
			status === "error" ? "text-red-400 bg-red-400/10 px-2 py-0.5 rounded" : 
			"text-text-primary"
		}`}>
			{value}
		</span>
	</div>
);

const formatUptime = (seconds) => {
	if (!seconds) return "N/A";
	const days = Math.floor(seconds / 86400);
	const hours = Math.floor((seconds % 86400) / 3600);
	const mins = Math.floor((seconds % 3600) / 60);
	
	if (days > 0) return `${days}d ${hours}h`;
	if (hours > 0) return `${hours}h ${mins}m`;
	return `${mins}m ${Math.floor(seconds % 60)}s`;
};

export default CacheManager;
