// ImageManager.jsx
import React, { useState, useEffect, useRef } from "react";
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

const ImageManager = () => {
	const [folders, setFolders] = useState([]);
	const [currentFolder, setCurrentFolder] = useState("");
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [selectedFiles, setSelectedFiles] = useState([]);

	const updateFileInputRef = useRef(null);
	const [updatingKey, setUpdatingKey] = useState(null);

	// Load danh sách folder
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

	useEffect(() => {
		loadFolders();
	}, []);

	useEffect(() => {
		if (currentFolder) loadImages();
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

	// --- Folder Actions ---
	const handleCreateFolder = async () => {
		const name = prompt("Nhập tên thư mục mới (không dấu, không khoảng cách):");
		if (!name) return;
		try {
			await createR2Folder(name);
			alert("Đã tạo thư mục!");
			await loadFolders(true);
		} catch (err) {
			alert(err.message);
		}
	};

	const handleDeleteFolder = async () => {
		if (!currentFolder) return;
		if (
			!window.confirm(
				`CẢNH BÁO: Bạn sẽ xóa toàn bộ thư mục "${currentFolder}" và TẤT CẢ ảnh bên trong. Tiếp tục?`,
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

	// --- Image Actions ---
	const handleUpload = async () => {
		if (selectedFiles.length === 0 || !currentFolder) return;
		setUploading(true);
		try {
			await uploadMultipleImagesR2(selectedFiles, currentFolder);
			setSelectedFiles([]);
			document.getElementById("main-upload-input").value = "";
			alert("Upload thành công!");
			loadImages();
		} catch (err) {
			alert("Lỗi: " + err.message);
		} finally {
			setUploading(false);
		}
	};

	const handleDeleteImage = async key => {
		if (!window.confirm("Xóa ảnh này?")) return;
		try {
			await deleteImageR2(key);
			setImages(prev => prev.filter(img => img.key !== key));
		} catch (err) {
			alert("Lỗi xóa ảnh");
		}
	};

	const handleUpdateChange = async e => {
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

	return (
		<div className='p-6 space-y-6 bg-theme-bg min-h-screen text-theme-text'>
			<PageTitle title='Quản Lý Cloudflare R2' />

			{/* Toolbar */}
			<div className='flex flex-wrap gap-4 p-5 bg-theme-card rounded-xl border border-theme-border items-end shadow-sm'>
				{/* Folder Select & Actions */}
				<div className='flex flex-col gap-2'>
					<label className='text-xs font-semibold text-gray-400 uppercase tracking-wider flex justify-between'>
						Thư mục
						<div className='space-x-2'>
							<button
								onClick={handleCreateFolder}
								className='text-blue-400 hover:underline'
							>
								{" "}
								+ Thêm
							</button>
							<button
								onClick={handleDeleteFolder}
								className='text-red-400 hover:underline'
							>
								{" "}
								x Xóa
							</button>
						</div>
					</label>
					<select
						value={currentFolder}
						onChange={e => setCurrentFolder(e.target.value)}
						className='bg-theme-bg border border-theme-border p-2.5 rounded-lg min-w-[200px]'
					>
						{folders.map(f => (
							<option key={f} value={f}>
								📁 {f}
							</option>
						))}
					</select>
				</div>

				{/* Upload Input */}
				<div className='flex flex-col gap-2'>
					<label className='text-xs font-semibold text-gray-400 uppercase tracking-wider'>
						Tải ảnh vào {currentFolder}
					</label>
					<input
						id='main-upload-input'
						type='file'
						multiple
						onChange={e => setSelectedFiles(e.target.files)}
						className='text-sm border border-theme-border p-2 rounded-lg bg-theme-bg'
					/>
				</div>

				<Button
					onClick={handleUpload}
					disabled={uploading || selectedFiles.length === 0}
					className='px-6 h-[42px]'
				>
					{uploading
						? "Đang xử lý..."
						: `Tải lên ${selectedFiles.length || ""} file`}
				</Button>
			</div>

			{/* Hidden Input for Update */}
			<input
				type='file'
				ref={updateFileInputRef}
				onChange={handleUpdateChange}
				className='hidden'
			/>

			{/* Grid ảnh */}
			{loading ? (
				<div className='text-center py-20 opacity-50'>Đang tải dữ liệu...</div>
			) : (
				<div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5'>
					{images.length === 0 ? (
						<div className='col-span-full text-center py-10 text-gray-500 border border-dashed border-theme-border rounded-lg'>
							Thư mục này chưa có ảnh.
						</div>
					) : (
						images.map(img => (
							<div
								key={img.key}
								className='bg-theme-card border border-theme-border p-3 rounded-xl group relative'
							>
								<div className='w-full aspect-square bg-black/10 rounded-lg flex items-center justify-center overflow-hidden'>
									<img
										src={img.url}
										alt=''
										className='max-h-full max-w-full object-contain'
									/>

									<div className='absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-all'>
										<button
											onClick={() => {
												navigator.clipboard.writeText(img.url);
												alert("Đã copy!");
											}}
											className='bg-blue-600 text-white px-3 py-1 rounded text-[11px] w-20'
										>
											URL
										</button>
										<button
											onClick={() => {
												setUpdatingKey(img.key);
												updateFileInputRef.current.click();
											}}
											className='bg-green-600 text-white px-3 py-1 rounded text-[11px] w-20'
										>
											Sửa
										</button>
										<button
											onClick={() => handleDeleteImage(img.key)}
											className='bg-red-600 text-white px-3 py-1 rounded text-[11px] w-20'
										>
											Xóa
										</button>
									</div>
								</div>
								<p className='mt-2 text-[10px] truncate text-gray-400'>
									{img.key.split("/").pop()}
								</p>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
};

export default ImageManager;
