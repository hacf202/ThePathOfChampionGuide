// src/components/build/BuildModal.jsx
import React, { useState, useEffect, useMemo, useContext, useRef } from "react";
import { AuthContext } from "../../context/AuthContext.jsx";
import Modal from "../common/modal";
import Button from "../common/button";
import { Star, Eye, EyeOff, ChevronDown, AlertCircle } from "lucide-react";
import SafeImage from "../common/SafeImage.jsx";

// === Searchable Dropdown Component ===
const SearchableDropdown = ({
	options,
	selectedValue,
	onChange,
	placeholder,
	disabled = false,
	loading = false,
	error = null,
	allowDuplicate = true,
	selectedValues = [],
}) => {
	const [isOpen, setIsOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const dropdownRef = useRef(null);

	const selectedOption = useMemo(
		() => options.find(opt => opt.name === selectedValue),
		[options, selectedValue],
	);

	const filteredOptions = useMemo(
		() =>
			options
				.filter(opt =>
					opt.name.toLowerCase().includes(searchTerm.toLowerCase()),
				)
				.filter(opt => {
					if (!allowDuplicate && selectedValues.includes(opt.name)) {
						return selectedValue === opt.name;
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
							alt={selectedOption.name}
							className='w-6 h-6 mr-2 rounded-full object-cover flex-shrink-0'
						/>
					)}
					<span
						className={`truncate ${selectedValue ? "text-text-primary" : "text-text-secondary"}`}
					>
						{loading ? "Đang tải..." : selectedValue || placeholder}
					</span>
				</div>
				<ChevronDown
					size={20}
					className={`text-text-secondary transition-transform ${isOpen ? "rotate-180" : ""}`}
				/>
			</button>

			{isOpen && (
				<div className='absolute left-0 right-0 top-full mt-1 bg-surface-bg border border-border rounded-md shadow-2xl max-h-60 overflow-hidden z-[100]'>
					<div className='p-2 sticky top-0 bg-surface-bg z-10 border-b border-border'>
						<input
							type='text'
							placeholder='Tìm kiếm...'
							className='w-full bg-surface-hover border border-border rounded-md p-2 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary-500'
							value={searchTerm}
							onChange={e => setSearchTerm(e.target.value)}
							autoFocus
						/>
					</div>
					<ul className='max-h-48 overflow-y-auto'>
						{filteredOptions.length > 0 ? (
							filteredOptions.map(opt => {
								const isDisabled =
									!allowDuplicate &&
									selectedValues.includes(opt.name) &&
									opt.name !== selectedValue;
								return (
									<li
										key={opt.name}
										onClick={() => !isDisabled && handleSelect(opt.name)}
										className={`p-2 flex items-center transition-colors ${
											isDisabled
												? "opacity-40 cursor-not-allowed"
												: "hover:bg-dropdown-item-hover-bg cursor-pointer"
										}`}
									>
										{opt.icon && (
											<SafeImage
												src={opt.icon}
												alt={opt.name}
												className='w-6 h-6 mr-2 rounded-full object-cover'
											/>
										)}
										<span className='truncate text-sm'>{opt.name}</span>
									</li>
								);
							})
						) : (
							<li className='p-2 text-text-secondary text-sm'>
								Không tìm thấy
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
}) => {
	const { token } = useContext(AuthContext);
	const isEditMode = !!initialData;
	const apiUrl = import.meta.env.VITE_API_URL;

	const [formData, setFormData] = useState(
		initialData || {
			championName: "",
			relicSet: [null, null, null],
			powers: [null, null, null, null, null, null],
			rune: [null],
			star: 3,
			description: "",
			display: true,
			regions: [],
		},
	);

	const [metadata, setMetadata] = useState({
		relics: [],
		powers: [],
		runes: [],
		champions: [],
	});
	const [loading, setLoading] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isOpen) return;
		const fetchMetadata = async () => {
			setLoading(true);
			try {
				// Ép lấy 1000 items để tránh lỗi phân trang làm mất ảnh
				const query = "?page=1&limit=1000";
				const [relRes, powRes, runRes, chaRes] = await Promise.all([
					fetch(`${apiUrl}/api/items${query}`), //
					fetch(`${apiUrl}/api/generalPowers${query}`), //
					fetch(`${apiUrl}/api/runes${query}`),
					fetch(`${apiUrl}/api/champions${query}`),
				]);

				const [rel, pow, run, cha] = await Promise.all([
					relRes.json(),
					powRes.json(),
					runRes.json(),
					chaRes.json(),
				]);

				setMetadata({
					relics: (rel.items || []).map(r => ({
						name: r.name,
						icon: r.assetAbsolutePath || r.iconAbsolutePath,
						stack: r.stack,
					})),
					powers: (pow.items || []).map(p => ({
						name: p.name,
						icon: p.assetAbsolutePath || p.iconAbsolutePath,
					})),
					runes: (run.items || []).map(r => ({
						name: r.name,
						icon: r.assetAbsolutePath || r.iconAbsolutePath,
					})),
					champions: (cha.items || []).map(c => ({
						name: c.name,
						icon: c.assets?.[0]?.avatar,
						regions: c.regions,
					})),
				});
			} catch (err) {
				console.error("Lỗi tải metadata:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchMetadata();
	}, [isOpen, apiUrl]);

	const selectedChampData = useMemo(
		() => metadata.champions.find(c => c.name === formData.championName),
		[metadata.champions, formData.championName],
	);

	const isHoaLinh = selectedChampData?.regions?.includes("Hoa Linh Lục Địa");

	const handleSubmit = async e => {
		e.preventDefault();
		if (
			!formData.championName ||
			formData.relicSet.filter(Boolean).length === 0
		)
			return;

		setSubmitting(true);
		try {
			const url = isEditMode
				? `${apiUrl}/api/builds/${initialData._id}`
				: `${apiUrl}/api/builds`;
			const res = await fetch(url, {
				method: isEditMode ? "PUT" : "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					...formData,
					relicSet: formData.relicSet.filter(Boolean),
					powers: formData.powers.filter(Boolean),
					rune: formData.rune.filter(Boolean),
				}),
			});

			if (res.ok) {
				const result = await res.json();
				onConfirm(result.build || result);
				onClose();
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
			title={isEditMode ? "Chỉnh sửa bộ cổ vật" : "Tạo bộ cổ vật mới"}
			maxWidth='max-w-3xl'
		>
			<form onSubmit={handleSubmit} className='space-y-5'>
				<div>
					<label className='block text-sm font-medium text-text-secondary mb-1'>
						Tướng:
					</label>
					<SearchableDropdown
						options={metadata.champions}
						selectedValue={formData.championName}
						onChange={v => {
							const c = metadata.champions.find(x => x.name === v);
							setFormData(p => ({
								...p,
								championName: v,
								regions: c?.regions || [],
							}));
							onChampionChange?.(v);
						}}
						placeholder='Chọn tướng...'
						loading={loading}
						disabled={isEditMode}
					/>
				</div>

				<div
					className={
						!formData.championName ? "opacity-50 pointer-events-none" : ""
					}
				>
					<div className='mb-4'>
						<label className='block text-sm font-medium text-text-secondary mb-2'>
							Cấp sao (Tối đa {maxStar}):
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

					<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
						{formData.relicSet.map((_, i) => (
							<SearchableDropdown
								key={`relic-${i}`}
								options={metadata.relics}
								selectedValue={formData.relicSet[i]}
								onChange={v => {
									const newSet = [...formData.relicSet];
									newSet[i] = v;
									setFormData(p => ({ ...p, relicSet: newSet }));
								}}
								placeholder={`Cổ vật ${i + 1}`}
								loading={loading}
								allowDuplicate={
									metadata.relics.find(r => r.name === formData.relicSet[i])
										?.stack !== "1"
								}
								selectedValues={formData.relicSet.filter((_, idx) => idx !== i)}
							/>
						))}
					</div>

					{isHoaLinh && (
						<div className='mt-4'>
							<label className='block text-sm font-medium text-text-secondary mb-2'>
								Ngọc Hoa Linh:
							</label>
							<SearchableDropdown
								options={metadata.runes}
								selectedValue={formData.rune[0]}
								onChange={v => setFormData(p => ({ ...p, rune: [v] }))}
								placeholder='Chọn ngọc...'
								loading={loading}
							/>
						</div>
					)}

					<div className='grid grid-cols-2 md:grid-cols-3 gap-4 mt-4'>
						{formData.powers.map((_, i) => (
							<SearchableDropdown
								key={`pow-${i}`}
								options={metadata.powers}
								selectedValue={formData.powers[i]}
								onChange={v => {
									const newP = [...formData.powers];
									newP[i] = v;
									setFormData(p => ({ ...p, powers: newP }));
								}}
								placeholder={`Sức mạnh ${i + 1}`}
								loading={loading}
								allowDuplicate={false}
								selectedValues={formData.powers.filter((_, idx) => idx !== i)}
							/>
						))}
					</div>

					<textarea
						className='w-full mt-4 p-3 bg-input-bg border border-input-border rounded-md text-sm'
						placeholder='Mô tả lối chơi...'
						value={formData.description}
						onChange={e =>
							setFormData(p => ({ ...p, description: e.target.value }))
						}
						rows={3}
					/>

					<div className='mt-4 flex items-center gap-4'>
						<button
							type='button'
							onClick={() => setFormData(p => ({ ...p, display: !p.display }))}
							className='flex items-center gap-2 px-4 py-2 border border-border rounded-md text-sm'
						>
							{formData.display ? <Eye size={18} /> : <EyeOff size={18} />}
							{formData.display ? "Công khai" : "Riêng tư"}
						</button>
					</div>
				</div>

				<Button
					type='submit'
					variant='primary'
					className='w-full py-3'
					disabled={submitting || !formData.championName}
				>
					{submitting
						? "Đang xử lý..."
						: isEditMode
							? "Cập nhật Build"
							: "Tạo Build"}
				</Button>
			</form>
		</Modal>
	);
};

export default BuildModal;
