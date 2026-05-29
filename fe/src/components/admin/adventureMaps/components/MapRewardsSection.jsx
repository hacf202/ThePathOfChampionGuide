import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Button from '../../../common/button';
import InputField from '../../../common/inputField';
import { COMMON_REWARDS, REGION_OPTIONS, REGIONAL_REWARD_BASES, getRegionalRewardInfo } from './mapEditorConstants';

const MapRewardsSection = ({ formData, setFormData, cachedData }) => {
	const flattenedRequirements = [
		...(formData.requirement?.champions || []).map(cID => {
			const champ = (cachedData.champions || []).find(
				c => c.championCode === cID,
			);
			return {
				type: "champion",
				label: champ ? champ.name || champ.championName : cID,
				icon: champ?.assetAbsolutePath || champ?.assetFullAbsolutePath,
			};
		}),
		...(formData.requirement?.regions || []).map(rName => ({
			type: "region",
			label: `Tướng vùng ${rName}`,
			icon: null,
		})),
	];

	return (
		<section className='bg-surface-hover/30 p-5 rounded-xl border border-border shadow-sm'>
			<div className='flex justify-between items-center mb-6 border-b border-border pb-3'>
				<div className='space-y-1'>
					<h3 className='font-bold text-lg border-l-4 border-yellow-500 pl-3'>
						Phần thưởng (Rewards)
					</h3>
					<p className='text-xs text-text-secondary pl-3'>
						Số lượng gói phần thưởng được tự động đồng bộ theo Yêu cầu tham gia (Champions + Regions).
					</p>
				</div>
			</div>
			<div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
				{(formData.rewards || []).map((rewardPacket, pIdx) => {
					const linkedReq = flattenedRequirements[pIdx];
					return (
						<div
							key={pIdx}
							className='bg-surface-bg p-5 border border-border rounded-xl shadow-sm flex flex-col gap-4'
						>
							<div className='flex justify-between items-center mb-2 border-b border-border/50 pb-3'>
								<div className='flex items-center gap-2.5 max-w-[75%]'>
									<span className='font-black text-yellow-500 text-sm tracking-wider uppercase shrink-0'>
										GÓI THƯỞNG #{pIdx + 1}
									</span>
									{linkedReq ? (
										<span className='inline-flex items-center gap-1.5 px-2 py-0.5 bg-primary-500/10 text-primary-500 text-[10px] font-bold rounded-lg border border-primary-500/20 truncate' title={`Mở khóa bằng: ${linkedReq.label}`}>
											{linkedReq.icon && (
												<img
													src={linkedReq.icon}
													className='w-3.5 h-3.5 object-contain rounded-md shrink-0'
													alt=''
												/>
											)}
											<span className='truncate'>Mở khóa: {linkedReq.label}</span>
										</span>
									) : (
										<span className='inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-500 text-[10px] font-bold rounded-lg border border-yellow-500/20 shrink-0'>
											Hoàn thành mặc định
										</span>
									)}
								</div>
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
							</div>

							<div className='space-y-3'>
								{rewardPacket.items.map((it, iIdx) => {
									const rewardInfo = getRegionalRewardInfo(it.name);
									const hasRegionOption = !!rewardInfo.base;
									const selectValue = rewardInfo.base || (COMMON_REWARDS.some(opt => opt.value === it.name) ? it.name : "");

									return (
										<div
											key={iIdx}
											className='flex flex-col gap-2 bg-surface-hover/30 p-3 rounded-xl border border-border/50 hover:bg-surface-hover transition-colors'
										>
											<div className='flex gap-2 w-full'>
												<div className='flex-1 min-w-0'>
													<select
														className='w-full bg-surface-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold cursor-pointer'
														value={selectValue}
														onChange={e => {
															const selectedVal = e.target.value;
															if (selectedVal) {
																const r = [...formData.rewards];
																const isRegionalBase = REGIONAL_REWARD_BASES.includes(selectedVal);
																if (isRegionalBase) {
																	const currentRegion = rewardInfo.region || "";
																	r[pIdx].items[iIdx].name = selectedVal + (currentRegion ? " " + currentRegion : "");
																} else {
																	r[pIdx].items[iIdx].name = selectedVal;
																}
																
																if (selectedVal === "Điểm Huyền Thoại") {
																	r[pIdx].items[iIdx].count = 1000;
																} else if (selectedVal === "Bụi Tinh Tú") {
																	r[pIdx].items[iIdx].count = 100;
																} else if (selectedVal === "Mảnh Ghép Bí Ẩn") {
																	r[pIdx].items[iIdx].count = 5;
																} else {
																	r[pIdx].items[iIdx].count = 1;
																}
																setFormData(p => ({ ...p, rewards: r }));
															}
														}}
													>
														<option value=''>-- Chọn mẫu --</option>
														{COMMON_REWARDS.map(opt => (
															<option key={opt.value} value={opt.value}>
																{opt.label}
															</option>
														))}
													</select>
												</div>

												{hasRegionOption && (
													<div className='flex-1 min-w-0'>
														<select
															className='w-full bg-surface-bg border border-border rounded-xl px-2.5 py-1.5 text-xs text-text-primary outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all font-semibold cursor-pointer'
															value={rewardInfo.region}
															onChange={e => {
																const newRegion = e.target.value;
																const r = [...formData.rewards];
																r[pIdx].items[iIdx].name = rewardInfo.base + (newRegion ? " " + newRegion : "");
																setFormData(p => ({ ...p, rewards: r }));
															}}
														>
															<option value=''>-- Không vùng --</option>
															{REGION_OPTIONS.map(opt => (
																<option key={opt.value} value={opt.value}>
																	{opt.label}
																</option>
															))}
														</select>
													</div>
												)}
											</div>

											<div className='flex gap-2 w-full items-center'>
												<div className='flex-1 min-w-0'>
													<InputField
														placeholder='Tên vật phẩm...'
														value={it.name}
														onChange={e => {
															const r = [...formData.rewards];
															r[pIdx].items[iIdx].name = e.target.value;
															setFormData(p => ({ ...p, rewards: r }));
														}}
														className='w-full text-xs'
													/>
												</div>

												<div className='w-20 shrink-0'>
													<InputField
														type='number'
														placeholder='SL'
														value={it.count}
														onChange={e => {
															const r = [...formData.rewards];
															r[pIdx].items[iIdx].count = Number(e.target.value);
															setFormData(p => ({ ...p, rewards: r }));
														}}
														className='w-full text-xs'
													/>
												</div>

												<Button
													type='button'
													variant='ghost'
													className='text-red-500 hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg shrink-0 transition-colors'
													onClick={() => {
														const r = [...formData.rewards];
														r[pIdx].items.splice(iIdx, 1);
														setFormData(p => ({ ...p, rewards: r }));
													}}
												>
													<Trash2 size={16} />
												</Button>
											</div>
										</div>
									);
								})}
								{(!rewardPacket.items || rewardPacket.items.length === 0) && (
									<p className='text-xs text-text-secondary italic text-center py-4 bg-surface-hover/20 rounded-xl border border-dashed border-border/50'>
										Gói này chưa có vật phẩm nào. Bấm "Vật phẩm" để bổ sung.
									</p>
								)}
							</div>
						</div>
					);
				})}
			</div>
		</section>
	);
};

export default MapRewardsSection;
