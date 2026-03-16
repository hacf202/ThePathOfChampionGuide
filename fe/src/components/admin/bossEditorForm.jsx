// src/components/admin/bossEditorForm.jsx
import { useState, memo, useEffect, useMemo } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { Zap, PanelRightClose, PanelRightOpen, XCircle } from "lucide-react";
import { useTranslation } from "../../hooks/useTranslation";

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
		const { tDynamic } = useTranslation();

		useEffect(() => {
			if (item) {
				const cloned = JSON.parse(JSON.stringify(item));
				if (!cloned.translations)
					cloned.translations = { en: { bossName: "" } };
				if (!cloned.translations.en) cloned.translations.en = { bossName: "" };
				setFormData(cloned);
			}
		}, [item]);

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
				const draggedData = JSON.parse(e.dataTransfer.getData("text/plain"));
				// Chỉ nhận type là 'power' (Ngăn kéo thả nhầm Item/Boss vào đây)
				if (draggedData.type === "power") {
					const uniqueId = draggedData.id || draggedData.name;
					if (uniqueId) {
						setFormData(prev => ({ ...prev, power: uniqueId }));
					}
				} else {
					alert("Vui lòng chỉ kéo thả Sức mạnh (Power) vào ô này!");
				}
			} catch (err) {
				console.warn("Dữ liệu kéo thả không hợp lệ");
			}
		};

		const handleSubmit = e => {
			e.preventDefault();
			onSave(formData);
		};

		// 🟢 Logic tra cứu Sức mạnh từ ID để hiển thị Tên & Icon
		const selectedPower = useMemo(() => {
			if (!formData.power || !cachedData?.powers) return null;

			// console.log("ID đang tìm:", formData.power); // Bạn có thể bật log này để debug

			return cachedData.powers.find(
				p =>
					p.powerCode === formData.power ||
					p.powerID === formData.power || // 🟢 Bổ sung thêm powerID
					p.bossID === formData.power || // 🟢 Bổ sung thêm bossID (nếu power là boss)
					p._id === formData.power ||
					p.id === formData.power ||
					p.name === formData.power,
			);
		}, [formData.power, cachedData?.powers]);

		// Kiểm tra xem có map thành công không
		const isPowerResolved = !!selectedPower;

		// Ưu tiên hiển thị Tên đa ngôn ngữ nếu tìm thấy, nếu không thì hiển thị ID gốc
		const displayPowerName = isPowerResolved
			? tDynamic(selectedPower, "name")
			: formData.power || "";

		// Lấy icon (Hỗ trợ nhiều chuẩn key khác nhau từ DB)
		const powerIcon = selectedPower
			? selectedPower.assetAbsolutePath ||
				selectedPower.image ||
				selectedPower.avatar ||
				selectedPower.assets?.[0]?.avatar
			: null;

		return (
			<form onSubmit={handleSubmit} className='space-y-6'>
				<div className='flex justify-between items-center border-b border-border p-4 sticky top-0 bg-surface-bg z-20'>
					<h2 className='text-xl font-bold'>
						{formData.isNew ? "Tạo Boss Mới" : `Biên tập: ${formData.bossName}`}
					</h2>
					<div className='flex items-center gap-3'>
						{/* 🟢 Nút Ẩn/Hiện Panel kéo thả */}
						{onToggleDragPanel && (
							<Button
								type='button'
								variant='outline'
								onClick={onToggleDragPanel}
								title={
									isDragPanelOpen ? "Ẩn thanh kéo thả" : "Hiện thanh kéo thả"
								}
								className='mr-2'
							>
								{isDragPanelOpen ? (
									<PanelRightClose size={18} />
								) : (
									<PanelRightOpen size={18} />
								)}
							</Button>
						)}
						<Button
							type='button'
							variant='ghost'
							onClick={onCancel}
							disabled={isSaving}
						>
							Hủy
						</Button>
						{!formData.isNew && (
							<Button
								type='button'
								variant='danger'
								onClick={() => onDelete(formData.bossID)}
								disabled={isSaving}
							>
								Xóa
							</Button>
						)}
						<Button
							type='submit'
							variant='primary'
							disabled={isSaving || !formData.bossID}
						>
							{isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
						</Button>
					</div>
				</div>

				<div className='grid grid-cols-1 md:grid-cols-2 gap-6 p-6'>
					<div className='space-y-4'>
						<InputField
							label='Boss ID'
							name='bossID'
							value={formData.bossID || ""}
							onChange={handleChange}
							required
							disabled={!formData.isNew}
						/>
						<InputField
							label='Tên Boss (VI)'
							name='bossName'
							value={formData.bossName || ""}
							onChange={handleChange}
							required
						/>
						<InputField
							label='Tên Boss (EN)'
							value={formData.translations?.en?.bossName || ""}
							onChange={e =>
								setFormData(p => ({
									...p,
									translations: { en: { bossName: e.target.value } },
								}))
							}
						/>

						{/* 🟢 Khu vực Sức Mạnh Boss với Giao Diện Trực Quan */}
						<div className='flex flex-col gap-2'>
							<div className='flex items-center gap-2'>
								<Zap size={16} className='text-primary-500' />
								<label className='text-[10px] font-bold uppercase tracking-widest text-text-secondary'>
									Mã Sức mạnh (Power ID)
								</label>
							</div>

							<div
								className={`flex items-center gap-3 p-2 bg-surface-hover/30 rounded-xl border-2 border-dashed ${isPowerResolved ? "border-primary-500/50" : "border-border hover:border-primary-500"} transition-all`}
								onDrop={handleDropPower}
								onDragOver={handleDragOver}
							>
								{/* Khung Icon */}
								<div className='w-10 h-10 rounded-lg bg-white border border-border flex items-center justify-center overflow-hidden shrink-0 shadow-sm'>
									{powerIcon ? (
										<img
											src={powerIcon}
											alt='icon'
											className='w-full h-full object-contain p-0.5'
										/>
									) : (
										<span className='text-xs font-bold text-gray-400'>?</span>
									)}
								</div>

								{/* Ô Input hiển thị Tên thay vì ID */}
								<InputField
									name='power'
									value={displayPowerName}
									onChange={handleChange} // Vẫn cho phép nhập tay nếu chưa map được
									placeholder='Nhập ID hoặc kéo thả Power vào đây...'
									className={`flex-1 font-mono text-sm ${isPowerResolved ? "font-bold text-primary-500 bg-surface-bg cursor-not-allowed" : ""}`}
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

					<div className='space-y-4 flex flex-col items-center'>
						<p className='font-bold self-start'>Ảnh Background Boss</p>
						{formData.background ? (
							<img
								src={formData.background}
								alt='Bg'
								className='w-full max-w-[250px] object-cover rounded-lg shadow-md border border-border'
							/>
						) : (
							<div className='w-full max-w-[250px] aspect-video bg-surface-hover rounded-lg flex items-center justify-center text-gray-500 border border-dashed border-border'>
								Chưa có ảnh
							</div>
						)}
						<InputField
							label='URL Hình ảnh'
							name='background'
							value={formData.background || ""}
							onChange={handleChange}
							className='w-full'
						/>
					</div>
				</div>
			</form>
		);
	},
);

export default BossEditorForm;
