// src/components/admin/adventureMapEditorForm.jsx
import { useState, memo, useEffect } from "react";
import Button from "../common/button";
import InputField from "../common/inputField";
import { Plus, Trash2 } from "lucide-react";

// Helper component thao tác mảng String (dùng cho specialRules, bosses)
const StringArrayInput = ({ label, items, onChange, placeholder }) => (
	<div className='space-y-2'>
		<label className='block font-semibold text-sm text-text-secondary'>
			{label}
		</label>
		{items.map((val, idx) => (
			<div key={idx} className='flex gap-2'>
				<InputField
					value={val}
					onChange={e => {
						const newArr = [...items];
						newArr[idx] = e.target.value;
						onChange(newArr);
					}}
					placeholder={placeholder}
				/>
				<Button
					type='button'
					variant='danger'
					onClick={() => onChange(items.filter((_, i) => i !== idx))}
				>
					<Trash2 size={16} />
				</Button>
			</div>
		))}
		<Button
			type='button'
			variant='outline'
			size='sm'
			onClick={() => onChange([...items, ""])}
		>
			<Plus size={14} /> Thêm
		</Button>
	</div>
);

const AdventureMapEditorForm = memo(
	({ item, onSave, onCancel, onDelete, isSaving }) => {
		const [formData, setFormData] = useState({});

		useEffect(() => {
			if (item) {
				const cloned = JSON.parse(JSON.stringify(item));
				if (!cloned.translations)
					cloned.translations = {
						en: { adventureName: "", typeAdventure: "" },
					};
				if (!cloned.Bosses) cloned.Bosses = [];
				if (!cloned.nodes) cloned.nodes = [];
				if (!cloned.rewards) cloned.rewards = [];
				if (!cloned.requirement)
					cloned.requirement = { champions: [], regions: [] };
				setFormData(cloned);
			}
		}, [item]);

		const handleChange = e => {
			const { name, value } = e.target;
			setFormData(prev => ({ ...prev, [name]: value }));
		};

		const handleSubmit = e => {
			e.preventDefault();
			onSave(formData);
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-6 pb-20'>
				{/* THANH STICKY HEADER */}
				<div className='flex justify-between items-center border-b border-border p-4 sticky top-0 bg-surface-bg z-30 shadow-sm'>
					<h2 className='text-xl font-bold text-primary-500'>
						{formData.isNew
							? "Tạo Bản Đồ Mới"
							: `Biên tập: ${formData.adventureName}`}
					</h2>
					<div className='flex gap-2'>
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
								onClick={() => onDelete(formData.adventureID)}
								disabled={isSaving}
							>
								Xóa
							</Button>
						)}
						<Button
							type='submit'
							variant='primary'
							disabled={isSaving || !formData.adventureID}
						>
							{isSaving ? "Đang lưu..." : "Lưu Bản Đồ"}
						</Button>
					</div>
				</div>

				<div className='p-6 space-y-8 max-w-[1400px] mx-auto'>
					{/* 1. THÔNG TIN CƠ BẢN */}
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border space-y-4 shadow-sm'>
						<h3 className='font-bold text-lg border-l-4 border-primary-500 pl-3'>
							Thông tin cơ bản
						</h3>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							<InputField
								label='Mã Map (ID)'
								name='adventureID'
								value={formData.adventureID || ""}
								onChange={handleChange}
								required
								disabled={!formData.isNew}
							/>
							<InputField
								label='Độ khó (Difficulty)'
								name='difficulty'
								type='number'
								value={formData.difficulty || 0}
								onChange={e =>
									setFormData(p => ({
										...p,
										difficulty: Number(e.target.value),
									}))
								}
							/>
							<InputField
								label='Tên Map (VI)'
								name='adventureName'
								value={formData.adventureName || ""}
								onChange={handleChange}
								required
							/>
							<InputField
								label='Tên Map (EN)'
								value={formData.translations?.en?.adventureName || ""}
								onChange={e =>
									setFormData(p => ({
										...p,
										translations: {
											...p.translations,
											en: {
												...p.translations.en,
												adventureName: e.target.value,
											},
										},
									}))
								}
							/>
							<InputField
								label='Loại Map (VI)'
								name='typeAdventure'
								value={formData.typeAdventure || ""}
								onChange={handleChange}
							/>
							<InputField
								label='Loại Map (EN)'
								value={formData.translations?.en?.typeAdventure || ""}
								onChange={e =>
									setFormData(p => ({
										...p,
										translations: {
											...p.translations,
											en: {
												...p.translations.en,
												typeAdventure: e.target.value,
											},
										},
									}))
								}
							/>
							<InputField
								label='Link Background'
								name='background'
								value={formData.background || ""}
								onChange={handleChange}
							/>
							<InputField
								label='Kinh nghiệm (XP)'
								name='championXP'
								type='number'
								value={formData.championXP || 0}
								onChange={e =>
									setFormData(p => ({
										...p,
										championXP: Number(e.target.value),
									}))
								}
							/>
						</div>
					</section>

					{/* 2. YÊU CẦU & LUẬT ĐẶC BIỆT */}
					<section className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
						<div className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
							<h3 className='font-bold mb-4 text-lg border-l-4 border-blue-500 pl-3'>
								Yêu cầu tham gia (Requirement)
							</h3>
							<div className='space-y-4'>
								<StringArrayInput
									label='Tướng bắt buộc (Champions)'
									items={formData.requirement?.champions || []}
									onChange={arr =>
										setFormData(p => ({
											...p,
											requirement: { ...p.requirement, champions: arr },
										}))
									}
								/>
								<div className='border-t border-border/50 pt-4'>
									<StringArrayInput
										label='Vùng bắt buộc (Regions)'
										items={formData.requirement?.regions || []}
										onChange={arr =>
											setFormData(p => ({
												...p,
												requirement: { ...p.requirement, regions: arr },
											}))
										}
									/>
								</div>
							</div>
						</div>
						<div className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
							<h3 className='font-bold mb-4 text-lg border-l-4 border-purple-500 pl-3'>
								Luật Đặc Biệt (Mutators/Powers)
							</h3>
							<StringArrayInput
								label='Danh sách Power IDs (VD: P0612)'
								items={formData.specialRules || []}
								onChange={arr =>
									setFormData(p => ({ ...p, specialRules: arr }))
								}
							/>
						</div>
					</section>

					{/* 3. DANH SÁCH BOSS CHÍNH (ĐÃ THIẾT KẾ LẠI RỘNG RÃI HƠN) */}
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
						<div className='flex justify-between items-center mb-6 border-b border-border pb-3'>
							<h3 className='font-bold text-lg border-l-4 border-red-500 pl-3'>
								Danh sách Boss chính & Ghi chú
							</h3>
							<Button
								type='button'
								variant='primary'
								size='sm'
								onClick={() =>
									setFormData(p => ({
										...p,
										Bosses: [...(p.Bosses || []), { bossID: "", note: "" }],
									}))
								}
							>
								<Plus size={16} className='mr-1' /> Thêm Boss
							</Button>
						</div>

						{/* Hiển thị danh sách Boss dạng cột dọc (Mỗi Boss 1 dòng lớn) */}
						<div className='flex flex-col gap-5'>
							{(formData.Bosses || []).map((b, i) => (
								<div
									key={i}
									className='bg-surface-bg p-5 rounded-lg border border-border shadow-md flex flex-col lg:flex-row gap-6 relative'
								>
									{/* Cột trái: ID Boss */}
									<div className='w-full lg:w-1/4 flex flex-col gap-4 lg:border-r lg:border-border lg:pr-6'>
										<div className='flex justify-between items-center'>
											<span className='font-black text-red-500 text-lg'>
												BOSS #{i + 1}
											</span>
											<Button
												type='button'
												variant='ghost'
												className='text-red-500 hover:bg-red-500/10'
												onClick={() =>
													setFormData(p => ({
														...p,
														Bosses: p.Bosses.filter((_, idx) => idx !== i),
													}))
												}
											>
												<Trash2 size={18} />
											</Button>
										</div>
										<InputField
											label='Mã Boss (ID)'
											placeholder='VD: B001'
											value={b.bossID}
											onChange={e => {
												const arr = [...formData.Bosses];
												arr[i].bossID = e.target.value;
												setFormData(p => ({ ...p, Bosses: arr }));
											}}
										/>
									</div>

									{/* Cột phải: Ghi chú (Textarea rộng) */}
									<div className='w-full lg:w-3/4 flex flex-col'>
										<label className='block font-semibold text-sm text-text-secondary mb-2'>
											Chi tiết chiến thuật / Ghi chú (Hỗ trợ xuống dòng)
										</label>
										<textarea
											className='w-full flex-1 min-h-[120px] bg-surface-hover border border-border rounded-lg p-4 text-sm text-text-primary focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none resize-y transition-colors placeholder:text-text-secondary/50'
											placeholder='Nhập chi tiết hướng dẫn, cách đánh, lưu ý quan trọng khi gặp boss này...'
											value={b.note || ""}
											onChange={e => {
												const arr = [...formData.Bosses];
												arr[i].note = e.target.value;
												setFormData(p => ({ ...p, Bosses: arr }));
											}}
										/>
									</div>
								</div>
							))}
							{(!formData.Bosses || formData.Bosses.length === 0) && (
								<div className='text-center py-10 text-text-secondary bg-surface-bg rounded-lg border border-dashed border-border'>
									Chưa có Boss nào. Hãy bấm "Thêm Boss" để bắt đầu.
								</div>
							)}
						</div>
					</section>

					{/* 4. CẤU TRÚC NODES MAP */}
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
						<div className='flex justify-between items-center mb-6 border-b border-border pb-3'>
							<h3 className='font-bold text-lg border-l-4 border-pink-500 pl-3'>
								Sơ đồ Bản đồ (Map Nodes)
							</h3>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() =>
									setFormData(p => ({
										...p,
										nodes: [
											...(p.nodes || []),
											{
												nodeID: `n${(p.nodes?.length || 0) + 1}`,
												nodeType: "Encounter",
												bosses: [],
												nextNodes: [],
												position: { x: 50, y: 50 },
											},
										],
									}))
								}
							>
								<Plus size={16} className='mr-1' /> Thêm Node
							</Button>
						</div>
						<div className='grid grid-cols-1 xl:grid-cols-2 gap-5 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar'>
							{(formData.nodes || []).map((node, i) => (
								<div
									key={i}
									className='bg-surface-bg p-4 rounded-lg border border-border shadow-sm'
								>
									<div className='flex justify-between items-center font-black text-pink-500 mb-4 border-b border-border/50 pb-2'>
										Node: {node.nodeID}
										<Button
											type='button'
											variant='ghost'
											className='text-red-500 hover:bg-red-500/10'
											onClick={() =>
												setFormData(p => ({
													...p,
													nodes: p.nodes.filter((_, idx) => idx !== i),
												}))
											}
										>
											<Trash2 size={16} />
										</Button>
									</div>
									<div className='grid grid-cols-2 gap-4 text-sm'>
										<InputField
											label='Node ID'
											value={node.nodeID}
											onChange={e => {
												const arr = [...formData.nodes];
												arr[i].nodeID = e.target.value;
												setFormData(p => ({ ...p, nodes: arr }));
											}}
										/>
										<InputField
											label='Loại Node (Encounter/Boss)'
											value={node.nodeType}
											onChange={e => {
												const arr = [...formData.nodes];
												arr[i].nodeType = e.target.value;
												setFormData(p => ({ ...p, nodes: arr }));
											}}
										/>
										<div className='col-span-2 bg-surface-hover p-3 rounded-md'>
											<StringArrayInput
												label='Chứa Boss (Nhập ID)'
												items={node.bosses || []}
												onChange={newBosses => {
													const arr = [...formData.nodes];
													arr[i].bosses = newBosses;
													setFormData(p => ({ ...p, nodes: arr }));
												}}
											/>
										</div>
										<div className='col-span-2 bg-surface-hover p-3 rounded-md'>
											<StringArrayInput
												label='Nối tới Node (Next Nodes)'
												items={node.nextNodes || []}
												onChange={n => {
													const arr = [...formData.nodes];
													arr[i].nextNodes = n;
													setFormData(p => ({ ...p, nodes: arr }));
												}}
											/>
										</div>
										<InputField
											label='Tọa độ X (%)'
											type='number'
											value={node.position?.x || 0}
											onChange={e => {
												const arr = [...formData.nodes];
												arr[i].position.x = Number(e.target.value);
												setFormData(p => ({ ...p, nodes: arr }));
											}}
										/>
										<InputField
											label='Tọa độ Y (%)'
											type='number'
											value={node.position?.y || 0}
											onChange={e => {
												const arr = [...formData.nodes];
												arr[i].position.y = Number(e.target.value);
												setFormData(p => ({ ...p, nodes: arr }));
											}}
										/>
									</div>
								</div>
							))}
						</div>
					</section>

					{/* 5. REWARDS (PHẦN THƯỞNG) */}
					<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
						<div className='flex justify-between items-center mb-6 border-b border-border pb-3'>
							<h3 className='font-bold text-lg border-l-4 border-yellow-500 pl-3'>
								Phần thưởng (Rewards)
							</h3>
							<Button
								type='button'
								variant='outline'
								size='sm'
								onClick={() =>
									setFormData(p => ({
										...p,
										rewards: [...(p.rewards || []), { items: [] }],
									}))
								}
							>
								<Plus size={16} className='mr-1' /> Thêm Gói Thưởng
							</Button>
						</div>
						<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
							{(formData.rewards || []).map((rewardPacket, pIdx) => (
								<div
									key={pIdx}
									className='bg-surface-bg p-4 border border-border rounded-lg shadow-sm'
								>
									<div className='flex justify-between items-center mb-4 border-b border-border/50 pb-2'>
										<span className='font-black text-yellow-500'>
											GÓI {pIdx + 1}
										</span>
										<div className='flex gap-2'>
											<Button
												type='button'
												variant='outline'
												size='sm'
												onClick={() => {
													const r = [...formData.rewards];
													r[pIdx].items.push({ name: "", count: 1 });
													setFormData(p => ({ ...p, rewards: r }));
												}}
											>
												<Plus size={14} className='mr-1' /> Vật phẩm
											</Button>
											<Button
												type='button'
												variant='ghost'
												className='text-red-500 hover:bg-red-500/10'
												onClick={() =>
													setFormData(p => ({
														...p,
														rewards: p.rewards.filter((_, i) => i !== pIdx),
													}))
												}
											>
												<Trash2 size={16} />
											</Button>
										</div>
									</div>
									<div className='space-y-3'>
										{rewardPacket.items.map((it, iIdx) => (
											<div
												key={iIdx}
												className='flex gap-2 items-center bg-surface-hover p-2 rounded-md'
											>
												<InputField
													placeholder='Tên vật phẩm (VD: Kho báu Vàng)'
													value={it.name}
													onChange={e => {
														const r = [...formData.rewards];
														r[pIdx].items[iIdx].name = e.target.value;
														setFormData(p => ({ ...p, rewards: r }));
													}}
													className='flex-1'
												/>
												<InputField
													type='number'
													placeholder='SL'
													value={it.count}
													onChange={e => {
														const r = [...formData.rewards];
														r[pIdx].items[iIdx].count = Number(e.target.value);
														setFormData(p => ({ ...p, rewards: r }));
													}}
													className='w-20'
												/>
												<Button
													type='button'
													variant='ghost'
													className='text-red-500 p-2'
													onClick={() => {
														const r = [...formData.rewards];
														r[pIdx].items.splice(iIdx, 1);
														setFormData(p => ({ ...p, rewards: r }));
													}}
												>
													<Trash2 size={16} />
												</Button>
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</section>
				</div>
			</form>
		);
	},
);

export default AdventureMapEditorForm;
