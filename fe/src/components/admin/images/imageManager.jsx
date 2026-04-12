import React, { useState, useEffect, useRef, memo, useMemo } from "react";
import {
	getR2Folders,
	getImagesByFolder,
	uploadMultipleImagesR2,
	deleteImageR2,
	updateImageR2,
	createR2Folder,
	deleteR2Folder,
} from "../../../context/services/apiHelper";
import PageTitle from "../../common/pageTitle";
import Button from "../../common/button";
import { LoadingState } from "../common/stateDisplays";
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
	const [folders, setFolders] = useState([]);
	const [currentFolder, setCurrentFolder] = useState("");
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
	const loadFolders = async (selectLast = false) => {
		try {
			const data = await getR2Folders();
			const list = data.folders || [];
			setFolders(list);
			if (list.length > 0 && !currentFolder) {
				setCurrentFolder(list[0]);
			} else if (selectLast && list.length > 0) {
				setCurrentFolder(list[list.length - 1]);
			}
		} catch (err) {
			console.error("Lỗi tải thư mục", err);
		}
	};

	const loadBucketStats = async () => {
		setStatsLoading(true);
		try {
			const { getBucketStats } = await import("../../../context/services/apiHelper");
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
		loadBucketStats();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (currentFolder) {
			loadImages();
			setSelectedFiles([]); // Reset files when changing folder
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentFolder]);

	const loadImages = async () => {
		setLoading(true);
		try {
			const data = await getImagesByFolder(currentFolder);
			setImages(data.files || []);
		} catch (err) {
			alert("Lỗi tải ảnh");
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
		const name = prompt("Nhập tên thư mục mới (không dấu, không khoảng cách):");
		if (!name) return;
		try {
			await createR2Folder(name);
			// alert("Đã tạo thư mục!");
			await loadFolders(true);
		} catch (err) {
			alert(err.message);
		}
	};

	const handleDeleteFolder = async () => {
		if (!currentFolder) return;
		if (
			!window.confirm(
				`CẢNH BÁO: Bạn sẽ xóa toàn bộ thư mục "${currentFolder}" và TẤT CẢ ảnh bên trong. Tiếp tục?`
			)
		)
			return;

		try {
			setLoading(true);
			await deleteR2Folder(currentFolder);
			alert("Đã xóa thư mục!");
			setCurrentFolder("");
			await loadFolders();
		} catch (err) {
			alert("Lỗi khi xóa thư mục");
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
			setSelectedFiles([]);
			if (fileInputRef.current) fileInputRef.current.value = "";
			// alert("Upload thành công!");
			loadImages();
			loadBucketStats();
		} catch (err) {
			alert("Lỗi: " + err.message);
		} finally {
			setUploading(false);
		}
	};

	const handleDeleteImage = async (key) => {
		if (!window.confirm("Xóa ảnh này?")) return;
		try {
			await deleteImageR2(key);
			setImages((prev) => prev.filter((img) => img.key !== key));
			loadBucketStats();
		} catch (err) {
			alert("Lỗi xóa ảnh");
		}
	};

	const handleUpdateChange = async (e) => {
		const file = e.target.files[0];
		if (!file || !updatingKey) return;
		setUploading(true);
		try {
			await updateImageR2(file, updatingKey);
			alert("Cập nhật thành công!");
			loadImages();
		} catch (err) {
			alert("Lỗi cập nhật");
		} finally {
			setUploading(false);
			setUpdatingKey(null);
			e.target.value = null;
		}
	};

	const copyUrl = (url) => {
		navigator.clipboard.writeText(url);
	};

	// ---- Image Grid Zoom Classes ----
	const getGridColsClass = (zoom) => {
		switch (zoom) {
			case 1: // Rất nhỏ
				return "grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2";
			case 2: // Nhỏ
				return "grid-cols-3 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3";
			case 3: // Trung bình (Mặc định)
				return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
			case 4: // Lớn
				return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5";
			case 5: // Rất lớn
				return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";
			default:
				return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4";
		}
	};

	return (
		<div className="p-4 md:p-6 space-y-4 bg-page-bg h-full text-text-primary font-sans">
			<PageTitle title="Quản Lý Ảnh Cloudflare R2" />

			{/* TOOLBAR & CONTROLS */}
			<div className="flex flex-col lg:flex-row gap-6">
				{/* L Cột: Folder Select & Stats */}
				<div className="w-full lg:w-1/4 space-y-4">
					<div className="bg-surface-bg border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
						<div className="flex items-center justify-between">
							<span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
								<ImageIcon size={14} /> Thư Mục
							</span>
							<div className="flex items-center gap-3">
								<button
									type="button"
									onClick={handleCreateFolder}
									className="text-blue-500 hover:text-blue-400 p-1 rounded-md hover:bg-blue-500/10 transition-colors"
									title="Thêm thư mục"
								>
									<FolderPlus size={16} />
								</button>
								<button
									type="button"
									onClick={handleDeleteFolder}
									className="text-red-500 hover:text-red-400 p-1 rounded-md hover:bg-red-500/10 transition-colors"
									title="Xóa thư mục hiện tại"
								>
									<FolderMinus size={16} />
								</button>
							</div>
						</div>
						<select
							value={currentFolder}
							onChange={(e) => setCurrentFolder(e.target.value)}
							className="w-full bg-page-bg border border-border text-text-primary p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
						>
							{folders.map((f) => (
								<option key={f} value={f} style={{ backgroundColor: 'var(--color-dropdown-bg)', color: 'var(--color-dropdown-item-text)' }}>
									{f}
								</option>
							))}
						</select>
						{currentFolder && (
							<div className="space-y-1.5 mt-2 px-1">
								<div className="text-[10px] text-gray-500 flex justify-between uppercase">
									<span>Trong thư mục:</span>
									<span className="font-semibold text-text-primary">
										{images.length} ảnh
									</span>
								</div>
								<div className="text-[10px] text-gray-500 flex justify-between uppercase">
									<span>Dung lượng:</span>
									<span className="font-semibold text-text-primary">
										{formatBytes(currentFolderSize)}
									</span>
								</div>
							</div>
						)}
					</div>

					{/* BUCKET STORAGE STATS CARD */}
					<div className="bg-surface-bg border border-border rounded-xl p-4 shadow-sm space-y-3">
						<span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
							<UploadCloud size={14} /> Hệ Thống Bucket
						</span>
						<div className="space-y-2">
							<div className="w-full bg-page-bg/50 h-1.5 rounded-full overflow-hidden">
								<div
									className="bg-blue-500 h-full rounded-full transition-all duration-500"
									style={{
										width: `${Math.min(100, (bucketStats.totalSize / (1024 * 1024 * 1024)) * 100)}%`,
									}}
								></div>
							</div>
							<div className="flex flex-col gap-1">
								<div className="flex justify-between text-[11px]">
									<span className="text-gray-500">Tổng lưu trữ:</span>
									<span className="font-bold text-text-primary">
										{formatBytes(bucketStats.totalSize)}
									</span>
								</div>
								<div className="flex justify-between text-[11px]">
									<span className="text-gray-500">Số lượng tệp:</span>
									<span className="font-bold text-text-primary">
										{bucketStats.totalFiles.toLocaleString()}
									</span>
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* R Cột: Dropzone & Upload */}
				<div className="w-full lg:w-3/4">
					<div
						className={`relative w-full h-32 md:h-40 rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center transition-all bg-surface-bg/30
                 ${
										isDragging
											? "border-blue-500 bg-blue-500/5"
											: "border-border hover:border-gray-500 hover:bg-surface-bg/50"
									}
                 ${selectedFiles.length > 0 ? "pt-2" : ""}`}
						onDragOver={onDragOver}
						onDragLeave={onDragLeave}
						onDrop={onDrop}
					>
						{/* Background Icon */}
						{selectedFiles.length === 0 && (
							<UploadCloud
								className={`w-10 h-10 mb-2 transition-colors ${
									isDragging ? "text-blue-500" : "text-gray-400"
								}`}
							/>
						)}

						{selectedFiles.length === 0 ? (
							<>
								<h3 className="text-sm font-semibold text-text-primary mb-1 relative z-10">
									Kéo thả ảnh vào đây để tải lên thư mục{" "}
									<span className="text-blue-500">{currentFolder}</span>
								</h3>
								<p className="text-xs text-gray-500 mb-3 relative z-10">
									Hỗ trợ .PNG, .JPG, .WEBP
								</p>
								<Button
									variant="outline"
									size="sm"
									onClick={() => fileInputRef.current?.click()}
									className="relative z-10"
								>
									Chọn File từ máy
								</Button>
							</>
						) : (
							<div className="w-full h-full flex flex-col">
								<div className="flex justify-between items-center mb-3">
									<h4 className="text-sm font-medium text-text-primary flex items-center gap-2">
										<CheckCircle size={16} className="text-emerald-500" />
										Đã chọn {selectedFiles.length} file
									</h4>
									<div className="flex gap-2">
										<Button
											size="sm"
											variant="outline"
											onClick={() => setSelectedFiles([])}
											disabled={uploading}
										>
											Hủy
										</Button>
										<Button
											size="sm"
											onClick={handleUpload}
											disabled={uploading}
											iconLeft={!uploading && <UploadCloud size={16} />}
										>
											{uploading ? "Đang tải lên..." : "Tải lên ngay"}
										</Button>
									</div>
								</div>
								<div className="flex-1 overflow-y-auto w-full custom-scrollbar pr-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-left">
									{selectedFiles.map((f, i) => (
										<div
											key={i}
											className="flex items-center justify-between p-2 rounded bg-page-bg border border-border"
										>
											<div className="truncate text-xs flex-1 mr-2 text-text-primary">
												{f.name}
												<span className="text-gray-500 ml-2">
													({formatBytes(f.size)})
												</span>
											</div>
											<button
												onClick={() => removeSelectedFile(i)}
												disabled={uploading}
												className="text-gray-400 hover:text-red-500"
											>
												<X size={14} />
											</button>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Hidden Multiple File Input */}
						<input
							type="file"
							multiple
							ref={fileInputRef}
							onChange={onFileSelect}
							className="hidden"
							accept="image/*"
						/>
					</div>
				</div>
			</div>

			<hr className="border-t border-border/50" />

			{/* LIST CONTROLS (Search, Zoom & Layout Toggle) */}
			<div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-surface-bg p-3 rounded-xl border border-border shadow-sm">
				<div className="relative w-full md:w-80">
					<Search
						className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
						size={16}
					/>
					<input
						type="text"
						placeholder="Tìm kiếm ảnh theo tên..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="w-full pl-9 pr-4 py-2 bg-page-bg border border-border rounded-lg text-text-primary focus:ring-2 focus:ring-blue-500/50 outline-none text-sm transition-all"
					/>
				</div>

				<div className="flex items-center gap-4 w-full md:w-auto">
					{/* Zoom Controls (Only show in Grid View) */}
					{viewMode === "grid" && (
						<div className="flex items-center gap-2 px-3 py-1.5 bg-page-bg border border-border rounded-lg flex-1 md:flex-none justify-center">
							<button
								onClick={() => setZoomLevel((z) => Math.max(1, z - 1))}
								className="text-gray-400 hover:text-blue-500 transition-colors"
								title="Thu nhỏ"
							>
								<ZoomOut size={16} />
							</button>
							<input
								type="range"
								min="1"
								max="5"
								step="1"
								value={zoomLevel}
								onChange={(e) => setZoomLevel(parseInt(e.target.value))}
								className="w-20 sm:w-24 accent-blue-500 cursor-pointer"
								title="Điều chỉnh kích cỡ lưới"
							/>
							<button
								onClick={() => setZoomLevel((z) => Math.min(5, z + 1))}
								className="text-gray-400 hover:text-blue-500 transition-colors"
								title="Phóng to"
							>
								<ZoomIn size={16} />
							</button>
						</div>
					)}

					{/* View Mode Toggle */}
					<div className="flex items-center bg-page-bg border border-border p-1 rounded-lg">
						<button
							onClick={() => setViewMode("grid")}
							className={`p-1.5 rounded-md transition-all ${
								viewMode === "grid"
									? "bg-surface-bg text-blue-500 shadow-sm"
									: "text-gray-500 hover:text-text-primary"
							}`}
							title="Chế độ phân lưới"
						>
							<LayoutGrid size={18} />
						</button>
						<button
							onClick={() => setViewMode("list")}
							className={`p-1.5 rounded-md transition-all ${
								viewMode === "list"
									? "bg-surface-bg text-blue-500 shadow-sm"
									: "text-gray-500 hover:text-text-primary"
							}`}
							title="Chế độ danh sách"
						>
							<ListIcon size={18} />
						</button>
					</div>
				</div>
			</div>

			{/* Hidden Single File Input for Update */}
			<input
				type="file"
				ref={updateFileInputRef}
				onChange={handleUpdateChange}
				className="hidden"
				accept="image/*"
			/>

			{/* IMAGE DISPLAY */}
			{loading ? (
				<div className="py-20">
					<LoadingState text="Đang tải thư viện ảnh..." />
				</div>
			) : filteredImages.length === 0 ? (
				<div className="py-20 text-center text-gray-500 flex flex-col items-center gap-3">
					<ImageIcon size={40} className="text-gray-600/50" />
					<p>
						{searchTerm
							? "Không tìm thấy ảnh nào khớp với từ khóa."
							: "Thư mục này hiện tại đang trống."}
					</p>
				</div>
			) : viewMode === "grid" ? (
				/* ---- GRID VIEW ---- */
				<div className={`grid ${getGridColsClass(zoomLevel)}`}>
					{filteredImages.map((img) => (
						<div
							key={img.key}
							className="bg-surface-bg border border-border p-2 rounded-xl group relative hover:border-blue-500/50 hover:shadow-lg transition-all"
						>
							<div className="w-full aspect-square bg-page-bg rounded-lg flex items-center justify-center overflow-hidden relative">
								<img
									src={img.url}
									alt={img.key}
									className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
									loading="lazy"
								/>
								<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all duration-300 backdrop-blur-[2px]">
									<button
										onClick={() => copyUrl(img.url)}
										className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-md text-[11px] font-medium w-24 transition-colors"
									>
										<Copy size={12} /> Sao chép
									</button>
									<button
										onClick={() => {
											setUpdatingKey(img.key);
											updateFileInputRef.current.click();
										}}
										className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded-md text-[11px] font-medium w-24 transition-colors"
									>
										<Edit3 size={12} /> Thay thế
									</button>
									<button
										onClick={() => handleDeleteImage(img.key)}
										className="flex items-center justify-center gap-1.5 bg-red-600 hover:bg-red-500 text-white px-3 py-1.5 rounded-md text-[11px] font-medium w-24 transition-colors"
									>
										<Trash2 size={12} /> Xóa ảnh
									</button>
								</div>
							</div>
							<div className="mt-3 flex flex-col items-center">
								<p
									className="text-[11px] truncate text-gray-400 font-medium px-1 w-full text-center"
									title={img.key.split("/").pop()}
								>
									{img.key.split("/").pop()}
								</p>
								<span className="text-[9px] text-gray-500 mt-0.5">
									{formatBytes(img.size)}
								</span>
							</div>
						</div>
					))}
				</div>
			) : (
				/* ---- LIST VIEW ---- */
				<div className="bg-surface-bg border border-border rounded-xl overflow-hidden shadow-sm">
					<div className="overflow-x-auto">
						<table className="w-full text-left text-sm whitespace-nowrap">
							<thead className="bg-page-bg text-gray-400 border-b border-border text-xs uppercase">
								<tr>
									<th className="px-5 py-3 font-semibold">Hình Ảnh</th>
									<th className="px-5 py-3 font-semibold">Dung Lượng</th>
									<th className="px-5 py-3 font-semibold text-right">
										Hành Động
									</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-theme-border/50">
								{filteredImages.map((img) => (
									<tr
										key={img.key}
										className="hover:bg-page-bg/50 transition-colors"
									>
										<td className="px-5 py-2">
											<div className="w-12 h-12 rounded-lg bg-page-bg border border-border p-1 flex items-center justify-center">
												<img
													src={img.url}
													alt={img.key}
													className="max-h-full max-w-full object-contain"
													loading="lazy"
												/>
											</div>
										</td>
										<td className="px-5 py-2">
											<div className="flex flex-col">
												<span className="font-medium text-text-primary truncate max-w-[200px] md:max-w-md">
													{img.key.split("/").pop()}
												</span>
												<span className="text-[10px] text-gray-500 font-mono truncate max-w-[200px] md:max-w-md">
													{img.url}
												</span>
											</div>
										</td>
										<td className="px-5 py-2">
											<span className="text-xs text-gray-500">
												{formatBytes(img.size)}
											</span>
										</td>
										<td className="px-5 py-2 text-right space-x-2">
											<button
												onClick={() => copyUrl(img.url)}
												className="p-1.5 text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 rounded-md transition-colors"
												title="Copy URL"
											>
												<Copy size={16} />
											</button>
											<button
												onClick={() => {
													setUpdatingKey(img.key);
													updateFileInputRef.current.click();
												}}
												className="p-1.5 text-gray-400 hover:text-emerald-500 hover:bg-emerald-500/10 rounded-md transition-colors"
												title="Replace Image"
											>
												<Edit3 size={16} />
											</button>
											<button
												onClick={() => handleDeleteImage(img.key)}
												className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
												title="Delete Image"
											>
												<Trash2 size={16} />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			)}
		</div>
	);
});

export default ImageManager;
