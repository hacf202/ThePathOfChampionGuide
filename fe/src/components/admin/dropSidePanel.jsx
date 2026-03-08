// src/pages/admin/DropDragSidePanel.jsx
import { memo, useMemo, useState } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { Search, Package, Gem, Zap, Shield, Star, X, Info } from "lucide-react";
import { removeAccents } from "../../utils/vietnameseUtils";
import { useTranslation } from "../../hooks/useTranslation"; // IMPORT HOOK ĐA NGÔN NGỮ

// Hàm helper để lấy ID duy nhất dựa trên bất kỳ cấu trúc CSDL nào
const getUniqueId = item => {
	return (
		item._id ||
		item.id ||
		item.bonusStarID ||
		item.powerCode ||
		item.relicCode ||
		item.itemCode ||
		item.runeCode
	);
};

const DropDragItem = memo(({ item, type, setTooltipData }) => {
	const { tDynamic } = useTranslation();

	const handleDragStart = e => {
		const uniqueId = getUniqueId(item);
		// Truyền uniqueId thống nhất vào trường 'id' để dễ quản lý
		e.dataTransfer.setData(
			"text/plain",
			JSON.stringify({
				type: type,
				id: uniqueId,
				name: tDynamic(item, "name"), // Gửi tên theo ngôn ngữ đang hiển thị
			}),
		);
		e.dataTransfer.effectAllowed = "copy";

		// Ẩn tooltip khi bắt đầu kéo để không vướng víu
		setTooltipData(null);
	};

	// Lấy tọa độ thẻ hiện tại để định vị Tooltip
	const handleMouseEnter = e => {
		const rect = e.currentTarget.getBoundingClientRect();
		setTooltipData({
			item: item,
			rect: rect,
		});
	};

	return (
		<div
			draggable
			onDragStart={handleDragStart}
			onMouseEnter={handleMouseEnter}
			className='flex items-center gap-3 p-3 bg-white border border-slate-200 rounded-lg cursor-grab active:cursor-grabbing hover:border-blue-400 hover:shadow-md hover:bg-blue-50/30 transition-all duration-200 group relative'
		>
			<div className='w-12 h-12 bg-slate-100 rounded-md overflow-hidden shrink-0 border border-slate-200 group-hover:border-blue-300 transition-colors flex items-center justify-center'>
				{item.imageUrl ||
				item.assetAbsolutePath ||
				item.assetFullAbsolutePath ? (
					<img
						src={
							item.imageUrl ||
							item.assetAbsolutePath ||
							item.assetFullAbsolutePath
						}
						alt={tDynamic(item, "name")}
						className='w-full h-full object-cover pointer-events-none'
						onError={e => {
							e.target.src = "https://via.placeholder.com/48?text=Img";
						}}
					/>
				) : (
					<span className='text-xs font-bold text-slate-400'>N/A</span>
				)}
			</div>
			<div className='flex-1 min-w-0 flex items-center justify-between'>
				<span
					className='flex-1 text-sm font-bold text-slate-700 truncate mr-2'
					title={tDynamic(item, "name")}
				>
					{tDynamic(item, "name")}
				</span>
				<Info
					size={16}
					className='text-slate-300 group-hover:text-blue-500 transition-colors shrink-0'
				/>
			</div>
		</div>
	);
});

