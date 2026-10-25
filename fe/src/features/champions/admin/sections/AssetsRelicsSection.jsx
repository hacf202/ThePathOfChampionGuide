import { memo } from "react";
import { Box, Link2, XCircle, Plus, Terminal, Shield } from "lucide-react";
import InputField from "@/components/common/inputField";
import SafeImage from "@/components/common/SafeImage";
import Button from "@/components/common/button";
import DragDropArrayInput from "@/components/admin/common/dragDropArrayInput";
import MarkupEditor from "@/components/admin/MarkupEditor";
import { ArrayInputComponent } from "@/features/champions/admin/championEditorHelpers";

const AssetsRelicsSection = memo(({ formData, setFormData, dataLookup, handleTranslationChange, tUI, convertToEmbedUrl }) => {
	return (
		<section className='bg-surface-bg border border-border rounded-xl p-6 shadow-sm space-y-8'>
			<h3 className='text-lg font-bold border-l-4 border-emerald-500 pl-3 uppercase flex items-center gap-2'>
				<Box size={20} className='text-emerald-500' /> {tUI("admin.championForm.assetSection")}
			</h3>

			{/* 1. Hình ảnh Assets */}
			<div className='grid grid-cols-1 gap-4 bg-surface-hover/30 p-4 rounded-xl border border-border'>
				<h4 className='text-sm font-bold flex items-center gap-2 mb-2'>
					<Link2 size={16} /> {tUI("admin.championForm.assetLabel")}
				</h4>
				{(formData.assets || []).map((asset, index) => (
					<div
						key={index}
						className='flex flex-col md:flex-row items-center gap-6 p-4 bg-surface-bg rounded-xl border border-border relative group'
					>
						<div className='grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 w-full'>
							{["avatar", "fullAbsolutePath", "gameAbsolutePath"].map(
								field => (
									<div key={field} className='space-y-2'>
										<InputField
											label={field}
											value={asset[field] || ""}
											onChange={e => {
												const newAssets = [...formData.assets];
												newAssets[index][field] = e.target.value;
												setFormData({ ...formData, assets: newAssets });
											}}
										/>
										{asset[field] && (
											<SafeImage
												src={asset[field]}
												className='h-20 w-auto rounded-lg object-contain bg-black/40 border shadow-inner'
												alt={field}
												width={200}
											/>
										)}
									</div>
								),
							)}
						</div>
						<button
							type='button'
							onClick={() =>
								setFormData({
									...formData,
									assets: formData.assets.filter((_, i) => i !== index),
								})
							}
							className='text-red-500 shrink-0 hover:bg-red-500/10 p-2 rounded-full'
						>
							<XCircle size={22} />
						</button>
					</div>
				))}
				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() =>
						setFormData({
							...formData,
							assets: [
								...(formData.assets || []),
								{
									fullAbsolutePath: "",
									gameAbsolutePath: "",
									avatar: "",
								},
							],
						})
					}
					className='w-max mt-2'
				>
					+ {tUI("admin.championForm.addAsset")}
				</Button>
			</div>

			{/* 2. Vùng (Regions) & Nhãn (Tags) */}
			<div className='space-y-6'>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
					<ArrayInputComponent
						label={tUI("admin.championForm.regionLabel") + " (VI)"}
						data={formData.regions || []}
						onChange={d => setFormData({ ...formData, regions: d })}
						cachedData={dataLookup.regions}
					/>
					<ArrayInputComponent
						label={tUI("admin.championForm.regionLabel") + " (EN)"}
						data={formData.translations?.en?.regions || []}
						onChange={d => handleTranslationChange("regions", d)}
						cachedData={dataLookup.regions}
					/>
				</div>
				<div className='grid grid-cols-1 md:grid-cols-2 gap-8 border-b border-border pb-6'>
					<ArrayInputComponent
						label={tUI("admin.championForm.tagLabel") + " (VI)"}
						data={formData.tags || []}
						onChange={d => setFormData({ ...formData, tags: d })}
					/>
					<ArrayInputComponent
						label={tUI("admin.championForm.tagLabel") + " (EN)"}
						data={formData.translations?.en?.tags || []}
						onChange={d => handleTranslationChange("tags", d)}
					/>
				</div>
			</div>

			{/* 3. VẬN HÀNH COMBO MẶC ĐỊNH & MẸO CHUNG CHO TƯỚNG */}
			<div className='p-5 bg-surface-hover/30 rounded-xl border border-border space-y-6'>
				<div className='border-b border-border pb-3'>
					<h4 className='text-sm font-bold uppercase text-primary-500 flex items-center gap-2'>
						<Terminal size={18} /> Vận Hành Combo Từng Bước (Mặc Định Chung Cho Tướng)
					</h4>
					<p className='text-xs text-text-secondary mt-1'>
						Các bước vận hành và mẹo chiến thuật này là mặc định chung cho tướng đó (áp dụng cho tất cả các bộ cổ vật, trừ khi một bộ cổ vật có cấu hình riêng).
					</p>
				</div>

				{/* Combo Steps Mặc Định */}
				<div className='flex flex-col gap-3'>
					<div className='flex items-center justify-between'>
						<label className='font-bold text-text-primary text-xs uppercase text-primary-500'>
							Các bước vận hành combo mặc định (Bước 1, 2, 3...)
						</label>
						<button
							type='button'
							onClick={() => {
								const currentSteps = formData.comboSteps || [];
								setFormData({
									...formData,
									comboSteps: [
										...currentSteps,
										{
											step: currentSteps.length + 1,
											phase: "",
											translations: { en: { phase: "" } },
										},
									],
								});
							}}
							className='text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-500/10 px-2.5 py-1 rounded'
						>
							+ Thêm bước
						</button>
					</div>

					{(formData.comboSteps || []).map((stepItem, sIdx) => (
						<div key={sIdx} className='p-3 bg-surface-bg rounded-lg border border-border space-y-2 relative'>
							<div className='flex items-center justify-between'>
								<span className='text-xs font-bold text-text-secondary'>Bước {sIdx + 1}</span>
								<button
									type='button'
									onClick={() => {
										setFormData({
											...formData,
											comboSteps: (formData.comboSteps || []).filter((_, i) => i !== sIdx),
										});
									}}
									className='text-xs text-red-500 hover:bg-red-500/10 p-1 rounded'
								>
									<XCircle size={16} />
								</button>
							</div>
							<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
								<InputField
									label="Nội dung bước (VI)"
									value={stepItem.phase || ""}
									onChange={e => {
										const newSteps = [...(formData.comboSteps || [])];
										newSteps[sIdx] = {
											...newSteps[sIdx],
											step: sIdx + 1,
											phase: e.target.value,
										};
										setFormData({ ...formData, comboSteps: newSteps });
									}}
									placeholder="VD: Vòng 1: Khởi động & Kiểm soát..."
								/>
								<InputField
									label="Step Description (EN)"
									value={stepItem.translations?.en?.phase || ""}
									onChange={e => {
										const newSteps = [...(formData.comboSteps || [])];
										if (!newSteps[sIdx].translations) newSteps[sIdx].translations = { en: {} };
										if (!newSteps[sIdx].translations.en) newSteps[sIdx].translations.en = {};
										newSteps[sIdx].translations.en.phase = e.target.value;
										setFormData({ ...formData, comboSteps: newSteps });
									}}
									placeholder="e.g. Turn 1: Setup & Board Control..."
								/>
							</div>
						</div>
					))}
				</div>

				{/* Pro Tips Mặc Định */}
				<div className='flex flex-col gap-3 pt-3 border-t border-border'>
					<div className='flex items-center justify-between'>
						<label className='font-bold text-text-primary text-xs uppercase text-amber-500 flex items-center gap-1.5'>
							<Shield size={14} /> Mẹo Chuyên Sâu & Khắc Chế Boss (Mặc Định Chung Cho Tướng)
						</label>
						<button
							type='button'
							onClick={() => {
								const currentTips = formData.proTips || [];
								setFormData({
									...formData,
									proTips: [
										...currentTips,
										{ tip: "", translations: { en: { tip: "" } } },
									],
								});
							}}
							className='text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded'
						>
							+ Thêm mẹo
						</button>
					</div>

					{(formData.proTips || []).map((tipItem, tIdx) => {
						const tipVal = typeof tipItem === "string" ? tipItem : tipItem?.tip || "";
						const tipEnVal = typeof tipItem === "object" ? tipItem?.translations?.en?.tip || "" : "";

						return (
							<div key={tIdx} className='p-3 bg-surface-bg rounded-lg border border-border space-y-2 relative'>
								<div className='flex items-center justify-between'>
									<span className='text-xs font-bold text-text-secondary'>Mẹo #{tIdx + 1}</span>
									<button
										type='button'
										onClick={() => {
											setFormData({
												...formData,
												proTips: (formData.proTips || []).filter((_, i) => i !== tIdx),
											});
										}}
										className='text-xs text-red-500 hover:bg-red-500/10 p-1 rounded'
									>
										<XCircle size={16} />
									</button>
								</div>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
									<textarea
										rows={2}
										value={tipVal}
										onChange={e => {
											const newTips = [...(formData.proTips || [])];
											const currentTip = newTips[tIdx];
											if (typeof currentTip === "string") {
												newTips[tIdx] = { tip: e.target.value, translations: { en: { tip: "" } } };
											} else {
												newTips[tIdx] = { ...currentTip, tip: e.target.value };
											}
											setFormData({ ...formData, proTips: newTips });
										}}
										className='w-full bg-input-bg border border-input-border p-2 rounded text-xs text-input-text placeholder:text-input-placeholder focus:border-primary-500 focus:outline-none'
										placeholder="Nội dung mẹo chiến thuật mặc định (VI)..."
									/>
									<textarea
										rows={2}
										value={tipEnVal}
										onChange={e => {
											const newTips = [...(formData.proTips || [])];
											const currentTip = newTips[tIdx];
											const currentTipObj = typeof currentTip === "string" ? { tip: currentTip } : currentTip;
											if (!currentTipObj.translations) currentTipObj.translations = { en: {} };
											if (!currentTipObj.translations.en) currentTipObj.translations.en = {};
											currentTipObj.translations.en.tip = e.target.value;
											newTips[tIdx] = currentTipObj;
											setFormData({ ...formData, proTips: newTips });
										}}
										className='w-full bg-input-bg border border-input-border p-2 rounded text-xs text-input-text placeholder:text-input-placeholder focus:border-primary-500 focus:outline-none'
										placeholder="Default tactical tip content (EN)..."
									/>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* 4. Danh Sách Các Bộ Cổ Vật Gợi Ý (Relic Sets) */}
			<div className='flex flex-col gap-4 pt-4 border-t border-border'>
				<div className='border-b border-border pb-2'>
					<h4 className='text-sm font-bold uppercase text-emerald-500 flex items-center gap-2'>
						Danh Sách Bộ Cổ Vật Gợi Ý (Relic Sets)
					</h4>
					<p className='text-xs text-text-secondary mt-0.5'>
						Mỗi bộ có thể có combo hoặc mẹo riêng nếu là bộ đặc thù. Nếu để trống, hệ thống sẽ tự động dùng Combo & Mẹo mặc định chung của tướng ở trên.
					</p>
				</div>

				<div className='grid grid-cols-1 xl:grid-cols-2 gap-8'>
					{(formData.relicSets || []).map((set, idx) => (
						<div
							key={idx}
							className='relative bg-surface-hover/20 p-4 rounded-xl border border-border flex flex-col gap-4 focus-within:z-50'
						>
							<button
								type='button'
								onClick={() => {
									const newSets = (formData.relicSets || []).filter(
										(_, i) => i !== idx,
									);
									setFormData({ ...formData, relicSets: newSets });
								}}
								className='absolute top-2 right-2 text-xs text-red-500 hover:bg-red-500/10 p-1 rounded font-bold'
							>
								{tUI("admin.championForm.deleteSet")}
							</button>

							<DragDropArrayInput
								label={tUI("admin.championForm.relicSuggest", { idx: idx + 1 })}
								data={set.items || []}
								onChange={d => {
									const newSets = [...(formData.relicSets || [])];
									newSets[idx] = { ...newSets[idx], items: d };
									setFormData({ ...formData, relicSets: newSets });
								}}
								cachedData={dataLookup.relics}
								allowDuplicates={true}
							/>

							{/* Tiêu đề bộ trang bị */}
							<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
								<InputField
									label="Tiêu đề bộ (VI)"
									value={set.title || ""}
									onChange={e => {
										const newSets = [...(formData.relicSets || [])];
										newSets[idx] = { ...newSets[idx], title: e.target.value };
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="VD: BIS ENDGAME 6.5★..."
								/>
								<InputField
									label="Title (EN)"
									value={set.translations?.en?.title || ""}
									onChange={e => {
										const newSets = [...(formData.relicSets || [])];
										const cur = newSets[idx];
										if (!cur.translations) cur.translations = { en: {} };
										if (!cur.translations.en) cur.translations.en = {};
										cur.translations.en.title = e.target.value;
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="e.g. BIS ENDGAME 6.5★..."
								/>
							</div>

							{/* Số sao khuyên dùng */}
							<div className='flex flex-col gap-1'>
								<label className='block font-semibold text-text-primary text-xs'>
									Số sao khuyên dùng (1-6)
								</label>
								<input
									type='number'
									min={1}
									max={6}
									value={set.recommendedStars ?? 6}
									onChange={e => {
										const newSets = [...(formData.relicSets || [])];
										newSets[idx] = { ...newSets[idx], recommendedStars: parseInt(e.target.value) || 1 };
										setFormData({ ...formData, relicSets: newSets });
									}}
									className='w-32 bg-input-bg border border-input-border p-2 rounded text-xs text-input-text focus:border-primary-500 focus:outline-none'
								/>
							</div>

							{/* Vận Hành Combo Riêng Cho Bộ Này (Tùy chọn) - Không còn ô hành động cụ thể */}
							<div className='flex flex-col gap-3 pt-3 border-t border-border'>
								<div className='flex items-center justify-between'>
									<div>
										<label className='font-bold text-text-primary text-xs uppercase text-primary-500'>
											Vận Hành Combo Riêng (Tùy chọn)
										</label>
										<p className='text-[10px] text-text-secondary'>Để trống sẽ tự động lấy combo mặc định của tướng</p>
									</div>
									<button
										type='button'
										onClick={() => {
											const newSets = [...(formData.relicSets || [])];
											const currentSteps = newSets[idx].comboSteps || [];
											newSets[idx] = {
												...newSets[idx],
												comboSteps: [
													...currentSteps,
													{
														step: currentSteps.length + 1,
														phase: "",
														translations: { en: { phase: "" } },
													},
												],
											};
											setFormData({ ...formData, relicSets: newSets });
										}}
										className='text-xs font-bold text-primary-500 hover:text-primary-600 bg-primary-500/10 px-2.5 py-1 rounded'
									>
										+ Thêm bước
									</button>
								</div>

								{(set.comboSteps || []).map((stepItem, sIdx) => (
									<div key={sIdx} className='p-3 bg-surface-bg rounded-lg border border-border space-y-2 relative'>
										<div className='flex items-center justify-between'>
											<span className='text-xs font-bold text-text-secondary'>Bước {sIdx + 1}</span>
											<button
												type='button'
												onClick={() => {
													const newSets = [...(formData.relicSets || [])];
													newSets[idx].comboSteps = (newSets[idx].comboSteps || []).filter((_, i) => i !== sIdx);
													setFormData({ ...formData, relicSets: newSets });
												}}
												className='text-xs text-red-500 hover:bg-red-500/10 p-1 rounded'
											>
												<XCircle size={16} />
											</button>
										</div>
										<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
											<InputField
												label="Nội dung bước (VI)"
												value={stepItem.phase || ""}
												onChange={e => {
													const newSets = [...(formData.relicSets || [])];
													newSets[idx].comboSteps[sIdx].phase = e.target.value;
													newSets[idx].comboSteps[sIdx].step = sIdx + 1;
													setFormData({ ...formData, relicSets: newSets });
												}}
												placeholder="VD: Vòng 1: Khởi động & Kiểm soát"
											/>
											<InputField
												label="Step Description (EN)"
												value={stepItem.translations?.en?.phase || ""}
												onChange={e => {
													const newSets = [...(formData.relicSets || [])];
													if (!newSets[idx].comboSteps[sIdx].translations) newSets[idx].comboSteps[sIdx].translations = { en: {} };
													if (!newSets[idx].comboSteps[sIdx].translations.en) newSets[idx].comboSteps[sIdx].translations.en = {};
													newSets[idx].comboSteps[sIdx].translations.en.phase = e.target.value;
													setFormData({ ...formData, relicSets: newSets });
												}}
												placeholder="e.g., Turn 1: Setup & Control"
											/>
										</div>
									</div>
								))}
							</div>

							{/* Pro Tips Riêng Cho Bộ Này (Tùy chọn) */}
							<div className='flex flex-col gap-3 pt-3 border-t border-border'>
								<div className='flex items-center justify-between'>
									<div>
										<label className='font-bold text-text-primary text-xs uppercase text-amber-500'>
											Mẹo Riêng Cho Bộ Này (Tùy chọn)
										</label>
										<p className='text-[10px] text-text-secondary'>Để trống sẽ tự động lấy mẹo mặc định của tướng</p>
									</div>
									<button
										type='button'
										onClick={() => {
											const newSets = [...(formData.relicSets || [])];
											const currentTips = newSets[idx].proTips || [];
											newSets[idx] = {
												...newSets[idx],
												proTips: [
													...currentTips,
													{ tip: "", translations: { en: { tip: "" } } },
												],
											};
											setFormData({ ...formData, relicSets: newSets });
										}}
										className='text-xs font-bold text-amber-500 hover:text-amber-600 bg-amber-500/10 px-2.5 py-1 rounded'
									>
										+ Thêm mẹo
									</button>
								</div>

								{(set.proTips || []).map((tipItem, tIdx) => {
									const tipVal = typeof tipItem === "string" ? tipItem : tipItem?.tip || "";
									const tipEnVal = typeof tipItem === "object" ? tipItem?.translations?.en?.tip || "" : "";

									return (
										<div key={tIdx} className='p-3 bg-surface-bg rounded-lg border border-border space-y-2 relative'>
											<div className='flex items-center justify-between'>
												<span className='text-xs font-bold text-text-secondary'>Mẹo #{tIdx + 1}</span>
												<button
													type='button'
													onClick={() => {
														const newSets = [...(formData.relicSets || [])];
														newSets[idx].proTips = (newSets[idx].proTips || []).filter((_, i) => i !== tIdx);
														setFormData({ ...formData, relicSets: newSets });
													}}
													className='text-xs text-red-500 hover:bg-red-500/10 p-1 rounded'
												>
													<XCircle size={16} />
												</button>
											</div>
											<div className='grid grid-cols-1 md:grid-cols-2 gap-2'>
												<textarea
													rows={2}
													value={tipVal}
													onChange={e => {
														const newSets = [...(formData.relicSets || [])];
														const currentTip = newSets[idx].proTips[tIdx];
														if (typeof currentTip === "string") {
															newSets[idx].proTips[tIdx] = { tip: e.target.value, translations: { en: { tip: "" } } };
														} else {
															newSets[idx].proTips[tIdx] = { ...currentTip, tip: e.target.value };
														}
														setFormData({ ...formData, relicSets: newSets });
													}}
													className='w-full bg-input-bg border border-input-border p-2 rounded text-xs text-input-text placeholder:text-input-placeholder focus:border-primary-500 focus:outline-none'
													placeholder="Nội dung mẹo chiến thuật (VI)..."
												/>
												<textarea
													rows={2}
													value={tipEnVal}
													onChange={e => {
														const newSets = [...(formData.relicSets || [])];
														const currentTip = newSets[idx].proTips[tIdx];
														const currentTipObj = typeof currentTip === "string" ? { tip: currentTip } : currentTip;
														if (!currentTipObj.translations) currentTipObj.translations = { en: {} };
														if (!currentTipObj.translations.en) currentTipObj.translations.en = {};
														currentTipObj.translations.en.tip = e.target.value;
														newSets[idx].proTips[tIdx] = currentTipObj;
														setFormData({ ...formData, relicSets: newSets });
													}}
													className='w-full bg-input-bg border border-input-border p-2 rounded text-xs text-input-text placeholder:text-input-placeholder focus:border-primary-500 focus:outline-none'
													placeholder="Tactical tip content (EN)..."
												/>
											</div>
										</div>
									);
								})}
							</div>

							{/* Mô tả bộ trang bị */}
							<div className='flex flex-col gap-2'>
								<label className='block font-semibold text-text-primary text-sm'>
									{tUI("admin.championForm.descLabel")} (VI)
								</label>
								<MarkupEditor
									value={set.description || ""}
									onChange={({ markup, raw }) => {
										const newSets = [...(formData.relicSets || [])];
										newSets[idx] = { ...newSets[idx], description: markup, descriptionRaw: raw };
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="Nhập mô tả bộ cổ vật (VI)..."
								/>
							</div>
							
							<div className='flex flex-col gap-2'>
								<label className='block font-semibold text-blue-400 text-sm'>
									{tUI("admin.championForm.descLabel")} (EN)
								</label>
								<MarkupEditor
									value={set.translations?.en?.description || ""}
									onChange={({ markup, raw }) => {
										const newSets = [...(formData.relicSets || [])];
										const currentSet = newSets[idx];
										if (!currentSet.translations) currentSet.translations = { en: {} };
										if (!currentSet.translations.en) currentSet.translations.en = {};
										currentSet.translations.en.description = markup;
										currentSet.translations.en.descriptionRaw = raw;
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="Enter relic set description (EN)..."
								/>
							</div>

							{/* Video link */}
							<div className='flex flex-col gap-2'>
								<label className='block font-semibold text-text-primary text-sm'>
									{tUI("admin.championForm.videoLabel")}
								</label>
								<InputField
									value={set.videoLink || ""}
									onChange={e => {
										const newSets = [...(formData.relicSets || [])];
										newSets[idx] = { ...newSets[idx], videoLink: convertToEmbedUrl(e.target.value) };
										setFormData({ ...formData, relicSets: newSets });
									}}
									placeholder="https://www.youtube.com/embed/..."
								/>
							</div>
						</div>
					))}
				</div>

				<Button
					type='button'
					variant='outline'
					size='sm'
					onClick={() =>
						setFormData(prev => ({
							...prev,
							relicSets: [
								...(prev.relicSets || []),
								{
									items: [],
									title: "",
									recommendedStars: 6,
									comboSteps: [],
									proTips: [],
									description: "",
									videoLink: "",
								},
							],
						}))
					}
					className='w-max mt-2 border-dashed border-primary-500 text-primary-500 hover:bg-primary-500/10'
					iconLeft={<Plus size={16} />}
				>
					{tUI("admin.championForm.addRelicSet")}
				</Button>
			</div>

			{/* 5. Ngọc gợi ý (Runes) */}
			<div className='w-full md:w-1/3'>
				<DragDropArrayInput
					label={tUI("admin.championForm.runeSuggest")}
					data={formData.runeIds || []}
					onChange={d => setFormData({ ...formData, runeIds: d })}
					cachedData={{ ...dataLookup.powers, ...dataLookup.runes }}
				/>
			</div>
		</section>
	);
});

AssetsRelicsSection.displayName = "AssetsRelicsSection";
export default AssetsRelicsSection;
