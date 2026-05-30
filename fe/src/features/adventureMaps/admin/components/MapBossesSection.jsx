import React from 'react';
import { Plus, Trash2, Zap } from 'lucide-react';
import Button from '@/components/common/button';
import InputField from '@/components/common/inputField';
import { DragDropArrayInput, getUniqueAdvId, getAdvName, getAdvImage } from '@/features/adventureMaps/admin/adventureEditorHelpers';

const MapBossesSection = ({ formData, setFormData, cachedData }) => {
	return (
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
							Bosses: [
								...(p.Bosses || []),
								{ bossID: "", note: "", mapBonusPower: [] },
							],
						}))
					}
				>
					<Plus size={16} className='mr-1' /> Thêm Boss
				</Button>
			</div>

			<div className='flex flex-col gap-5'>
				{(formData.Bosses || []).map((b, i) => {
					const safeBossID = (b.bossID || "").trim();
					const resolvedBoss =
						(cachedData.bosses || []).find(
							cb => getUniqueAdvId(cb) === safeBossID,
						) || {};
					const isResolvedBoss = !!getUniqueAdvId(resolvedBoss);
					const displayBossID = isResolvedBoss
						? getAdvName(resolvedBoss)
						: b.bossID || "";
					const bossAvatar = getAdvImage(resolvedBoss);
					const bossPowers = Array.isArray(resolvedBoss.power)
						? resolvedBoss.power
						: resolvedBoss.power
							? [resolvedBoss.power]
							: [];

					return (
						<div
							key={i}
							className='bg-surface-bg p-5 rounded-lg border border-border shadow-md flex flex-col lg:flex-row gap-6 relative'
						>
							<div
								className='w-full lg:w-1/4 flex flex-col gap-4 lg:border-r lg:border-border lg:pr-6 p-2 -m-2 rounded-lg border-2 border-transparent hover:border-dashed hover:border-red-500/30 transition-all'
								onDrop={e => {
									e.preventDefault();
									e.stopPropagation();
									try {
										constged = JSON.parse(
											e.dataTransfer.getData("text/plain"),
										);
										const identifier =
											getUniqueAdvId(dragged) ||ged.name;
										if (identifier) {
											const arr = [...formData.Bosses];
											arr[i].bossID = identifier.trim();
											setFormData(p => ({ ...p, Bosses: arr }));
										}
									} catch (err) {
										console.warn("Drag data không hợp lệ", err);
									}
								}}
								onDragOver={e => e.preventDefault()}
							>
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

								<div className='flex flex-col gap-2'>
									<label className='block font-semibold text-[10px] uppercase text-text-secondary tracking-widest'>
										Mã Boss (Kéo thả vào khu vực này)
									</label>
									<div className='flex items-center gap-3 bg-surface-hover p-2 rounded-lg border border-border pointer-events-none'>
										<div className='w-10 h-10 rounded bg-white border flex items-center justify-center overflow-hidden shrink-0'>
											{bossAvatar ? (
												<img
													src={bossAvatar}
													className='w-full h-full object-contain'
													alt="boss avatar"
												/>
											) : (
												<span className='text-[10px] text-gray-500 font-bold'>
													D&D
												</span>
											)}
										</div>
										<InputField
											placeholder='ID Boss...'
											value={displayBossID}
											onChange={e => {
												const arr = [...formData.Bosses];
												arr[i].bossID = e.target.value;
												setFormData(p => ({ ...p, Bosses: arr }));
											}}
											readOnly={isResolvedBoss}
											className={`flex-1 pointer-events-auto ${isResolvedBoss ? "font-bold text-red-500" : ""}`}
											title={
												isResolvedBoss
													? `ID thực tế được lưu trữ: ${b.bossID}`
													: ""
											}
										/>
									</div>
								</div>

								{isResolvedBoss && (
									<div className='flex flex-col gap-2 mt-1'>
										<label className='block font-semibold text-[10px] uppercase text-text-secondary tracking-widest flex items-center gap-1.5'>
											<Zap size={12} className='text-yellow-500' /> Sức
											mạnh gốc của Boss
										</label>
										{bossPowers.length > 0 ? (
											<div className='flex flex-wrap gap-2'>
												{bossPowers.map((powerId, pIdx) => {
													const powerObj = (cachedData.powers || []).find(
														p =>
															(p.powerCode || p.id || p._id) === powerId,
													);
													const pName = powerObj
														? powerObj.name ||
															powerObj.powerName ||
															powerId
														: powerId;
													const pIcon = powerObj
														? powerObj.assetAbsolutePath ||
															powerObj.assetFullAbsolutePath
														: null;
													return (
														<div
															key={pIdx}
															className='flex items-center gap-1.5 bg-yellow-500/10 border border-yellow-500/30 px-2 py-1.5 rounded-md shadow-sm'
															title={powerId}
														>
															{pIcon ? (
																<img
																	src={pIcon}
																	className='w-5 h-5 object-contain'
																	alt='power'
																/>
															) : (
																<div className='w-5 h-5 bg-yellow-500/20 rounded flex items-center justify-center shrink-0'>
																	<Zap
																		size={12}
																		className='text-yellow-600 dark:text-yellow-500'
																	/>
																</div>
															)}
															<span className='text-xs font-semibold text-yellow-700 dark:text-yellow-500 truncate max-w-[120px]'>
																{pName}
															</span>
														</div>
													);
												})}
											</div>
										) : (
											<span className='text-xs text-text-secondary italic px-1'>
												Không có sức mạnh
											</span>
										)}
									</div>
								)}
							</div>

							<div className='w-full lg:w-3/4 flex flex-col gap-4'>
								<div className='flex flex-col flex-1'>
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

								<div className='bg-yellow-500/5 p-4 rounded-xl border border-yellow-500/30 border-dashed mt-2'>
									<DragDropArrayInput
										label={`Bonus Power (Sức mạnh bổ sung riêng cho Boss này)`}
										data={b.mapBonusPower || []}
										onChange={arr => {
											const newBosses = [...formData.Bosses];
											newBosses[i].mapBonusPower = arr;
											setFormData(p => ({ ...p, Bosses: newBosses }));
										}}
										cachedList={cachedData.powers || []}
										placeholder='Kéo thả ID Power vào đây...'
									/>
								</div>
							</div>
						</div>
					);
				})}
				{(!formData.Bosses || formData.Bosses.length === 0) && (
					<div className='text-center py-10 text-text-secondary bg-surface-bg rounded-lg border border-dashed border-border'>
						Chưa có Boss nào. Hãy bấm "Thêm Boss" để bắt đầu.
					</div>
				)}
			</div>
		</section>
	);
};

export default MapBossesSection;
