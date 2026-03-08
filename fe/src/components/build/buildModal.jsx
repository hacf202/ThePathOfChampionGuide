// src/components/build/BuildModal.jsx
import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import { useTranslation } from "../../hooks/useTranslation.js"; // 🟢 Import Hook i18n
import Modal from "../common/modal";
import Button from "../common/button";
import { Star, Eye, EyeOff, ChevronDown, AlertCircle } from "lucide-react";
import SafeImage from "../common/SafeImage.jsx";

// === Searchable Dropdown Component (Giữ nguyên giao diện và CSS) ===
const SearchableDropdown = ({
	options,
	selectedValue, // 🟢 Sẽ là chuỗi ID/Code
	onChange,
	placeholder,
	disabled = false,
	loading = false,
	error = null,
	allowDuplicate = true,
	selectedValues = [],
}) => {
	const { language } = useTranslation();
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef(null);

	// Tìm Option dựa trên value (ID) thay vì name
	const selectedOption = useMemo(
		() => options.find(opt => opt.value === selectedValue),
		[options, selectedValue],
	);

	const filteredOptions = useMemo(
		() =>
			options
				.filter(
					opt =>
						opt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
						(opt.rawName &&
							opt.rawName.toLowerCase().includes(searchTerm.toLowerCase())),
				)
				.filter(opt => {
					if (!allowDuplicate && selectedValues.includes(opt.value)) {
						return selectedValue === opt.value;
					}
					return true;
				}),
		[options, searchTerm, allowDuplicate, selectedValues, selectedValue],
	);

	useEffect(() => {
		const handleClickOutside = e => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
				setIsOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const handleSelect = value => {
		if (
			!allowDuplicate &&
			selectedValues.includes(value) &&
			value !== selectedValue
		)
			return;
		onChange(value);
		setIsOpen(false);
		setSearchTerm("");
	};

	return (
		<div className='relative' ref={dropdownRef}>
			<button
				type='button'
				onClick={() => !disabled && !loading && setIsOpen(!isOpen)}
				disabled={disabled || loading}
				className={`w-full bg-input-bg border rounded-md p-2 flex justify-between items-center text-left transition-colors ${
					error
						? "border-danger-500"
						: "border-input-border hover:border-primary-500"
				} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
			>
				<div className='flex items-center truncate'>
					{selectedOption?.icon && (
						<SafeImage
							src={selectedOption.icon}
							alt={selectedOption.label}
							className='w-6 h-6 mr-2 rounded-full object-cover flex-shrink-0'
						/>
					)}
					<span
						className={`truncate ${selectedValue ? "text-text-primary" : "text-text-secondary"}`}
					>
						{loading
							? language === "vi"
								? "Đang tải..."
								: "Loading..."
							: selectedOption?.label || placeholder}
					</span>
				</div>
				<ChevronDown
					size={20}
					className={`text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className='absolute left-0 right-0 top-full mt-1 bg-surface-bg border border-border rounded-md shadow-xl max-h-60 overflow-hidden z-[100]'>
					<div className='p-2 sticky top-0 bg-surface-bg z-10 border-b border-border'>
						<input
							type='text'
							placeholder={language === "vi" ? "Tìm kiếm..." : "Search..."}
							className='w-full bg-surface-hover border border-border rounded-md p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>
					<ul className='max-h-48 overflow-y-auto custom-scrollbar'>
						{filteredOptions.length > 0 ? (
							filteredOptions.map(opt => {
								const isDisabled =
									!allowDuplicate &&
									selectedValues.includes(opt.value) &&
									opt.value !== selectedValue;
								return (
									<li
										key={opt.value}
										onClick={() => !isDisabled && handleSelect(opt.value)}
										className={`p-2 flex items-center transition-colors ${
											isDisabled
												? "opacity-40 cursor-not-allowed"
												: "hover:bg-dropdown-item-hover-bg cursor-pointer"
										}`}
									>
										{opt.icon && (
											<SafeImage
												src={opt.icon}
												alt={opt.label}
												className='w-6 h-6 mr-2 rounded-full object-cover'
											/>
										)}
										<span className='truncate text-sm'>{opt.label}</span>
									</li>
								);
							})
						) : (
							<li className='p-2 text-text-secondary text-sm italic'>
								{language === "vi" ? "Không tìm thấy" : "Not found"}
							</li>
						)}
					</ul>
				</div>
			)}
			{error && (
				<div className='mt-1 flex items-center gap-1 text-danger-500 text-xs'>
					<AlertCircle size={14} />
					{error}
				</div>
			)}
		</div>
	);
};

// === Main BuildModal Component ===
const BuildModal = ({
	isOpen,
	onClose,
	onConfirm,
	initialData = null,
	onChampionChange,
	maxStar = 7,
	championsList = [], // 🟢 Nhận Master Data từ props để tối ưu
	relicsList = [],
	powersList = [],
	runesList = [],
}) => {
	const { token } = useContext(AuthContext);
	const { language, t } = useTranslation(); // 🟢 Khởi tạo i18n
	const isEditMode = !!initialData;
	const apiUrl = import.meta.env.VITE_API_URL;

	// Chuẩn hóa trạng thái hiển thị
	const getInitialDisplay = () => {
		if (!initialData) return true;
		return initialData.display === true || initialData.display === "true";
	};

	// 🟢 Khởi tạo formData sử dụng mảng ID
	const [formData, setFormData] = useState({
		championName: initialData?.championName || "",
		relicSetIds: initialData?.relicSetIds || [null, null, null],
		powerIds: initialData?.powerIds || [null, null, null, null, null, null],
		runeIds: initialData?.runeIds || [null],
		star: initialData?.star || 3,
		description: initialData?.description || "",
		display: getInitialDisplay(),
		regions: initialData?.regions || [],
	});

	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	// 🟢 Mapper dữ liệu hiển thị (Dùng t() để dịch tên)
	const championOptions = useMemo(
		() =>
			championsList
				.map(c => ({
					value: c.name, // Logic DB cũ vẫn cần tên tướng làm định danh
					label: t(c, "name"),
					icon: c.assets?.[0]?.avatar,
					regions: c.regions,
					rawName: c.name,
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
		[championsList, t],
	);

	const relicOptions = useMemo(
		() =>
			relicsList
				.map(r => ({
					value: r.relicCode,
					label: t(r, "name"),
					icon: r.assetAbsolutePath,
					stack: r.stack,
					rawName: r.name,
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
		[relicsList, t],
	);

	const powerOptions = useMemo(
		() =>
			powersList
				.map(p => ({
					value: p.powerCode,
					label: t(p, "name"),
					icon: p.assetAbsolutePath,
					rawName: p.name,
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
		[powersList, t],
	);

	const runeOptions = useMemo(
		() =>
			runesList
				.map(r => ({
					value: r.runeCode,
					label: t(r, "name"),
					icon: r.assetAbsolutePath,
					rawName: r.name,
				}))
				.sort((a, b) => a.label.localeCompare(b.label)),
		[runesList, t],
	);

	const isHoaLinh = useMemo(
		() => formData.regions?.includes("Hoa Linh Lục Địa"),
		[formData.regions],
	);

	// Hàm kiểm tra logic
	const validate = () => {
		const newErrors = {};
		if (!formData.championName) {
			newErrors.championName =
				language === "vi"
					? "Vui lòng chọn tướng."
					: "Please select a champion.";
		}

		const activeRelics = formData.relicSetIds.filter(Boolean);
		if (activeRelics.length === 0) {
			newErrors.relicSet =
				language === "vi"
					? "Cần chọn ít nhất 1 cổ vật."
					: "Select at least 1 relic.";
		}

		// Kiểm tra trùng lặp cổ vật không được cộng dồn (stack=1)
		const relicErrors = [];
		formData.relicSetIds.forEach((id, index) => {
			if (id) {
				const relicInfo = relicOptions.find(r => r.value === id);
				if (relicInfo?.stack === "1" || relicInfo?.stack === 1) {
					const isDuplicate = formData.relicSetIds.some(
						(otherId, otherIdx) => otherId === id && otherIdx !== index,
					);
					if (isDuplicate) {
						relicErrors[index] =
							language === "vi"
								? "Không thể dùng trùng."
								: "Duplicate not allowed.";
					}
				}
			}
		});
		if (relicErrors.length > 0) newErrors.relicItems = relicErrors;

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!validate()) return;

		setSubmitting(true);
		try {
			const url = isEditMode
				? `${apiUrl}/api/builds/${initialData._id}`
				: `${apiUrl}/api/builds`;

			// 🟢 Payload gửi mảng ID sạch lên Backend
			const payload = {
				...formData,
				relicSetIds: formData.relicSetIds.filter(Boolean),
				powerIds: formData.powerIds.filter(Boolean),
				runeIds: formData.runeIds.filter(Boolean),
			};

			const res = await fetch(url, {
				method: isEditMode ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				const result = await res.json();
				onConfirm(result.build || result);
				onClose();
			} else {
				const errData = await res.json();
				throw new Error(errData.error || "Submit failed");
			}
		} catch (err) {
			console.error("Lỗi lưu build:", err);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Modal
			isOpen={isOpen}
			onClose={onClose}
			title={
				isEditMode
					? language === "vi"
						? "Chỉnh sửa bộ cổ vật"
						: "Edit Build"
					: language === "vi"
						? "Tạo bộ cổ vật mới"
						: "Create New Build"
			}
			maxWidth='max-w-3xl'
		>
			<form onSubmit={handleSubmit} className='space-y-5'>
				{/* Chọn Tướng */}
				<div>
					<label className='block text-sm font-medium text-text-secondary mb-1'>
						{language === "vi" ? "Tướng:" : "Champion:"}
					</label>
					<SearchableDropdown
						options={championOptions}
						selectedValue={formData.championName}
						onChange={v => {
							const c = championOptions.find(x => x.value === v);
							setFormData(p => ({
								...p,
								championName: v,
								regions: c?.regions || [],
							}));
							if (errors.championName)
								setErrors(prev => ({ ...prev, championName: null }));
							onChampionChange?.(v);
						}}
						placeholder={
							language === "vi" ? "Chọn tướng..." : "Select champion..."
						}
						loading={loading}
						disabled={isEditMode}
						error={errors.championName}
					/>
				</div>

				<div
					className={
						!formData.championName ? "opacity-50 pointer-events-none" : ""
					}
				>
					{/* Cấp sao */}
					<div className='mb-2'>
						<label className='block text-sm font-medium text-text-secondary mb-2'>
							{language === "vi"
								? `Cấp sao (Tối đa ${maxStar}):`
								: `Stars (Max ${maxStar}):`}
						</label>
						<div className='flex gap-1'>
							{Array.from({ length: maxStar }, (_, i) => i + 1).map(s => (
								<Star
									key={s}
									size={28}
									className={`cursor-pointer ${formData.star >= s ? "text-icon-star" : "text-border"}`}
									fill={formData.star >= s ? "currentColor" : "none"}
									onClick={() => setFormData(p => ({ ...p, star: s }))}
								/>
							))}
						</div>
					</div>

					{/* Cổ vật */}
					<label className='block text-sm font-medium text-text-secondary mb-2'>
						{language === "vi" ? "Cổ vật:" : "Relics:"}
						{errors.relicSet && (
							<span className='text-danger-500 ml-2 text-xs font-normal'>
								({errors.relicSet})
							</span>
						)}
					</label>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-2'>
						{formData.relicSetIds.map((_, i) => (
							<SearchableDropdown
								key={`relic-${i}`}
								options={relicOptions}
								selectedValue={formData.relicSetIds[i]}
								onChange={v => {
									const newSet = [...formData.relicSetIds];
									newSet[i] = v;
									setFormData(p => ({ ...p, relicSetIds: newSet }));
									setErrors(prev => ({
										...prev,
										relicSet: null,
										relicItems: null,
									}));
								}}
								placeholder={`${language === "vi" ? "Cổ vật" : "Relic"} ${i + 1}`}
								error={errors.relicItems?.[i]}
								allowDuplicate={
									relicOptions.find(r => r.value === formData.relicSetIds[i])
										?.stack !== "1"
								}
								selectedValues={formData.relicSetIds.filter(
									(_, idx) => idx !== i,
								)}
							/>
						))}
					</div>

					{/* Ngọc Hoa Linh */}
					{isHoaLinh && (
						<div className='mt-2'>
							<label className='block text-sm font-medium text-text-secondary mb-2'>
								{language === "vi" ? "Ngọc Hoa Linh:" : "Spirit Rune:"}
							</label>
							<SearchableDropdown
								options={runeOptions}
								selectedValue={formData.runeIds[0]}
								onChange={v => setFormData(p => ({ ...p, runeIds: [v] }))}
								placeholder={
									language === "vi" ? "Chọn ngọc..." : "Select rune..."
								}
							/>
						</div>
					)}

					{/* Sức mạnh */}
					<label className='block text-sm font-medium text-text-secondary my-2'>
						{language === "vi"
							? "Sức mạnh khuyên dùng:"
							: "Recommended powers:"}
					</label>
					<div className='grid grid-cols-2 md:grid-cols-3 gap-4'>
						{formData.powerIds.map((_, i) => (
							<SearchableDropdown
								key={`pow-${i}`}
								options={powerOptions}
								selectedValue={formData.powerIds[i]}
								onChange={v => {
									const newP = [...formData.powerIds];
									newP[i] = v;
									setFormData(p => ({ ...p, powerIds: newP }));
								}}
								placeholder={`${language === "vi" ? "Sức mạnh" : "Power"} ${i + 1}`}
								allowDuplicate={false}
								selectedValues={formData.powerIds.filter((_, idx) => idx !== i)}
							/>
						))}
					</div>

					{/* Mô tả */}
					<textarea
						className='w-full mt-4 p-3 bg-input-bg border border-input-border rounded-md text-sm text-text-primary focus:outline-none focus:border-primary-500'
						placeholder={
							language === "vi"
								? "Mô tả lối chơi..."
								: "Gameplay description..."
						}
						value={formData.description}
						onChange={e =>
							setFormData(p => ({ ...p, description: e.target.value }))
						}
						rows={3}
					/>

					{/* Trạng thái hiển thị */}
					<div className='mt-4 flex items-center gap-4'>
						<button
							type='button'
							onClick={() => setFormData(p => ({ ...p, display: !p.display }))}
							className='flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm hover:bg-surface-hover transition-colors text-text-primary'
						>
							{formData.display ? (
								<Eye size={18} className='text-success' />
							) : (
								<EyeOff size={18} className='text-danger-500' />
							)}
							{formData.display
								? language === "vi"
									? "Công khai"
									: "Public"
								: language === "vi"
									? "Riêng tư"
									: "Private"}
						</button>
					</div>
				</div>

				<Button
					type='submit'
					variant='primary'
					className='w-full py-3'
					disabled={submitting}
				>
					{submitting
						? language === "vi"
							? "Đang xử lý..."
							: "Processing..."
						: isEditMode
							? language === "vi"
								? "Cập nhật Build"
								: "Update Build"
							: language === "vi"
								? "Tạo Build"
								: "Create Build"}
				</Button>
			</form>
		</Modal>
	);
};

export default BuildModal;