const DropDragSidePanel = ({ dataDict, defaultTab = "power" }) => {
	const { tUI, tDynamic } = useTranslation();
	const [activeTab, setActiveTab] = useState(defaultTab);
	const [searchTerm, setSearchTerm] = useState("");
	const [tooltipData, setTooltipData] = useState(null);

	const tabs = [
		{
			id: "power",
			label: tUI("admin.dropSidePanel.tabs.power"),
			icon: Zap,
			color: "text-blue-500",
			bgColor: "bg-blue-50",
			borderColor: "border-blue-200",
		},
		{
			id: "relic",
			label: tUI("admin.dropSidePanel.tabs.relic"),
			icon: Shield,
			color: "text-indigo-500",
			bgColor: "bg-indigo-50",
			borderColor: "border-indigo-200",
		},
		{
			id: "item",
			label: tUI("admin.dropSidePanel.tabs.item"),
			icon: Package,
			color: "text-amber-500",
			bgColor: "bg-amber-50",
			borderColor: "border-amber-200",
		},
		{
			id: "rune",
			label: tUI("admin.dropSidePanel.tabs.rune"),
			icon: Gem,
			color: "text-emerald-500",
			bgColor: "bg-emerald-50",
			borderColor: "border-emerald-200",
		},
		{
			id: "bonusStar",
			label: tUI("admin.dropSidePanel.tabs.bonusStar"),
			icon: Star,
			color: "text-purple-500",
			bgColor: "bg-purple-50",
			borderColor: "border-purple-200",
		},
	];

	// Lọc dữ liệu dựa trên tab hiện tại và từ khóa tìm kiếm
	const filteredData = useMemo(() => {
		let currentData = dataDict[activeTab] || [];

		if (searchTerm) {
			const term = removeAccents(searchTerm.toLowerCase());
			currentData = currentData.filter(item => {
				const nameMatch = removeAccents(
					(tDynamic(item, "name") || "").toLowerCase(),
				).includes(term);
				const descMatch = removeAccents(
					(tDynamic(item, "description") || "").toLowerCase(),
				).includes(term);
				return nameMatch || descMatch;
			});
		}

		return currentData;
	}, [dataDict, activeTab, searchTerm, tDynamic]);

	// Hàm helper để parse các thẻ HTML có sẵn trong text (ví dụ <link=keyword...>)
	const formatText = text => {
		if (!text) return "";
		return text
			.replace(/<link=keyword\.[^>]+>/g, "<strong class='text-blue-600'>")
			.replace(/<\/link>/g, "</strong>")
			.replace(/<style=[^>]+>/g, "")
			.replace(/<\/style>/g, "");
	};

	return (
		<div className='flex flex-col h-full bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative'>
			{/* Top Tabs */}
			<div className='flex overflow-x-auto bg-slate-50 border-b border-slate-200 custom-scrollbar shrink-0'>
				{tabs.map(tab => {
					const isActive = activeTab === tab.id;
					const Icon = tab.icon;
					return (
						<button
							key={tab.id}
							onClick={() => {
								setActiveTab(tab.id);
								setSearchTerm("");
								setTooltipData(null);
							}}
							className={`flex-1 flex flex-col items-center justify-center py-3 px-2 min-w-[70px] transition-all duration-200 border-b-2
                ${
									isActive
										? `border-blue-500 bg-white shadow-[inset_0_-2px_10px_rgba(0,0,0,0.02)]`
										: `border-transparent text-slate-500 hover:bg-slate-100 hover:text-slate-700`
								}
              `}
						>
							<Icon size={20} className={`mb-1 ${isActive ? tab.color : ""}`} />
							<span
								className={`text-[10px] uppercase font-bold tracking-wider ${isActive ? "text-slate-800" : ""}`}
							>
								{tab.label}
							</span>
						</button>
					);
				})}
			</div>

			{/* Search Bar */}
			<div className='p-3 border-b border-slate-200 bg-white shrink-0'>
				<div className='relative'>
					<input
						type='text'
						placeholder={tUI("admin.common.searchPlaceholder")}
						value={searchTerm}
						onChange={e => setSearchTerm(e.target.value)}
						className='w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all'
					/>
					<Search
						className='absolute left-3 top-1/2 -translate-y-1/2 text-slate-400'
						size={16}
					/>
					{searchTerm && (
						<button
							onClick={() => setSearchTerm("")}
							className='absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 bg-slate-200 hover:bg-slate-300 rounded-full p-0.5 transition-colors'
						>
							<X size={12} />
						</button>
					)}
				</div>
			</div>

			{/* Drag List Container */}
			<div
				className='flex-1 overflow-y-auto bg-slate-50/50 p-3 relative'
				onMouseLeave={() => setTooltipData(null)}
			>
				{filteredData.length > 0 ? (
					<div className='space-y-2'>
						{filteredData.map((item, index) => (
							<DropDragItem
								key={getUniqueId(item) || index}
								item={item}
								type={activeTab}
								setTooltipData={setTooltipData}
							/>
						))}
					</div>
				) : (
					<div className='h-full flex flex-col items-center justify-center text-center px-4 opacity-60'>
						<Package size={48} className='mb-3 text-slate-300' />
						{searchTerm ? (
							<>
								<p className='text-sm font-semibold text-slate-600'>
									{tUI("admin.dropSidePanel.noResult")} "{searchTerm}"
								</p>
							</>
						) : (
							<>
								<p className='text-sm font-semibold text-slate-600'>
									{tUI("admin.dropSidePanel.noData")}
								</p>
								<p className='text-xs text-slate-500 mt-1'>
									{tUI("admin.dropSidePanel.checkApi")}
								</p>
							</>
						)}
					</div>
				)}
			</div>

			{/* Tooltip hiển thị khi Hover */}
			{tooltipData && tooltipData.item && (
				<div
					className='absolute left-2 right-2 bg-white rounded-xl shadow-2xl border border-slate-200 p-4 z-50 pointer-events-none transform transition-all duration-200 animate-in fade-in slide-in-from-bottom-4'
					style={{
						// Cố định tooltip ở nửa dưới của Panel
						bottom: "10px",
						maxHeight: "75%",
						display: "flex",
						flexDirection: "column",
					}}
				>
					<h4 className='font-bold text-slate-800 text-lg mb-1 leading-tight flex justify-between items-start'>
						<span>{tDynamic(tooltipData.item, "name")}</span>
						<button
							onClick={() => setTooltipData(null)}
							className='p-1 text-slate-400 hover:bg-slate-100 rounded-md transition-colors'
							title={tUI("admin.common.close")}
						>
							<X size={16} />
						</button>
					</h4>
					<div className='text-sm text-slate-600 space-y-2 mt-2 max-h-[60vh] overflow-y-auto custom-scrollbar pr-1'>
						{tDynamic(tooltipData.item, "description") ? (
							<p
								dangerouslySetInnerHTML={{
									__html: formatText(
										tDynamic(tooltipData.item, "description"),
									).replace(/\\n/g, "<br/>"),
								}}
							/>
						) : (
							<span className='italic opacity-50'>
								{tUI("admin.dropSidePanel.noDescription")}
							</span>
						)}
					</div>

					{/* Hiển thị các Tags thông tin phụ trợ */}
					{(tooltipData.item.cost !== undefined ||
						tooltipData.item.rarity ||
						tooltipData.item.type) && (
						<div className='flex flex-wrap gap-2 mt-4 pt-3 border-t border-slate-200'>
							{tooltipData.item.cost !== undefined && (
								<span className='px-2.5 py-1 bg-blue-50 text-blue-600 border border-blue-100 text-xs font-bold rounded-md flex items-center gap-1'>
									<Zap size={12} /> {tooltipData.item.cost}{" "}
									{tUI("admin.dropSidePanel.mana")}
								</span>
							)}
							{tooltipData.item.rarity && (
								<span
									className={`px-2.5 py-1 text-xs font-bold rounded-md border
                        ${
													tooltipData.item.rarity === "Epic"
														? "bg-purple-50 text-purple-600 border-purple-100"
														: tooltipData.item.rarity === "Rare"
															? "bg-blue-50 text-blue-600 border-blue-100"
															: tooltipData.item.rarity === "Legendary"
																? "bg-amber-50 text-amber-600 border-amber-100"
																: "bg-slate-100 text-slate-600 border-slate-200"
												}
                      `}
								>
									{tooltipData.item.rarity}
								</span>
							)}
							{tooltipData.item.type && (
								<span className='px-2.5 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold rounded-md truncate max-w-[120px]'>
									{Array.isArray(tooltipData.item.type)
										? tooltipData.item.type.join(", ")
										: tooltipData.item.type}
								</span>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
};

export default memo(DropDragSidePanel);
