import { useState, memo, useEffect, useMemo } from "react";
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
		const { tDynamic, tUI } = useTranslation();

		useEffect(() => {
			if (item) {
				const cloned = JSON.parse(JSON.stringify(item));
				if (!cloned.translations)
					cloned.translations = { en: { bossName: "" } };
				if (!cloned.translations.en) cloned.translations.en = { bossName: "" };

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
					setFormData(prev => ({ ...prev, power: uniqueId }));
				} else {
					alert("Vui lòng chỉ kéo thả Sức mạnh (Power) vào ô này!");
				}
			} catch (error) {
				console.error("Lỗi khi kéo thả:", error);
			}
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

		// Mapping Power Name để hiển thị thay vì chỉ hiện ID
		const { isPowerResolved, resolvedPowerName, resolvedPowerIcon } =
			useMemo(() => {
				if (!formData.power)
					return { isPowerResolved: false, resolvedPowerName: "" };

				const foundPower = (cachedData.powers || []).find(
					p => p.powerCode === formData.power,
				);

				if (foundPower) {
					return {
						isPowerResolved: true,
						resolvedPowerName: tDynamic(foundPower, "name"),
						resolvedPowerIcon:
							foundPower.assetAbsolutePath || foundPower.assetFullAbsolutePath,
					};
				}

				return {
					isPowerResolved: false,
					resolvedPowerName: formData.power,
				};
			}, [formData.power, cachedData.powers, tDynamic]);

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

						{/* KHU VỰC KÉO THẢ SỨC MẠNH (POWER) */}
						<div className='bg-yellow-500/5 dark:bg-yellow-900/10 border border-yellow-500/20 rounded-xl p-4'>
							<label className='font-bold text-yellow-600 dark:text-yellow-500 mb-2 flex items-center gap-2'>
								<Zap size={18} /> Sức mạnh của Boss (Kéo thả từ bên phải)
							</label>

							<div
								onDragOver={handleDragOver}
								onDrop={handleDropPower}
								className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
									formData.power
										? "border-yellow-500/50 bg-yellow-500/10"
										: "border-dashed border-border bg-surface-hover/50 hover:bg-surface-hover"
								}`}
							>
								{/* Avatar Sức mạnh (Nếu có) */}
								<div className='w-12 h-12 shrink-0 bg-surface-bg border border-border rounded-lg flex items-center justify-center overflow-hidden'>
									{resolvedPowerIcon ? (
										<img
											src={resolvedPowerIcon}
											className='w-10 h-10 object-contain'
											alt='power-icon'
										/>
									) : (
										<span className='text-[10px] font-bold text-gray-400'>
											D&D
										</span>
									)}
								</div>

								{/* Tên / Input Sức mạnh */}
								<InputField
									label=''
									name='power'
									value={resolvedPowerName}
									onChange={e =>
										setFormData(prev => ({ ...prev, power: e.target.value }))
									}
									placeholder='Kéo thả Power vào đây...'
									className={`flex-1 m-0 ${
										isPowerResolved ? "font-bold text-yellow-600" : ""
									}`}
									readOnly={isPowerResolved} // Khóa Input nếu đã map thành công tên
									title={
										isPowerResolved
											? `ID đang lưu trong Database: ${formData.power}`
											: ""
									}
								/>

								{/* Nút xóa Sức mạnh hiện tại */}
								{formData.power && (
									<button
										type='button'
										onClick={() =>
											setFormData(prev => ({ ...prev, power: "" }))
										}
										className='text-text-secondary hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors shrink-0'
										title='Xóa sức mạnh này'
									>
										<XCircle size={20} />
									</button>
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
