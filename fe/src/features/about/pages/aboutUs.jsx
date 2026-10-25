// src/pages/AboutUs.jsx
import { memo } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "@/hooks/useTranslation"; // 🟢 Import Hook

function AboutUs() {
	const { tUI } = useTranslation(); // 🟢 Sử dụng tUI

	return (
		<main className='min-h-screen bg-[var(--tactical-page-bg)] py-12 text-text-primary'>
			<div className='max-w-[960px] mx-auto px-4 sm:px-6'>
				{/* Tiêu đề */}
				<div className='text-center mb-10'>
					<div className="inline-flex items-center gap-2 px-3 py-1 clip-chamfer-sm bg-[var(--tactical-accent-lime)]/10 text-[var(--tactical-accent-lime)] text-xs font-mono-tech font-bold uppercase tracking-widest mb-3 border border-[var(--tactical-accent-lime)]/30">
						TACTICAL DOSSIER // ABOUT
					</div>
					<h1 className='text-4xl sm:text-5xl font-bold font-display uppercase tracking-tight text-text-primary mb-4'>
						{tUI("about.titlePrefix")}
						<span className='text-[var(--tactical-accent-lime)] drop-shadow-[0_0_12px_rgba(210,255,40,0.3)]'>Guide POC</span>
					</h1>
					<p
						className='text-base sm:text-lg text-text-secondary max-w-3xl mx-auto'
						dangerouslySetInnerHTML={{ __html: tUI("about.subtitle") }}
					/>
				</div>

				{/* Nội dung chính */}
				<div className='tactical-panel clip-chamfer border border-[var(--tactical-card-border)] bg-[var(--tactical-panel-bg)] p-6 sm:p-10 shadow-2xl space-y-8'>
					{/* Giới thiệu tổng quan */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<p
							className='text-base leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.intro1") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.intro2") }}
						/>
					</section>

					{/* Chúng tôi là ai */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>
								{tUI("about.whoWeAreTitle")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre2") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre3") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre4") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whoWeAre5") }}
						/>
					</section>

					{/* Chúng tôi làm gì */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-cyan)]'>
								{tUI("about.whatWeDoTitle")}
							</h2>
						</div>
						<p
							className='leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoIntro") }}
						/>
						<ol className='list-decimal pl-6 mt-4 space-y-2 font-medium text-text-secondary'>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi1") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi2") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi3") }}
							/>
							<li
								dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoLi4") }}
							/>
						</ol>
						<p
							className='mt-4 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whatWeDoOutro") }}
						/>
					</section>

					{/* Tại sao chúng tôi làm điều đó */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-lime)] shadow-[0_0_8px_var(--tactical-accent-lime)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-lime)]'>
								{tUI("about.whyWeDoItTitle")}
							</h2>
						</div>
						<p className='leading-relaxed text-text-secondary' dangerouslySetInnerHTML={{ __html: tUI("about.whyWeDoIt1") }} />
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyWeDoIt2") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyWeDoIt3") }}
						/>
					</section>

					{/* Tại sao là “Guide POC”? */}
					<section className='tactical-box clip-chamfer-sm border border-[var(--tactical-card-border)] bg-[var(--tactical-inner-box)] p-5 sm:p-6'>
						<div className='flex items-center gap-3 mb-4 border-b border-[var(--tactical-card-border)] pb-3'>
							<div className='w-1 h-5 bg-[var(--tactical-accent-cyan)] shadow-[0_0_8px_var(--tactical-accent-cyan)]' />
							<h2 className='text-xl font-bold font-display uppercase tracking-wider text-[var(--tactical-accent-cyan)]'>
								{tUI("about.whyGuidePocTitle")}
							</h2>
						</div>
						<p
							className='leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc1") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc2") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc3") }}
						/>
						<p
							className='mt-3 leading-relaxed text-text-secondary'
							dangerouslySetInnerHTML={{ __html: tUI("about.whyGuidePoc4") }}
						/>
					</section>

					{/* Call to action */}
					<section className='text-center pt-4'>
						<Link
							to='/'
							className='inline-block px-8 py-3 clip-chamfer-sm bg-[var(--tactical-accent-lime)] text-[var(--tactical-accent-lime-fg)] font-mono-tech font-bold uppercase text-xs tracking-wider shadow-[0_0_12px_rgba(210,255,40,0.3)] hover:brightness-110 transition-all'
						>
							{tUI("common.backToHome")}
						</Link>
					</section>
				</div>
			</div>
		</main>
	);
}

export default memo(AboutUs);
