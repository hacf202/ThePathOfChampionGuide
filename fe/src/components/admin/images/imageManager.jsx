import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import {
	getR2Folders,
	getImagesByFolder,
	uploadMultipleImagesR2,
	deleteImageR2,
	updateImageR2,
	createR2Folder,
	deleteR2Folder,
	getBucketStats,
} from "@/context/services/apiHelper";
import PageTitle from "@/components/common/pageTitle";
import Button from "@/components/common/button";
import { LoadingState } from "@/components/admin/common/stateDisplays";
import {
	UploadCloud,
	Search,
	LayoutGrid,
	List as ListIcon,
	Trash2,
	Edit3,
	Copy,
	FolderPlus,
	FolderMinus,
	Image as ImageIcon,
	X,
	CheckCircle,
	ZoomIn,
	ZoomOut,
	ChevronRight,
	HardDrive,
	Folder,
	ExternalLink,
	RefreshCw,
	ChevronLeft,
	ArrowLeft,
} from "lucide-react";

const formatBytes = (bytes, decimals = 2) => {
	if (!bytes || bytes === 0) return "0 Bytes";
	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ["Bytes", "KB", "MB", "GB"];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

const ImageManager = memo(() => {
	const { folderName } = useParams();
	const navigate = useNavigate();
	
	const [folders, setFolders] = useState([]);
	const currentFolder = useMemo(() => folderName || "", [folderName]);
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);

	// Drag & Drop state
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [isDragging, setIsDragging] = useState(false);

	// Bucket Stats
	const [bucketStats, setBucketStats] = useState({ totalSize: 0, totalFiles: 0 });
	const [statsLoading, setStatsLoading] = useState(false);

	// View & Search state
	const [searchTerm, setSearchTerm] = useState("");
	const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"
	const [zoomLevel, setZoomLevel] = useState(3); // 1 to 5

	const updateFileInputRef = useRef(null);
	const fileInputRef = useRef(null);
	const [updatingKey, setUpdatingKey] = useState(null);

	// ---- Data Fetching ----
	const loadFolders = async () => {
		try {
			const data = await getR2Folders();
			const list = data.folders || [];
			setFolders(list);
		} catch (err) {
			console.error("Lỗi tải thư mục", err);
		}
	};

	const loadBucketStatsData = async () => {
		setStatsLoading(true);
		try {
			const data = await getBucketStats();
			setBucketStats(data || { totalSize: 0, totalFiles: 0 });
		} catch (err) {
			console.error("Lỗi tải thông tin bucket", err);
		} finally {
			setStatsLoading(false);
		}
	};

	useEffect(() => {
		loadFolders();
		loadBucketStatsData();
	}, []);

	useEffect(() => {
		if (currentFolder) {
			loadImages();
			setSelectedFiles([]); 
		}
	}, [currentFolder]);

	const loadImages = async () => {
		setLoading(true);
		try {
			const data = await getImagesByFolder(currentFolder);
			setImages(data.files || []);
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: "Không thể tải danh sách ảnh.",
				confirmButtonColor: "var(--color-primary-500)",
			});
		} finally {
			setLoading(false);
		}
	};

	// ---- Filtered Images ----
	const filteredImages = useMemo(() => {
		if (!searchTerm) return images;
		return images.filter((img) =>
			img.key.toLowerCase().includes(searchTerm.toLowerCase())
		);
	}, [images, searchTerm]);

	const currentFolderSize = useMemo(() => {
		return images.reduce((acc, img) => acc + (img.size || 0), 0);
	}, [images]);

	// ---- Folder Actions ----
	const handleCreateFolder = async () => {
		const { value: name } = await Swal.fire({
			title: "Tạo thư mục mới",
			input: "text",
			inputLabel: "Tên thư mục",
			inputPlaceholder: "Không dấu, không khoảng cách...",
			showCancelButton: true,
			confirmButtonColor: "var(--color-primary-500)",
			cancelButtonColor: "var(--color-text-secondary)",
			confirmButtonText: "Tạo ngay",
			cancelButtonText: "Hủy",
			background: "var(--color-surface-bg)",
			color: "var(--color-text-primary)",
			inputValidator: (value) => {
				if (!value) return "Bạn cần nhập tên thư mục!";
				if (/\s/.test(value)) return "Tên thư mục không được chứa khoảng trắng!";
			}
		});

		if (!name) return;

		try {
			await createR2Folder(name);
			
			Swal.fire({
				icon: "success",
				title: "Đã tạo!",
				text: `Thư mục "${name}" đã sẵn sàng.`,
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
			
			await loadFolders();
			navigate(`/admin/images/${name}`);
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: err.message || "Không thể tạo thư mục.",
				confirmButtonColor: "var(--color-primary-500)",
			});
		}
	};

	const handleDeleteFolder = async (e, folder) => {
		e.stopPropagation();
		const folderToDelete = folder || currentFolder;
		
		const result = await Swal.fire({
			title: "CẢNH BÁO NGUY HIỂM",
			text: `Bạn sẽ xóa toàn bộ thư mục "${folderToDelete}" và TẤT CẢ ảnh bên trong. Hành động này không thể hoàn tác!`,
			icon: "error",
			showCancelButton: true,
			confirmButtonColor: "var(--color-danger-500)",
			cancelButtonColor: "var(--color-text-secondary)",
			confirmButtonText: "Tôi chấp nhận rủi ro, hãy xóa!",
			cancelButtonText: "Hủy bỏ",
			background: "var(--color-surface-bg)",
			color: "var(--color-text-primary)",
		});

		if (!result.isConfirmed) return;

		try {
			setLoading(true);
			await deleteR2Folder(folderToDelete);
			
			Swal.fire({
				icon: "success",
				title: "Đã xóa!",
				text: `Thư mục "${folderToDelete}" đã được loại bỏ.`,
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
			
			if (folderToDelete === currentFolder) {
				navigate("/admin/images");
			}
			await loadFolders();
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: "Không thể xóa thư mục. Vui lòng kiểm tra lại.",
				confirmButtonColor: "var(--color-primary-500)",
			});
		} finally {
			setLoading(false);
		}
	};

	// ---- Drag & Drop Handlers ----
	const onDragOver = (e) => {
		e.preventDefault();
		setIsDragging(true);
	};
	const onDragLeave = (e) => {
		e.preventDefault();
		setIsDragging(false);
	};
	const onDrop = (e) => {
		e.preventDefault();
		setIsDragging(false);
		if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
			setSelectedFiles(Array.from(e.dataTransfer.files));
		}
	};
	const onFileSelect = (e) => {
		if (e.target.files && e.target.files.length > 0) {
			setSelectedFiles(Array.from(e.target.files));
		}
	};
	const removeSelectedFile = (index) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
	};

	// ---- Image Actions ----
	const handleUpload = async () => {
		if (selectedFiles.length === 0 || !currentFolder) return;
		setUploading(true);
		try {
			await uploadMultipleImagesR2(selectedFiles, currentFolder);
			Swal.fire({
				icon: "success",
				title: "Thành công!",
				text: `Đã tải lên ${selectedFiles.length} ảnh.`,
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
			
			setSelectedFiles([]);
			if (fileInputRef.current) fileInputRef.current.value = "";
			loadImages();
			loadBucketStatsData();
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi tải lên",
				text: err.message || "Đã có lỗi xảy ra.",
				confirmButtonColor: "var(--color-primary-500)",
			});
		} finally {
			setUploading(false);
		}
	};

	const handleDeleteImage = async (key) => {
		const result = await Swal.fire({
			title: "Xóa ảnh?",
			text: "Ảnh sẽ bị xóa vĩnh viễn khỏi Cloudflare R2.",
			icon: "warning",
			showCancelButton: true,
			confirmButtonColor: "var(--color-danger-500)",
			cancelButtonColor: "var(--color-text-secondary)",
			confirmButtonText: "Xóa ngay",
			cancelButtonText: "Hủy",
			background: "var(--color-surface-bg)",
			color: "var(--color-text-primary)",
		});

		if (!result.isConfirmed) return;

		try {
			await deleteImageR2(key);
			setImages((prev) => prev.filter((img) => img.key !== key));
			loadBucketStatsData();
			
			Swal.fire({
				icon: "success",
				title: "Đã xóa",
				timer: 1500,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: "Không thể xóa ảnh.",
				confirmButtonColor: "var(--color-primary-500)",
			});
		}
	};

	const handleUpdateChange = async (e) => {
		const file = e.target.files[0];
		if (!file || !updatingKey) return;
		setUploading(true);
		try {
			await updateImageR2(file, updatingKey);
			
			Swal.fire({
				icon: "success",
				title: "Đã cập nhật!",
				text: "Ảnh đã được thay thế.",
				timer: 2000,
				showConfirmButton: false,
				toast: true,
				position: "top-end",
			});
			
			loadImages();
		} catch (err) {
			Swal.fire({
				icon: "error",
				title: "Lỗi",
				text: "Không thể cập nhật ảnh.",
				confirmButtonColor: "var(--color-primary-500)",
			});
		} finally {
			setUploading(false);
			setUpdatingKey(null);
			e.target.value = null;
		}
	};

	const copyUrl = (url) => {
		navigator.clipboard.writeText(url);
		Swal.fire({
			icon: "success",
			title: "Đã chép Link!",
			timer: 1000,
			showConfirmButton: false,
			toast: true,
			position: "top-end",
		});
	};

	const getGridColsClass = (zoom) => {
		switch (zoom) {
			case 1: return "grid-cols-5 sm:grid-cols-7 md:grid-cols-9 lg:grid-cols-11 gap-2";
			case 2: return "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3";
			case 3: return "grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4";
			case 4: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5";
			case 5: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6";
			default: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
		}
	};

	return (
		<div className="flex flex-col h-full bg-page-bg text-text-primary">
			{/* HEADER: Breadcrumbs & Search */}
			<header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
				<div className="flex items-center gap-3">
					{currentFolder && (
						<button 
							onClick={() => navigate("/admin/images")}
							className="p-2 rounded-xl bg-surface-bg border border-border text-text-secondary hover:text-primary-500 transition-all shadow-sm"
						>
							<ArrowLeft size={18} />
						</button>
					)}
					<div className="flex flex-col">
						<div className="flex items-center gap-1.5 text-text-secondary text-xs font-medium mb-0.5">
							<span className="hover:text-primary-500 cursor-pointer" onClick={() => navigate("/admin")}>Admin</span>
							<ChevronRight size={12} />
							<span className="hover:text-primary-500 cursor-pointer" onClick={() => navigate("/admin/images")}>Images</span>
							{currentFolder && (
								<>
									<ChevronRight size={12} />
									<span className="text-primary-500 font-bold">{currentFolder}</span>
								</>
							)}
						</div>
						<h1 className="text-2xl font-bold tracking-tight">{currentFolder || "Thư Viện Ảnh R2"}</h1>
					</div>
				</div>

				<div className="flex items-center gap-3 w-full md:w-auto">
					<div className="relative flex-1 md:w-72">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={16} />
						<input
							type="text"
							placeholder={currentFolder ? "Tìm trong thư mục..." : "Tìm thư mục..."}
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full pl-9 pr-4 py-2 bg-surface-bg border border-border rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all"
						/>
					</div>
					<Button 
						variant="primary" 
						size="md" 
						onClick={currentFolder ? () => fileInputRef.current?.click() : handleCreateFolder}
						iconLeft={currentFolder ? <UploadCloud size={18} /> : <FolderPlus size={18} />}
						className="shadow-lg shadow-primary-500/20 whitespace-nowrap"
					>
						{currentFolder ? "Upload" : "Tạo Thư Mục"}
					</Button>
				</div>
			</header>

			{/* STATS & TOOLS BAR */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				{/* Storage Card */}
				<div className="bg-surface-bg border border-border rounded-2xl p-4 shadow-sm flex items-center gap-4">
					<div className="p-3 rounded-xl bg-primary-500/10 text-primary-500">
						<HardDrive size={24} />
					</div>
					<div className="flex-1">
						<p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Lưu trữ R2</p>
						<p className="text-lg font-bold">{formatBytes(bucketStats.totalSize)} / 10 GB</p>
						<div className="w-full bg-page-bg h-1 rounded-full mt-2 overflow-hidden">
							<div 
								className="bg-primary-500 h-full rounded-full transition-all duration-1000" 
								style={{ width: `${Math.min(100, (bucketStats.totalSize / (10 * 1024 * 1024 * 1024)) * 100)}%` }}
							></div>
						</div>
					</div>
				</div>

				{/* Files Card */}
				<div className="bg-surface-bg border border-border rounded-2xl p-4 shadow-sm flex items-center gap-4">
					<div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
						<ImageIcon size={24} />
					</div>
					<div>
						<p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Tổng tệp tin</p>
						<p className="text-lg font-bold">{bucketStats.totalFiles.toLocaleString()}</p>
					</div>
				</div>

				{/* Folder Info Card (Current) */}
				{currentFolder ? (
					<div className="md:col-span-2 bg-surface-bg border border-border rounded-2xl p-4 shadow-sm flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
								<Folder size={24} />
							</div>
							<div>
								<p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider">Thư mục hiện tại</p>
								<div className="flex items-center gap-2">
									<p className="text-lg font-bold text-primary-500">{currentFolder}</p>
									<span className="text-xs text-text-secondary">({images.length} tệp • {formatBytes(currentFolderSize)})</span>
								</div>
							</div>
						</div>
						<button 
							onClick={handleDeleteFolder}
							className="p-2 text-danger-500 hover:bg-danger-500/10 rounded-xl transition-all"
							title="Xóa thư mục"
						>
							<FolderMinus size={20} />
						</button>
					</div>
				) : (
					<div className="md:col-span-2 flex items-center justify-end gap-2 px-2">
						<button onClick={loadFolders} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-text-secondary hover:text-primary-500 transition-all">
							<RefreshCw size={16} className={statsLoading ? "animate-spin" : ""} /> Làm mới danh sách
						</button>
					</div>
				)}
			</div>

			{/* CONTENT AREA */}
			<div className="flex-1 min-h-0">
				{currentFolder && (
					<div className="flex items-center justify-between mb-4">
						<div className="flex items-center gap-3">
							<div className="flex items-center bg-surface-bg border border-border p-1 rounded-xl shadow-sm">
								<button
									onClick={() => setViewMode("grid")}
									className={`p-1.5 rounded-lg transition-all ${viewMode === "grid" ? "bg-primary-500 text-white" : "text-text-secondary hover:bg-surface-hover"}`}
								>
									<LayoutGrid size={18} />
								</button>
								<button
									onClick={() => setViewMode("list")}
									className={`p-1.5 rounded-lg transition-all ${viewMode === "list" ? "bg-primary-500 text-white" : "text-text-secondary hover:bg-surface-hover"}`}
								>
									<ListIcon size={18} />
								</button>
							</div>
							{viewMode === "grid" && (
								<div className="flex items-center gap-3 px-3 py-1.5 bg-surface-bg border border-border rounded-xl">
									<ZoomOut size={14} className="text-text-secondary" />
									<input
										type="range"
										min="1" max="5" step="1"
										value={zoomLevel}
										onChange={(e) => setZoomLevel(parseInt(e.target.value))}
										className="w-24 accent-primary-500 cursor-pointer"
									/>
									<ZoomIn size={14} className="text-text-secondary" />
								</div>
							)}
						</div>
					</div>
				)}

				<div 
					className={`h-full overflow-y-auto-scrollbar pb-10 ${isDragging ? "ring-2 ring-primary-500 ring-inset bg-primary-500/5" : ""}`}
					onDragOver={currentFolder ? onDragOver : null}
					onDragLeave={currentFolder ? onDragLeave : null}
					onDrop={currentFolder ? onDrop : null}
				>
					{loading ? (
						<div className="h-64 flex items-center justify-center">
							<LoadingState text="Đang truy xuất dữ liệu..." />
						</div>
					) : !currentFolder ? (
						/* FOLDER GRID VIEW (ROOT) */
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 animate-in fade-in slide-in-from-bottom-4">
							{folders.filter(f => f.toLowerCase().includes(searchTerm.toLowerCase())).map(f => (
								<div 
									key={f}
									onClick={() => navigate(`/admin/images/${f}`)}
									className="group bg-surface-bg border border-border rounded-2xl p-6 cursor-pointer hover:border-primary-500/50 hover:shadow-xl hover:shadow-primary-500/5 transition-all relative overflow-hidden"
								>
									<div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full -mr-8 -mt-8 group-hover:scale-150 transition-transform duration-500"></div>
									<div className="relative z-10 flex flex-col items-center text-center">
										<div className="w-16 h-16 rounded-2xl bg-primary-500/10 text-primary-500 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:bg-primary-500 group-hover:text-white transition-all duration-300">
											<Folder size={32} />
										</div>
										<h3 className="font-bold text-lg mb-1 group-hover:text-primary-500 transition-colors">{f}</h3>
										<p className="text-xs text-text-secondary font-medium">Bấm để quản lý</p>
									</div>
								</div>
							))}
							<div 
								onClick={handleCreateFolder}
								className="bg-page-bg border-2 border-dashed border-border rounded-2xl p-6 cursor-pointer hover:border-primary-500/50 hover:bg-primary-500/5 transition-all flex flex-col items-center justify-center text-text-secondary hover:text-primary-500"
							>
								<FolderPlus size={32} className="mb-2" />
								<span className="font-bold">Tạo thư mục mới</span>
							</div>
						</div>
					) : filteredImages.length === 0 ? (
						/* EMPTY STATE */
						<div className="h-96 flex flex-col items-center justify-center text-center gap-4 text-text-secondary">
							<div className="w-20 h-20 rounded-3xl bg-surface-bg border border-border flex items-center justify-center shadow-sm">
								<ImageIcon size={40} className="opacity-20" />
							</div>
							<div>
								<p className="text-lg font-bold text-text-primary">Thư mục trống</p>
								<p className="text-sm">Thư mục này chưa có hình ảnh nào.</p>
								{selectedFiles.length === 0 && (
									<Button variant="outline" size="sm" className="mt-4" onClick={() => fileInputRef.current?.click()}>
										Tải ảnh lên ngay
									</Button>
								)}
							</div>
						</div>
					) : viewMode === "grid" ? (
						/* IMAGE GRID VIEW */
						<div className={`grid ${getGridColsClass(zoomLevel)} animate-in fade-in`}>
							{filteredImages.map((img) => (
								<div key={img.key} className="bg-surface-bg border border-border rounded-2xl overflow-hidden group relative hover:border-primary-500 hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-300">
									<div className="aspect-square bg-page-bg/50 flex items-center justify-center relative overflow-hidden">
										<img
											src={img.url}
											alt={img.key}
											className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
											loading="lazy"
										/>
										<div className="absolute inset-0 bg-primary-950/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2">
											<button onClick={() => copyUrl(img.url)} className="w-28 flex items-center justify-center gap-2 py-1.5 bg-white text-black rounded-lg text-[10px] font-bold hover:bg-primary-500 hover:text-white transition-all">
												<Copy size={12} /> Sao chép Link
											</button>
											<button onClick={() => { setUpdatingKey(img.key); updateFileInputRef.current.click(); }} className="w-28 flex items-center justify-center gap-2 py-1.5 bg-primary-500 text-white rounded-lg text-[10px] font-bold hover:bg-primary-600 transition-all">
												<Edit3 size={12} /> Thay thế
											</button>
											<button onClick={() => handleDeleteImage(img.key)} className="w-28 flex items-center justify-center gap-2 py-1.5 bg-danger-500/20 text-danger-500 border border-danger-500/50 rounded-lg text-[10px] font-bold hover:bg-danger-500 hover:text-white transition-all">
												<Trash2 size={12} /> Xóa ảnh
											</button>
										</div>
									</div>
									<div className="p-3 border-t border-border/50">
										<p className="text-[10px] font-bold truncate text-center mb-1" title={img.key.split("/").pop()}>
											{img.key.split("/").pop()}
										</p>
										<p className="text-[9px] text-text-secondary text-center font-medium">{formatBytes(img.size)}</p>
									</div>
								</div>
							))}
						</div>
					) : (
						/* LIST VIEW */
						<div className="bg-surface-bg border border-border rounded-2xl overflow-hidden shadow-sm">
							<table className="w-full text-left text-sm">
								<thead className="bg-page-bg/50 border-b border-border text-[10px] uppercase font-bold text-text-secondary tracking-wider">
									<tr>
										<th className="px-6 py-4">Xem trước</th>
										<th className="px-6 py-4">Tên tệp tin</th>
										<th className="px-6 py-4">Dung lượng</th>
										<th className="px-6 py-4 text-right">Hành động</th>
									</tr>
								</thead>
								<tbody className="divide-y divide-border/50">
									{filteredImages.map((img) => (
										<tr key={img.key} className="hover:bg-primary-500/[0.02] transition-colors group">
											<td className="px-6 py-3">
												<div className="w-10 h-10 rounded-lg bg-page-bg border border-border p-1">
													<img src={img.url} alt="" className="w-full h-full object-contain" />
												</div>
											</td>
											<td className="px-6 py-3">
												<div className="flex flex-col">
													<span className="font-bold text-text-primary text-xs">{img.key.split("/").pop()}</span>
													<span className="text-[10px] text-text-secondary truncate max-w-xs md:max-w-md">{img.url}</span>
												</div>
											</td>
											<td className="px-6 py-3 font-mono text-[10px] text-text-secondary">
												{formatBytes(img.size)}
											</td>
											<td className="px-6 py-3 text-right">
												<div className="flex items-center justify-end gap-1">
													<button onClick={() => copyUrl(img.url)} className="p-2 text-text-secondary hover:text-primary-500 hover:bg-primary-500/10 rounded-lg transition-all"><Copy size={14} /></button>
													<button onClick={() => { setUpdatingKey(img.key); updateFileInputRef.current.click(); }} className="p-2 text-text-secondary hover:text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-all"><Edit3 size={14} /></button>
													<button onClick={() => handleDeleteImage(img.key)} className="p-2 text-text-secondary hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-all"><Trash2 size={14} /></button>
												</div>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
				</div>
			</div>

			{/* UPLOAD FLOATING BAR */}
			{selectedFiles.length > 0 && (
				<div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4 animate-in slide-in-from-bottom-8">
					<div className="bg-surface-bg border border-primary-500/30 shadow-2xl shadow-primary-500/20 rounded-2xl p-4 backdrop-blur-xl">
						<div className="flex items-center justify-between gap-4">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center">
									<UploadCloud size={20} />
								</div>
								<div>
									<p className="text-sm font-bold">Sẵn sàng tải lên</p>
									<p className="text-xs text-text-secondary">
										Giới hạn: <span className="font-bold text-amber-500">Tối đa 20 ảnh / lần tải</span> • {currentFolder}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<button 
									onClick={() => setSelectedFiles([])}
									className="px-4 py-2 text-sm font-bold text-text-secondary hover:text-text-primary transition-all"
								>
									Hủy
								</button>
								<Button 
									variant="primary" 
									size="sm" 
									onClick={handleUpload}
									disabled={uploading}
								>
									{uploading ? "Đang tải..." : "Tải lên ngay"}
								</Button>
							</div>
						</div>
						<div className="mt-3 flex gap-1 overflow-x-auto pb-1-scrollbar">
							{selectedFiles.map((f, i) => (
								<div key={i} className="flex-shrink-0 px-2 py-1 bg-page-bg border border-border rounded-md text-[9px] font-medium flex items-center gap-1">
									<span className="truncate max-w-[80px]">{f.name}</span>
									<X size={10} className="cursor-pointer hover:text-danger-500" onClick={() => removeSelectedFile(i)} />
								</div>
							))}
						</div>
					</div>
				</div>
			)}

			{/* HIDDEN INPUTS */}
			<input type="file" multiple ref={fileInputRef} onChange={onFileSelect} className="hidden" accept="image/*" />
			<input type="file" ref={updateFileInputRef} onChange={handleUpdateChange} className="hidden" accept="image/*" />
		</div>
	);
});

export default ImageManager;
