import React, { useState, memo, useEffect } from "react";
import Button from "@/components/common/button";
import MapBasicInfoSection from "@/features/adventureMaps/admin/components/MapBasicInfoSection";
import MapRequirementsSection from "@/features/adventureMaps/admin/components/MapRequirementsSection";
import MapSpecialBlocksSection from "@/features/adventureMaps/admin/components/MapSpecialBlocksSection";
import MapBossesSection from "@/features/adventureMaps/admin/components/MapBossesSection";
import MapNodesEditorSection from "@/features/adventureMaps/admin/components/MapNodesEditorSection";
import MapRewardsSection from "@/features/adventureMaps/admin/components/MapRewardsSection";

const AdventureMapEditorForm = memo(
	({ item, cachedData, onSave, onCancel, onDelete, isSaving }) => {
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
				if (!cloned.specialBlocks) cloned.specialBlocks = [];
				if (!cloned.requirement)
					cloned.requirement = { champions: [], regions: [] };

				cloned.Bosses = cloned.Bosses.map(b => ({
					...b,
					mapBonusPower: b.mapBonusPower || [],
				}));

				setFormData(cloned);
			}
		}, [item]);

		const requirementChampsLength = formData.requirement?.champions?.length || 0;
		const requirementRegionsLength = formData.requirement?.regions?.length || 0;

		useEffect(() => {
			if (!formData.requirement) return;
			const reqCount = requirementChampsLength + requirementRegionsLength;
			const targetCount = reqCount === 0 ? 1 : reqCount;
			const currentRewards = formData.rewards || [];

			if (currentRewards.length !== targetCount) {
				setFormData(prev => {
					let newRewards = [...(prev.rewards || [])];
					if (newRewards.length < targetCount) {
						while (newRewards.length < targetCount) {
							newRewards.push({ items: [] });
						}
					} else if (newRewards.length > targetCount) {
						newRewards = newRewards.slice(0, targetCount);
					}
					return { ...prev, rewards: newRewards };
				});
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [requirementChampsLength, requirementRegionsLength]);

		const handleSubmit = e => {
			e.preventDefault();
			onSave(formData);
		};

		return (
			<form onSubmit={handleSubmit} className='space-y-6 pb-20'>
				<div className='flex justify-between items-center border-b border-border p-4 sticky top-0 bg-surface-bg z-30 shadow-sm'>
					<h2 className='text-xl font-bold text-primary-500'>
						{formData.isNew
							? "Tạo Bản Đồ Mới"
							: `Biên tập: ${formData.adventureName || ""}`}
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
					<MapBasicInfoSection 
						formData={formData} 
						setFormData={setFormData} 
					/>

					<MapRequirementsSection 
						formData={formData} 
						setFormData={setFormData} 
						cachedData={cachedData} 
					/>

					<MapSpecialBlocksSection 
						formData={formData} 
						setFormData={setFormData} 
						cachedData={cachedData} 
					/>

					<MapBossesSection 
						formData={formData} 
						setFormData={setFormData} 
						cachedData={cachedData} 
					/>

					<MapNodesEditorSection 
						formData={formData} 
						setFormData={setFormData} 
						cachedData={cachedData} 
					/>

					<MapRewardsSection 
						formData={formData} 
						setFormData={setFormData} 
						cachedData={cachedData} 
					/>
				</div>
			</form>
		);
	},
);

export default AdventureMapEditorForm;
