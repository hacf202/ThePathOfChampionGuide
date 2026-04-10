// src/components/comment/latestComments.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Send,
	MessageSquare,
	User,
	Loader2,
	MapPin,
	ExternalLink,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/button";
import Modal from "../common/modal";
import { useTranslation } from "../../hooks/useTranslation";

const BuildLocation = ({ buildId, championName }) => {
	const { tUI } = useTranslation();
	if (buildId === "global") {
		return (
			<span className='inline-flex items-center gap-1 text-[10px] bg-surface-hover text-text-secondary px-2 py-0.5 rounded-full border border-border ml-2'>
				<MapPin size={10} /> {tUI("comments.globalComment")}
			</span>
		);
	}
	return (
		<Link
			to={`/builds/detail/${buildId}`}
			className='inline-flex items-center gap-1 text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full border border-primary-500/20 ml-2 hover:bg-primary-500/20'
		>
			<ExternalLink size={10} /> {tUI("comments.buildLabel")}{" "}
			{championName || buildId}
		</Link>
	);
};

const CommentForm = ({
	initialValue = "",
	onCommentPosted,
	parentId = null,
	buildId = "global",
	championName = null,
	replyToUsername = null,
	onCancel,
	isEdit = false,
	commentId = null,
}) => {
	const { tUI } = useTranslation();
	const { user, token } = useAuth();
	const [content, setContent] = useState(initialValue);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const navigate = useNavigate();

	const handleSubmit = async e => {
		e.preventDefault();
		if (!content.trim()) return;
		setIsSubmitting(true);
		const apiUrl = import.meta.env.VITE_API_URL;

		try {
			let res;
			if (isEdit) {
				res = await fetch(`${apiUrl}/api/comments/${commentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: content.trim(), buildId }),
				});
			} else {
				res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						content: content.trim(),
						parentId,
						championName,
					}),
				});
			}

			const data = await res.json();
			if (res.ok) {
				if (onCommentPosted) onCommentPosted(data);
				if (onCancel) onCancel();
				if (!isEdit) setContent("");
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<div className='flex items-center justify-between bg-surface-hover p-4 rounded-xl border border-border'>
				<div className='flex items-center gap-3 text-text-secondary text-sm'>
					<User size={18} /> <span>{tUI("comments.loginToComment")}</span>
				</div>
				<Button size='sm' onClick={() => navigate("/auth?mode=login")}>
					{tUI("common.login")}
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='relative'>
			<div className='flex items-start gap-3 bg-input-bg border border-input-border rounded-xl p-3 transition-all'>
				<div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 text-sm'>
					{user.name?.charAt(0).toUpperCase() || "U"}
				</div>
				<div className='flex-1 flex flex-col'>
					<textarea
						value={content}
						onChange={e => setContent(e.target.value)}
						placeholder={
							replyToUsername
								? `@${replyToUsername} ...`
								: tUI("comments.writeComment")
						}
						className='w-full bg-transparent border-none focus:ring-0 text-text-primary text-sm resize-none min-h-[44px]'
						rows={Math.min(5, content.split("\n").length || 1)}
					/>
					<div className='flex justify-end gap-2 mt-1'>
						{onCancel && (
							<button
								type='button'
								onClick={onCancel}
								className='text-xs text-text-secondary hover:text-text-primary px-2'
							>
								{tUI("common.cancel")}
							</button>
						)}
						<button
							type='submit'
							disabled={isSubmitting || !content.trim()}
							className={`p-1.5 rounded-lg ${content.trim() ? "bg-primary-500 text-white" : "bg-surface-hover text-text-secondary cursor-not-allowed"}`}
						>
							{isSubmitting ? (
								<Loader2 size={16} className='animate-spin' />
							) : (
								<Send size={16} />
							)}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
};

const CommentItem = ({ comment, onDeleted, onUpdated, onPosted }) => {
	const { language, tUI } = useTranslation();
	const { user, token } = useAuth();
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	// Kiểm tra quyền sở hữu an toàn
	const isOwner = user && user.sub === (comment.sub || comment.user_sub);

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}?buildId=${comment.buildId}`,
				{
					method: "DELETE",
					headers: { Authorization: `Bearer ${token}` },
				},
			);
			if (res.ok) {
				onDeleted(comment.id);
				setShowDeleteModal(false);
			}
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className='py-4'>
			<div className='flex gap-3'>
				<div className='w-8 h-8 rounded-full bg-surface-hover flex items-center justify-center text-text-primary font-bold shrink-0 border border-border'>
					{comment.username?.charAt(0).toUpperCase()}
				</div>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 mb-1 flex-wrap'>
						<span className='font-bold text-text-primary text-sm'>
							{comment.username}
						</span>
						<span className='text-[10px] text-text-secondary'>
							{new Date(comment.createdAt).toLocaleString(
								language === "vi" ? "vi-VN" : "en-US",
							)}
						</span>
						{!comment.parentId && (
							<BuildLocation
								buildId={comment.buildId}
								championName={comment.championName}
							/>
						)}
					</div>

					{isEditing ? (
						<CommentForm
							initialValue={comment.content}
							isEdit={true}
							commentId={comment.id}
							buildId={comment.buildId}
							onCommentPosted={u => {
								setIsEditing(false);
								onUpdated(u);
							}}
							onCancel={() => setIsEditing(false)}
						/>
					) : (
						<p className='text-sm text-text-secondary whitespace-pre-wrap break-words leading-relaxed'>
							{comment.content}
							{comment.isEdited && (
								<span className='text-[10px] opacity-70 italic ml-2'>
									({tUI("comments.edited")})
								</span>
							)}
						</p>
					)}

					{!isEditing && (
						<div className='flex items-center gap-3 mt-2'>
							<button
								onClick={() => setIsReplying(!isReplying)}
								className='text-xs text-text-secondary hover:text-primary-500 flex items-center gap-1'
							>
								<MessageSquare size={12} /> {tUI("comments.replyBtn")}
							</button>
							{isOwner && (
								<>
									<button
										onClick={() => setIsEditing(true)}
										className='text-xs text-text-secondary hover:text-primary-500'
									>
										{tUI("common.edit")}
									</button>
									<button
										onClick={() => setShowDeleteModal(true)}
										className='text-xs text-text-secondary hover:text-danger-500'
									>
										{tUI("common.delete")}
									</button>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			{isReplying && (
				<div className='ml-11 mt-3'>
					<CommentForm
						buildId={comment.buildId}
						parentId={comment.id}
						replyToUsername={comment.username}
						onCommentPosted={c => {
							setIsReplying(false);
							onPosted(c);
						}}
						onCancel={() => setIsReplying(false)}
					/>
				</div>
			)}

			{comment.replies && comment.replies.length > 0 && (
				<div className='ml-5 pl-5 mt-3 border-l-2 border-border space-y-3'>
					{comment.replies.map(reply => (
						<CommentItem
							key={reply.id}
							comment={reply}
							onDeleted={onDeleted}
							onUpdated={onUpdated}
							onPosted={onPosted}
						/>
					))}
				</div>
			)}

			<Modal
				isOpen={showDeleteModal}
				onClose={() => !isDeleting && setShowDeleteModal(false)}
				title={tUI("comments.deleteConfirmTitle")}
			>
				<p className='text-text-secondary mb-6 text-sm'>
					{tUI("comments.deleteWarning")}
				</p>
				<div className='flex justify-end gap-3'>
					<Button
						variant='ghost'
						onClick={() => setShowDeleteModal(false)}
						disabled={isDeleting}
					>
						{tUI("common.cancel")}
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting ? (
							<Loader2 className='animate-spin' size={16} />
						) : (
							tUI("common.delete")
						)}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

const LatestComments = ({ championID = null }) => {
	const { tUI } = useTranslation();
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [nextKey, setNextKey] = useState(null);

	const fetchLatest = useCallback(
		async (isLoadMore = false) => {
			setLoading(!isLoadMore);
			try {
				let url = `${import.meta.env.VITE_API_URL}/api/comments/latest?limit=15`;
				if (championID) url += `&championID=${championID}`;
				if (isLoadMore && nextKey)
					url += `&lastKey=${encodeURIComponent(JSON.stringify(nextKey))}`;

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();
					setComments(prev =>
						isLoadMore ? [...prev, ...data.comments] : data.comments,
					);
					setNextKey(data.nextKey);
				}
			} finally {
				setLoading(false);
			}
		},
		[championID, nextKey],
	);

	useEffect(() => {
		fetchLatest();
	}, [championID]);

	const commentTree = useMemo(() => {
		const map = {};
		const roots = [];
		comments.forEach(c => (map[c.id] = { ...c, replies: [] }));
		comments.forEach(c => {
			if (c.parentId && map[c.parentId])
				map[c.parentId].replies.push(map[c.id]);
			else roots.push(map[c.id]);
		});
		return roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, [comments]);

	return (
		<div className='mt-4 border-t border-border pt-4 font-secondary'>
			<h2 className='text-xl sm:text-2xl font-bold mb-4 text-text-primary border-l-4 border-primary-500 pl-4 uppercase'>
				{tUI("comments.communityDiscussions")}
			</h2>
			<div className='bg-surface-bg rounded-xl p-1 sm:p-6 shadow-sm'>
				<CommentForm onCommentPosted={c => setComments(p => [c, ...p])} />
				{loading ? (
					<div className='flex justify-center py-10'>
						<Loader2 className='animate-spin text-primary-500' />
					</div>
				) : (
					<div className='divide-y divide-border mt-6'>
						{commentTree.map(root => (
							<CommentItem
								key={root.id}
								comment={root}
								onDeleted={id =>
									setComments(p =>
										p.filter(c => c.id !== id && c.parentId !== id),
									)
								}
								onUpdated={u =>
									setComments(p => p.map(c => (c.id === u.id ? u : c)))
								}
								onPosted={c => setComments(p => [c, ...p])}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default LatestComments;
