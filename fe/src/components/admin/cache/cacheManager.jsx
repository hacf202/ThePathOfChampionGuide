import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import { 
	Trash2, RefreshCw, Database, HardDrive, ShieldAlert, 
	AlertCircle, Activity, Search, Cpu, Clock, Terminal, 
	Globe, ChevronRight, Library, LayoutGrid, Server
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Swal from "sweetalert2";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { InfoTooltip } from "../analytics/AnalyticsDashboard";

const API_ADMIN_CACHE = `${import.meta.env.VITE_API_URL}/api/admin/cache`;

const CacheManager = () => {
	const { tUI } = useTranslation();
	const [activeTab, setActiveTab] = useState("overview"); // "overview" | "redis"
	const [stats, setStats] = useState([]);
	const [redisInfo, setRedisInfo] = useState(null);
	const [redisKeys, setRedisKeys] = useState([]);
	const [redisCategories, setRedisCategories] = useState([]);
	const [keyPattern, setKeyPattern] = useState("*");
	const [loading, setLoading] = useState(false);
	const [rowLoading, setRowLoading] = useState({});
	const containerRef = useRef();

	useGSAP(() => {
		gsap.from(".gsap-element", {
			y: 20,
			opacity: 0,
			duration: 0.4,
			stagger: 0.05,
			ease: "power2.out",
			clearProps: "all"
		});
	}, { dependencies: [activeTab, loading, redisCategories.length, redisKeys.length], scope: containerRef });

	const fetchStats = useCallback(async (silent = false) => {
		if (!silent) setLoading(true);
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_ADMIN_CACHE}/stats?t=${Date.now()}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setStats(response.data || []);
		} catch (error) {
			console.error("Error fetching cache stats:", error);
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

	const fetchRedisCategories = useCallback(async (silent = false) => {
		try {
			const token = localStorage.getItem("token");
			const response = await axios.get(`${API_ADMIN_CACHE}/redis-categories`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setRedisCategories(response.data.categories || []);
		} catch (error) {
			console.error("Error fetching Redis categories:", error);
		}
	}, []);

	useEffect(() => {
		if (activeTab === "overview") {
			fetchStats();
		} else {
			fetchRedisInfo();
			fetchRedisCategories();
			fetchRedisKeys(keyPattern);
		}
	}, [activeTab, fetchStats, fetchRedisInfo, fetchRedisKeys, fetchRedisCategories, keyPattern]);

	const handleClearAll = async () => {
		const result = await Swal.fire({
			title: tUI("admin.cache.confirmTitle") || "Xác nhận xóa toàn bộ?",
			text: tUI("admin.cache.confirmText") || "Hành động này sẽ xóa sạch dữ liệu đệm của tất cả các module.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "#ef4444",
			cancelButtonColor: "#6b7280",
			confirmButtonText: "Xóa tất cả",
			cancelButtonText: "Hủy bỏ",
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
			Swal.fire({ icon: "success", title: "Đã làm sạch!", timer: 2000, showConfirmButton: false, toast: true, position: "top-end" });
		} catch (error) {
			Swal.fire({ icon: "error", title: "Lỗi", text: error.response?.data?.error || "Không thể xóa cache.", confirmButtonColor: "#3b82f6" });
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
			Swal.fire({ icon: "success", title: "Đã xóa!", timer: 2000, showConfirmButton: false, toast: true, position: "top-end" });
		} catch (error) {
			Swal.fire({ icon: "error", title: "Lỗi", text: error.response?.data?.error || `Lỗi khi xóa cache ${name}.`, confirmButtonColor: "#3b82f6" });
		} finally {
			setRowLoading(prev => ({ ...prev, [name]: false }));
		}
	};

	const handleDeleteRedisKey = async (key) => {
		const result = await Swal.fire({
			title: "Xác nhận xóa key?",
			text: `Bạn có chắc muốn xóa key "${key}"?`,
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
			Swal.fire({ icon: "success", title: "Đã xóa key!", timer: 1500, showConfirmButton: false, toast: true, position: "top-end" });
		} catch (error) {
			Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể xóa key.", confirmButtonColor: "#3b82f6" });
		} finally {
			setRowLoading(prev => ({ ...prev, [key]: false }));
		}
	};

	const totalKeys = stats.reduce((acc, curr) => acc + (curr.keys || 0), 0);
	const totalHits = stats.reduce((acc, curr) => acc + (curr.stats?.hits || 0), 0);
	const totalMisses = stats.reduce((acc, curr) => acc + (curr.stats?.misses || 0), 0);
	const hitRate = totalHits + totalMisses > 0 ? ((totalHits / (totalHits + totalMisses)) * 100).toFixed(1) : 0;

	const systemCats = redisCategories.filter(c => c.name.startsWith("System:"));
	const apiCats = redisCategories.filter(c => c.name.startsWith("API:") || c.name.startsWith("Cache:"));
	const otherCats = redisCategories.filter(c => !c.name.startsWith("System:") && !c.name.startsWith("API:") && !c.name.startsWith("Cache:"));

	return (
		<div ref={containerRef} className="max-w-7xl pb-16 font-secondary">
			{/* --- TOP HEADER & NAVIGATION --- */}
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 gsap-element">
				<div>
					<h1 className="text-3xl font-black text-text-primary mb-2 flex items-center gap-3 font-primary uppercase tracking-tight">
						<div className="p-2.5 bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl shadow-lg shadow-primary-500/20">
							<Database className="h-6 w-6 text-white" />
						</div>
						Quản trị Bộ nhớ đệm
					</h1>
					<p className="text-text-secondary text-sm font-medium">
						Kiểm soát và tối ưu hóa hệ thống lưu trữ đệm (Cache) và kết nối Redis.
					</p>
				</div>
				
				<div className="flex flex-col sm:flex-row items-center gap-4">
					{/* Segmented Control */}
					<div className="flex p-1 bg-surface-hover/30 border border-border/50 rounded-xl w-full sm:w-auto shadow-inner">
						<button
							onClick={() => setActiveTab("overview")}
							className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
								activeTab === "overview" ? "bg-surface-bg text-text-primary shadow-sm ring-1 ring-border" : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover/50"
							}`}
						>
							<LayoutGrid size={16} className={activeTab === "overview" ? "text-primary-500" : ""} />
							Tổng quan
						</button>
						<button
							onClick={() => setActiveTab("redis")}
							className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
								activeTab === "redis" ? "bg-surface-bg text-text-primary shadow-sm ring-1 ring-border" : "text-text-tertiary hover:text-text-primary hover:bg-surface-hover/50"
							}`}
						>
							<Server size={16} className={activeTab === "redis" ? "text-amber-500" : ""} />
							Redis Console
						</button>
					</div>
					
					{/* Action Buttons */}
					<div className="flex items-center gap-2 w-full sm:w-auto">
						<button
							onClick={() => activeTab === "overview" ? fetchStats() : (fetchRedisInfo() || fetchRedisKeys(keyPattern))}
							disabled={loading}
							className="flex-1 sm:flex-none flex items-center justify-center p-2.5 bg-surface-bg border border-border rounded-xl hover:bg-surface-hover transition-colors text-text-secondary hover:text-primary-500 shadow-sm disabled:opacity-50"
							title="Làm mới dữ liệu"
						>
							<RefreshCw size={18} className={`${loading ? "animate-spin" : ""}`} />
						</button>
						{activeTab === "overview" && stats.length > 0 && (
							<button
								onClick={handleClearAll}
								disabled={loading}
								className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl hover:bg-red-500 hover:text-white transition-all text-sm font-bold shadow-sm"
							>
								<Trash2 size={16} />
								<span className="hidden sm:inline">Xóa tất cả</span>
							</button>
						)}
					</div>
				</div>
			</div>

			{/* --- TAB CONTENT: OVERVIEW --- */}
			{activeTab === "overview" && (
				<div className="space-y-8">
					{/* Stat Cards */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
						<StatCard icon={<Library />} label="Tổng Modules" value={stats.length} color="blue" tooltip="Số lượng module chức năng đang được lưu cache (ví dụ: Champions, Items)." />
						<StatCard icon={<Database />} label="Tổng Records" value={totalKeys} color="amber" tooltip="Tổng số bản ghi (key) đang được lưu giữ thực tế trong Redis." />
						<StatCard icon={<Activity />} label="Tỷ lệ Hit" value={`${hitRate}%`} color="emerald" tooltip="Tỷ lệ tìm thấy dữ liệu trong bộ nhớ đệm (Cache Hit). Tỷ lệ càng cao (>70%) chứng tỏ hệ thống chạy càng mượt." />
						<StatCard icon={<Globe />} label="Tổng Yêu cầu" value={totalHits + totalMisses} color="purple" tooltip="Tổng số lượt truy cập (bao gồm cả Hit và Miss) tới hệ thống Cache." />
					</div>

					{/* Modules List (Floating Rows) */}
					<div className="space-y-4">
						<h3 className="text-sm font-black text-text-secondary uppercase tracking-widest px-2 gsap-element flex items-center gap-2">
							<LayoutGrid size={16} /> Danh sách Modules
						</h3>
						
						{loading && stats.length === 0 ? (
							<div className="py-20 flex flex-col items-center justify-center gsap-element">
								<RefreshCw className="animate-spin text-primary-500 mb-4" size={32} />
								<p className="text-text-tertiary font-bold text-sm uppercase tracking-widest">Đang tải dữ liệu...</p>
							</div>
						) : stats.length === 0 ? (
							<div className="py-20 flex flex-col items-center justify-center gsap-element bg-surface-bg border border-border border-dashed rounded-3xl">
								<AlertCircle className="text-text-tertiary opacity-30 mb-4" size={48} />
								<p className="text-text-tertiary font-bold text-sm uppercase tracking-widest">Không có dữ liệu cache</p>
							</div>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{stats.map((item) => {
									const itemTotal = (item.stats?.hits || 0) + (item.stats?.misses || 0);
									const itemRate = itemTotal > 0 ? (((item.stats?.hits || 0) / itemTotal) * 100).toFixed(0) : 0;
									const rateColor = itemRate > 70 ? 'bg-emerald-500' : itemRate > 40 ? 'bg-amber-500' : 'bg-red-500';
									
									return (
										<div key={item.name} className="gsap-element group p-5 bg-surface-bg border border-border rounded-2xl hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 transition-all flex flex-col gap-4 relative overflow-hidden">
											<div className="absolute top-0 right-0 p-4 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
												<Database size={64} />
											</div>
											
											<div className="flex items-start justify-between relative z-10">
												<div className="flex items-center gap-3">
													<div className="w-10 h-10 rounded-xl bg-surface-hover/50 flex items-center justify-center border border-border/50 text-text-secondary group-hover:text-primary-500 transition-colors">
														<Library size={20} />
													</div>
													<div>
														<h4 className="font-bold text-text-primary capitalize text-base group-hover:text-primary-400 transition-colors">{item.name}</h4>
														<p className="text-[10px] text-text-tertiary uppercase tracking-widest mt-0.5">Module Cache</p>
													</div>
												</div>
												<button
													onClick={() => handleClearCache(item.name)}
													disabled={rowLoading[item.name] || loading}
													className="p-2 text-text-tertiary hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all active:scale-95 bg-surface-hover/30"
													title={`Clear ${item.name}`}
												>
													{rowLoading[item.name] ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
												</button>
											</div>
											
											<div className="grid grid-cols-2 gap-2 relative z-10">
												<div className="p-3 bg-surface-hover/30 rounded-xl border border-border/30">
													<p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1">Số lượng Key</p>
													<p className="font-black text-lg text-text-primary font-mono">{item.keys}</p>
												</div>
												<div className="p-3 bg-surface-hover/30 rounded-xl border border-border/30">
													<p className="text-[10px] text-text-tertiary uppercase tracking-widest mb-1 flex items-center justify-between">
														Hits / Misses
													</p>
													<p className="font-black text-sm text-text-primary font-mono mt-1">
														<span className="text-emerald-400">{item.stats?.hits || 0}</span>
														<span className="text-text-tertiary font-normal mx-1">/</span>
														<span className="text-amber-400">{item.stats?.misses || 0}</span>
													</p>
												</div>
											</div>

											<div className="relative z-10 pt-2 border-t border-border/50">
												<div className="flex justify-between text-[10px] font-bold uppercase tracking-widest mb-1.5">
													<span className="text-text-tertiary">Hiệu suất (Hit Rate)</span>
													<span className={itemRate > 70 ? 'text-emerald-400' : itemRate > 40 ? 'text-amber-400' : 'text-red-400'}>{itemRate}%</span>
												</div>
												<div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
													<div className={`h-full ${rateColor} transition-all duration-1000 ease-out`} style={{ width: `${itemRate}%` }} />
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>
				</div>
			)}

			{/* --- TAB CONTENT: REDIS MANAGER --- */}
			{activeTab === "redis" && (
				<div className="flex flex-col gap-8">
					{/* Redis Server Metrics */}
					{redisInfo ? (
						<div className="gsap-element grid grid-cols-2 md:grid-cols-5 gap-4">
							<ServerMetric label="Trạng thái" value={redisInfo.connected ? "ONLINE" : "OFFLINE"} icon={<Cpu size={16}/>} highlight={redisInfo.connected ? 'text-emerald-400' : 'text-red-400'} glow={redisInfo.connected ? 'shadow-emerald-500/10' : 'shadow-red-500/10'} />
							<ServerMetric label="Phiên bản" value={redisInfo.version} icon={<Server size={16}/>} />
							<ServerMetric label="Uptime" value={formatUptime(redisInfo.uptime)} icon={<Clock size={16}/>} />
							<ServerMetric label="Bộ nhớ" subValue={`/ ${redisInfo.memory_peak || 'N/A'} (Peak)`} value={redisInfo.memory} icon={<HardDrive size={16}/>} highlight="text-primary-400" glow="shadow-primary-500/10" />
							<ServerMetric label="Kết nối" value={redisInfo.clients} icon={<Globe size={16}/>} />
						</div>
					) : (
						<div className="h-24 animate-pulse bg-surface-bg border border-border rounded-3xl" />
					)}

					{/* Categories */}
					{redisCategories.length > 0 && (
						<div className="gsap-element space-y-4">
							<h3 className="text-sm font-black text-text-secondary uppercase tracking-widest px-2 flex items-center gap-2">
								<Database size={16} /> Phân loại Dữ liệu
							</h3>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
								<CategoryColumn title="System Data" icon={<ShieldAlert size={14} />} items={systemCats} color="primary" />
								<CategoryColumn title="API Cache" icon={<Activity size={14} />} items={apiCats} color="emerald" />
								<CategoryColumn title="Khác" icon={<Library size={14} />} items={otherCats} color="amber" />
							</div>
						</div>
					)}

					{/* Key Explorer */}
					<div className="gsap-element bg-surface-bg border border-border rounded-3xl shadow-sm flex flex-col overflow-hidden">
						{/* Explorer Header */}
						<div className="p-4 sm:p-6 border-b border-border bg-surface-hover/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
							<h3 className="text-base font-black text-text-primary flex items-center gap-2 uppercase tracking-tight">
								<Search size={18} className="text-primary-500" /> Key Explorer
							</h3>
							
							<div className="relative w-full sm:max-w-md group">
								<div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
									<Terminal size={16} className="text-text-tertiary group-focus-within:text-primary-500 transition-colors" />
								</div>
								<input
									type="text"
									value={keyPattern}
									onChange={(e) => setKeyPattern(e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && fetchRedisKeys(keyPattern)}
									placeholder="Nhập pattern tìm kiếm (vd: api:*)..."
									className="w-full bg-surface-bg border border-border rounded-2xl py-2.5 pl-12 pr-16 text-sm font-mono focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 transition-all shadow-inner"
								/>
								<button 
									onClick={() => fetchRedisKeys(keyPattern)}
									className="absolute inset-y-1.5 right-1.5 px-3 bg-primary-500/10 text-primary-500 hover:bg-primary-500 hover:text-white rounded-xl font-bold text-xs transition-colors flex items-center gap-1"
								>
									<Search size={12}/> Scan
								</button>
							</div>
						</div>

						{/* Explorer Body */}
						<div className="flex-1 max-h-[400px] overflow-y-auto overflow-auto-scrollbar p-2">
							{redisKeys.length > 0 ? (
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
									{redisKeys.map((key) => (
										<div key={key} className="flex items-center justify-between p-3 bg-surface-bg hover:bg-surface-hover/50 border border-border/50 rounded-xl transition-all group">
											<div className="flex items-center gap-3 overflow-hidden pr-2">
												<ChevronRight size={14} className="text-primary-500 opacity-0 group-hover:opacity-100 transition-all -ml-4 group-hover:ml-0" />
												<code className="text-xs font-mono text-text-primary truncate font-bold bg-white/5 px-2 py-1 rounded border border-white/5">
													{key}
												</code>
											</div>
											<button
												onClick={() => handleDeleteRedisKey(key)}
												disabled={rowLoading[key] || loading}
												className="p-1.5 text-text-tertiary hover:text-white hover:bg-red-500 rounded-lg transition-all active:scale-95 opacity-50 group-hover:opacity-100 shrink-0"
												title="Xóa Key"
											>
												{rowLoading[key] ? <RefreshCw size={14} className="animate-spin" /> : <Trash2 size={14} />}
											</button>
										</div>
									))}
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-16 text-text-tertiary">
									<Terminal size={40} className="opacity-10 mb-4" />
									<p className="text-xs font-bold uppercase tracking-widest opacity-50">Không tìm thấy key nào</p>
								</div>
							)}
						</div>
						
						{/* Explorer Footer */}
						<div className="p-3 border-t border-border bg-surface-hover/20 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-text-tertiary">
							<span>Đã tìm thấy <span className="text-primary-400 mx-1 text-xs">{redisKeys.length}</span> Keys</span>
							<span>Kết nối trực tiếp qua ioredis</span>
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

// --- Sub Components ---

const StatCard = ({ icon, label, value, color, tooltip="" }) => {
	const colorMap = {
		primary: "text-primary-500 from-primary-500/10 to-transparent border-primary-500/20",
		amber: "text-amber-500 from-amber-500/10 to-transparent border-amber-500/20",
		emerald: "text-emerald-400 from-emerald-500/10 to-transparent border-emerald-500/20",
		blue: "text-blue-400 from-blue-500/10 to-transparent border-blue-500/20",
		purple: "text-purple-400 from-purple-500/10 to-transparent border-purple-500/20",
	};

	return (
		<div className={`gsap-element p-5 bg-surface-bg border rounded-[2rem] shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-all duration-300 ${colorMap[color] || colorMap.primary}`}>
			<div className={`absolute inset-0 bg-gradient-to-br opacity-50 ${colorMap[color] || colorMap.primary} pointer-events-none`} />
			<div className="absolute -top-6 -right-6 p-4 opacity-5 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-12 pointer-events-none">
				{React.cloneElement(icon, { size: 100 })}
			</div>
			<div className="flex items-center gap-4 relative z-10">
				<div className={`p-3 rounded-2xl bg-surface-bg border shadow-inner transition-transform duration-300 group-hover:scale-110 ${colorMap[color] || colorMap.primary}`}>
					{React.cloneElement(icon, { size: 20 })}
				</div>
				<div>
					<p className="text-[10px] text-text-tertiary uppercase tracking-[0.2em] font-black mb-0.5 flex items-center">
						{label}
						{tooltip && <InfoTooltip text={tooltip} />}
					</p>
					<p className="text-2xl font-black text-text-primary tracking-tighter">{value}</p>
				</div>
			</div>
		</div>
	);
};

const ServerMetric = ({ label, value, subValue, icon, highlight = "text-text-primary", glow = "" }) => (
	<div className={`p-4 bg-surface-bg border border-border rounded-2xl shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-border/80 transition-colors ${glow && `hover:shadow-lg ${glow}`}`}>
		<div className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-text-tertiary group-hover:text-text-secondary transition-colors">
			{icon} {label}
		</div>
		<div className="font-mono">
			<span className={`text-base font-black ${highlight}`}>{value}</span>
			{subValue && <span className="text-xs text-text-tertiary ml-1">{subValue}</span>}
		</div>
	</div>
);

const CategoryColumn = ({ title, icon, items, color }) => {
	if (!items || items.length === 0) return null;
	const colorMap = {
		primary: "text-primary-500 bg-primary-500/10 border-primary-500/20",
		emerald: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
		amber: "text-amber-500 bg-amber-500/10 border-amber-500/20",
	};
	
	return (
		<div className="p-4 bg-surface-bg border border-border rounded-3xl shadow-sm flex flex-col h-full">
			<h4 className="text-[11px] font-black text-text-secondary uppercase tracking-widest mb-4 flex items-center gap-2 border-b border-border/50 pb-3">
				<span className={colorMap[color].split(' ')[0]}>{icon}</span> {title}
			</h4>
			<div className="space-y-2 flex-1">
				{items.map(cat => (
					<div key={cat.name} className="flex items-center justify-between group hover:bg-surface-hover/50 p-2.5 rounded-xl transition-all border border-transparent hover:border-border/50">
						<span className="text-xs font-bold text-text-tertiary group-hover:text-text-primary transition-colors truncate max-w-[70%]">
							{cat.name.replace("System: ", "").replace("API: ", "").replace("Cache: ", "")}
						</span>
						<span className={`text-[10px] font-black px-2 py-0.5 rounded-lg ${colorMap[color]}`}>
							{cat.count}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};

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
