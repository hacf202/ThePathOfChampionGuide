import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash2, RefreshCw, Database, HardDrive, ShieldAlert, CheckCircle2, AlertCircle } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

const API_ADMIN_CACHE = `${import.meta.env.VITE_API_URL}/api/admin/cache`;

const CacheManager = () => {
    const { tUI } = useTranslation();
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);
    const [rowLoading, setRowLoading] = useState({});
    const [message, setMessage] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.get(`${API_ADMIN_CACHE}/stats`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStats(response.data || []);
        } catch (error) {
            console.error("Error fetching cache stats:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    const handleClearAll = async () => {
        setActionLoading(true);
        setMessage(null);
        try {
            const token = localStorage.getItem("token");
            const response = await axios.delete(`${API_ADMIN_CACHE}/clear-all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: "success", text: tUI("admin.cache.clearSuccess") || "Xóa toàn bộ cache thành công!" });
            fetchStats();
            setShowConfirm(false);
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || "Lỗi khi xóa cache" });
        } finally {
            setActionLoading(false);
        }
    };

    const handleClearCache = async (name) => {
        setRowLoading(prev => ({ ...prev, [name]: true }));
        setMessage(null);
        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${API_ADMIN_CACHE}/clear/${name}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage({ type: "success", text: `Đã làm sạch cache "${name}" thành công!` });
            fetchStats();
        } catch (error) {
            setMessage({ type: "error", text: error.response?.data?.error || `Lỗi khi xóa cache ${name}` });
        } finally {
            setRowLoading(prev => ({ ...prev, [name]: false }));
        }
    };

    return (
        <div className="max-w-4xl animate-fadeIn">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-text-primary mb-2 flex items-center gap-3 font-primary">
                    <RefreshCw className={`h-8 w-8 text-primary-500 ${loading ? "animate-spin" : ""}`} />
                    {tUI("admin.cache.title") || "Quản lý Cache Backend"}
                </h1>
                <p className="text-text-secondary">
                    {tUI("admin.cache.subtitle") || "Theo dõi và dọn dẹp các bản ghi được lưu tạm để cập nhật dữ liệu mới nhất."}
                </p>
            </header>

            {message && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 animate-slideIn ${
                    message.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"
                }`}>
                    {message.type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <span className="font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 bg-surface-bg border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-primary-500/10 rounded-xl text-primary-500">
                            <Database size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Tổng số module</p>
                            <p className="text-2xl font-bold text-text-primary">{stats.length}</p>
                        </div>
                    </div>
                </div>
                
                <div className="p-6 bg-surface-bg border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500">
                            <HardDrive size={24} />
                        </div>
                        <div>
                            <p className="text-xs text-text-tertiary uppercase tracking-wider font-bold">Tổng bản ghi</p>
                            <p className="text-2xl font-bold text-text-primary">
                                {stats.reduce((acc, curr) => acc + (curr.keys || 0), 0)}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-surface-bg border border-border rounded-2xl flex flex-col justify-center items-center gap-4">
                     {!showConfirm ? (
                        <button
                            onClick={() => setShowConfirm(true)}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-all shadow-lg shadow-red-500/20"
                        >
                            <Trash2 size={20} />
                            {tUI("admin.cache.clearAll") || "Xóa toàn bộ Cache"}
                        </button>
                     ) : (
                        <div className="flex flex-col gap-3 w-full">
                            <p className="text-sm font-bold text-red-400 text-center flex items-center justify-center gap-2">
                                <ShieldAlert size={16} /> Xác nhận xóa?
                            </p>
                            <div className="flex gap-2 w-full">
                                <button
                                    onClick={handleClearAll}
                                    disabled={actionLoading}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 disabled:opacity-50"
                                >
                                    {actionLoading ? "..." : "Xác nhận"}
                                </button>
                                <button
                                    onClick={() => setShowConfirm(false)}
                                    className="flex-1 py-2 bg-surface-hover text-text-primary rounded-lg font-bold"
                                >
                                    Hủy
                                </button>
                            </div>
                        </div>
                     )}
                </div>
            </div>

            <div className="bg-surface-bg border border-border rounded-3xl overflow-hidden shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-surface-hover/50 text-text-tertiary text-xs uppercase tracking-widest font-bold">
                            <th className="px-6 py-4">Module Name</th>
                            <th className="px-6 py-4 text-center">Cached Keys</th>
                            <th className="px-6 py-4 text-center">Hits</th>
                            <th className="px-6 py-4 text-center">Misses</th>
                            <th className="px-6 py-4 text-right">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {stats.length > 0 ? stats.map((item) => (
                            <tr key={item.name} className="hover:bg-surface-hover/30 transition-colors">
                                <td className="px-6 py-5">
                                    <span className="px-3 py-1 bg-white/5 rounded-lg text-sm font-bold text-text-primary uppercase">
                                        {item.name}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-center font-mono text-primary-400">
                                    {item.keys}
                                </td>
                                <td className="px-6 py-5 text-center text-emerald-400 font-mono">
                                    {item.stats?.hits || 0}
                                </td>
                                <td className="px-6 py-5 text-center text-amber-400 font-mono">
                                    {item.stats?.misses || 0}
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <button
                                        onClick={() => handleClearCache(item.name)}
                                        disabled={rowLoading[item.name]}
                                        title={`Xóa cache ${item.name}`}
                                        className="p-2 text-text-tertiary hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all disabled:opacity-30"
                                    >
                                        {rowLoading[item.name] ? (
                                            <RefreshCw size={18} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={18} />
                                        )}
                                    </button>
                                </td>
                            </tr>
                        )) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-text-tertiary italic">
                                    {loading ? "Đang tải dữ liệu..." : "Không có cache nào được đăng ký."}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
            
            <p className="mt-6 text-sm text-text-tertiary flex items-center gap-2 italic">
                <AlertCircle size={14} /> 
                {tUI("admin.cache.warning") || "Lưu ý: Xóa cache sẽ buộc Server phải truy vấn lại Database, điều này có thể làm chậm các yêu cầu đầu tiên."}
            </p>
        </div>
    );
};

export default CacheManager;
