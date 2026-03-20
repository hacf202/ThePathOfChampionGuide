import { useState, memo, useEffect } from "react";
import InputField from "../../common/inputField";
import { Zap, XCircle } from "lucide-react";
import { useTranslation } from "../../../hooks/useTranslation";

// IMPORT CÁC COMPONENT CHUNG
import EditorHeaderToolbar from "../common/editorHeaderToolbar";
import ImagePreviewBox from "../common/imagePreviewBox";

const BossEditorForm = memo(
	({
		item,
		cachedData = {},
		onSave,
		onCancel,
		onDelete,
		isSaving,
		isDragPanelOpen,
		onToggleDragPanel,
	}) => {
		const [formData, setFormData] = useState({});
		const [initialData, setInitialData] = useState({});
		const [isDirty, setIsDirty] = useState(false);
		const { tDynamic } = useTranslation();

		useEffect(() => {
			if (item) {
				const cloned = JSON.parse(JSON.stringify(item));
				if (!cloned.translations)
					cloned.translations = { en: { bossName: "" } };
				if (!cloned.translations.en) cloned.translations.en = { bossName: "" };

				// Đảm bảo power luôn là một mảng để hỗ trợ tương thích ngược với dữ liệu cũ
				if (!Array.isArray(cloned.power)) {
					cloned.power = cloned.power ? [cloned.power] : [];
				}

				setFormData(cloned);
				setInitialData(JSON.parse(JSON.stringify(cloned)));
				setIsDirty(false);
			}
		}, [item]);

		useEffect(() => {
			setIsDirty(JSON.stringify(formData) !== JSON.stringify(initialData));
		}, [formData, initialData]);

		// Chặn trình duyệt khi có thay đổi chưa lưu
		useEffect(() => {
			const handleBeforeUnload = e => {
				if (isDirty) {
					e.preventDefault();
					e.returnValue = "";
				}
			};
			window.addEventListener("beforeunload", handleBeforeUnload);
			return () =>
				window.removeEventListener("beforeunload", handleBeforeUnload);
		}, [isDirty]);

		const handleChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleDragOver = e => {
			e.preventDefault();
		};

		const handleDropPower = e => {
			e.preventDefault();
			try {
				let droppedData = e.dataTransfer.getData("text/plain");
				let draggedObj = null;

				// Bóc tách JSON nếu sidebar truyền JSON
				try {
					draggedObj = JSON.parse(droppedData);
				} catch (err) {
					// Text thuần
				}

				const uniqueId = draggedObj?.id || droppedData;
				const type = draggedObj?.type || "power"; // Mặc định là power nếu drop từ nguồn khác

				// Chỉ nhận type là 'power'
				if (type === "power" && uniqueId) {
					setFormData(prev => {
						const currentPowers = Array.isArray(prev.power) ? prev.power : [];

						// Kiểm tra xem sức mạnh đã tồn tại trong mảng chưa
						if (currentPowers.includes(uniqueId)) {
							alert("Sức mạnh này đã được thêm!");
							return prev;
						}

						// Thêm sức mạnh mới vào mảng
						return { ...prev, power: [...currentPowers, uniqueId] };
					});
				} else {
					alert("Vui lòng chỉ kéo thả Sức mạnh (Power) vào ô này!");
				}
			} catch (error) {
				console.error("Lỗi khi kéo thả:", error);
			}
		};

		const handleRemovePower = powerIdToRemove => {
			setFormData(prev => ({
				...prev,
				power: (prev.power || []).filter(pId => pId !== powerIdToRemove),
			}));
		};

		const handleTranslationChange = (e, lang) => {
			const { name, value } = e.target;
			setFormData(prev => ({
				...prev,
				translations: {
					...prev.translations,
					[lang]: {
						...prev.translations[lang],
						[name]: value,
					},
				},
			}));
		};

		const handleSubmit = e => {
			e.preventDefault();
			if (!formData.bossID?.trim()) {
				alert("Vui lòng nhập Boss ID!");
				return;
			}
			onSave(formData);
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-6 pb-24'>
				{/* ÁP DỤNG TOOLBAR QUẢN LÝ CHUNG */}
				<EditorHeaderToolbar
					title={
						formData.isNew
							? "Tạo Boss mới"
							: `Sửa Boss: ${formData.bossName || ""}`
					}
					isNew={formData.isNew}
					isDirty={isDirty}
					isSaving={isSaving}
					onCancel={onCancel}
					onDelete={() => onDelete(formData.bossID)}
					itemName={formData.bossName}
					disableSave={!formData.bossID}
					isSidebarOpen={isDragPanelOpen}
					onToggleSidebar={onToggleDragPanel} // Bật tính năng Toggle Sidebar kéo thả
				/>

				<div className='grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 mx-4 bg-surface-bg border border-border rounded-xl shadow-sm'>
					{/* CỘT TRÁI */}
					<div className='space-y-6'>
						<div className='grid grid-cols-2 gap-4'>
							<InputField
								label='Mã Boss (ID)'
								name='bossID'
								value={formData.bossID || ""}
								onChange={handleChange}
								required
								disabled={!formData.isNew}
								placeholder='VD: B001'
							/>
						</div>

						{/* KHU VỰC NGÔN NGỮ */}
						<div className='space-y-4'>
							<div className='border border-border rounded-lg p-4 bg-surface-hover/20'>
								<h3 className='font-bold text-text-primary mb-3 pb-2 border-b border-border'>
									Tiếng Việt (Mặc định)
								</h3>
								<InputField
									label='Tên Boss'
									name='bossName'
									value={formData.bossName || ""}
									onChange={handleChange}
									required
									placeholder='Nhập tên Boss...'
								/>
							</div>

							<div className='border border-border rounded-lg p-4 bg-surface-hover/20'>
								<h3 className='font-bold text-blue-500 mb-3 pb-2 border-b border-border'>
									Tiếng Anh (Tùy chọn)
								</h3>
								<InputField
									label='Boss Name (EN)'
									name='bossName'
									value={formData.translations?.en?.bossName || ""}
									onChange={e => handleTranslationChange(e, "en")}
									placeholder='English Name...'
								/>
							</div>
						</div>

						{/* KHU VỰC KÉO THẢ SỨC MẠNH (POWER) - HỖ TRỢ NHIỀU POWER */}
						<div className='bg-yellow-500/5 dark:bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4'>
							<label className='font-bold text-yellow-600 dark:text-yellow-500 mb-3 flex items-center gap-2'>
								<Zap size={18} /> Danh sách Sức mạnh (Kéo thả từ bên phải)
							</label>

							<div
								onDragOver={handleDragOver}
								onDrop={handleDropPower}
								className={`flex flex-col gap-3 p-4 rounded-xl border-2 transition-all min-h-[120px] justify-center items-center ${
									formData.power && formData.power.length > 0
										? "border-yellow-500/50 bg-yellow-500/5"
										: "border-dashed border-border bg-surface-hover/50 hover:bg-surface-hover"
								}`}
							>
								{!formData.power || formData.power.length === 0 ? (
									<p className='text-text-secondary font-medium text-sm'>
										Kéo thả các Power vào khu vực này...
									</p>
								) : (
									<div className='w-full grid grid-cols-1 gap-3'>
										{formData.power.map((powerId, index) => {
											// Tìm thông tin power dựa trên powerId
											const foundPower = (cachedData.powers || []).find(
												p => p.powerCode === powerId,
											);

											const resolvedPowerName = foundPower
												? tDynamic(foundPower, "name")
												: powerId;

											const resolvedPowerIcon =
												foundPower?.assetAbsolutePath ||
												foundPower?.assetFullAbsolutePath;

											return (
												<div
													key={index}
													className='flex items-center gap-3 p-2.5 bg-surface-bg border border-border rounded-lg shadow-sm'
												>
													{/* Avatar Sức mạnh */}
													<div className='w-10 h-10 shrink-0 bg-surface-hover/50 border border-border rounded-md flex items-center justify-center overflow-hidden'>
														{resolvedPowerIcon ? (
															<img
																src={resolvedPowerIcon}
																className='w-8 h-8 object-contain'
																alt='power-icon'
															/>
														) : (
															<span className='text-[10px] font-bold text-gray-400'>
																D&D
															</span>
														)}
													</div>

													{/* Tên Sức mạnh */}
													<div className='flex-1 font-semibold text-text-primary truncate'>
														{resolvedPowerName}
														{!foundPower && (
															<span className='text-xs text-red-500 ml-2 font-normal'>
																(Chưa rõ ID)
															</span>
														)}
													</div>

													{/* Nút xóa */}
													<button
														type='button'
														onClick={() => handleRemovePower(powerId)}
														className='text-text-secondary hover:text-red-500 hover:bg-red-500/10 p-2 rounded-md transition-colors shrink-0'
														title='Xóa sức mạnh này'
													>
														<XCircle size={18} />
													</button>
												</div>
											);
										})}
									</div>
								)}
							</div>
						</div>
					</div>

					{/* CỘT PHẢI (HÌNH ẢNH BACKGROUND) */}
					<div className='space-y-4'>
						<ImagePreviewBox
							imageUrl={formData.background}
							label='Ảnh Background Boss'
							wrapperClassName='flex flex-col items-center bg-surface-hover/30 p-6 rounded-xl border border-dashed border-border'
							imageClassName='w-full max-w-[250px] object-cover rounded-xl shadow-md border-4 border-white dark:border-gray-800'
						/>

						<InputField
							label='URL Hình ảnh'
							name='background'
							value={formData.background || ""}
							onChange={handleChange}
							placeholder='https://...'
						/>
					</div>
				</div>
			</form>
		);
	},
);

export default BossEditorForm;
