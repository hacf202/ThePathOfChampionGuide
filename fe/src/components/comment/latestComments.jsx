// src/components/comment/latestComments.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
	Send,
	MessageSquare,
	User,
	Loader2,
	Edit,
	Trash2,
	MapPin,
	ExternalLink,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Button from "../common/button";
import Modal from "../common/modal";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook Đa ngôn ngữ

// --- Hiển thị vị trí bình luận (Champion hoặc Global) ---
const BuildLocation = ({ buildId, championName }) => {
	const { tUI } = useTranslation(); // 🟢

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
			className='inline-flex items-center gap-1 text-[10px] bg-primary-500/10 text-primary-500 px-2 py-0.5 rounded-full border border-primary-500/20 ml-2 hover:bg-primary-500/20 transition-colors'
		>
			<ExternalLink size={10} /> {tUI("comments.buildLabel")}{" "}
			{championName || buildId}
		</Link>
	);
};

// --- Form Thêm / Sửa Bình luận ---
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
	const { tUI } = useTranslation(); // 🟢
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
			let res, data;
			if (isEdit) {
				res = await fetch(`${apiUrl}/api/comments/${commentId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ content: content.trim() }),
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

			data = await res.json();
			if (res.ok) {
				setContent("");
				if (onCommentPosted) onCommentPosted(data.comment || data);
				if (onCancel) onCancel();
			} else {
				console.error("Error:", data.error);
			}
		} catch (err) {
			console.error("Submit error:", err);
		} finally {
			setIsSubmitting(false);
		}
	};

	if (!user) {
		return (
			<div className='flex items-center justify-between bg-surface-hover p-3 sm:p-4 rounded-xl border border-border'>
				<div className='flex items-center gap-3 text-text-secondary text-sm'>
					<User size={18} />
					<span>{tUI("comments.loginToComment")}</span>
				</div>
				<Button size='sm' onClick={() => navigate("/auth")}>
					{tUI("common.login")}
				</Button>
			</div>
		);
	}

	return (
		<form onSubmit={handleSubmit} className='relative'>
			<div className='flex items-start gap-3 bg-input-bg border border-input-border rounded-xl p-2 sm:p-3 focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-all'>
				<div className='w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold shrink-0 mt-1 text-sm'>
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
						className='w-full bg-transparent border-none focus:ring-0 text-text-primary text-sm resize-none p-1 min-h-[44px]'
						rows={Math.min(5, content.split("\n").length || 1)}
						onKeyDown={e => {
							if (e.key === "Enter" && !e.shiftKey) {
								e.preventDefault();
								handleSubmit(e);
							}
						}}
					/>
					<div className='flex justify-end gap-2 mt-1'>
						{onCancel && (
							<button
								type='button'
								onClick={onCancel}
								className='text-xs text-text-secondary hover:text-text-primary px-2 py-1'
							>
								{tUI("common.cancel")}
							</button>
						)}
						<button
							type='submit'
							disabled={isSubmitting || !content.trim()}
							className={`p-1.5 rounded-lg transition-colors ${
								content.trim()
									? "bg-primary-500 text-white hover:bg-primary-600"
									: "bg-surface-hover text-text-secondary cursor-not-allowed"
							}`}
						>
							{isSubmitting ? (
								<Loader2 size={16} className='animate-spin' />
							) : (
								<Send size={16} className='translate-x-0.5 -translate-y-0.5' />
							)}
						</button>
					</div>
				</div>
			</div>
		</form>
	);
};

// --- Thành phần hiển thị 1 Comment ---
const CommentItem = ({ comment, onDeleted, onUpdated, onPosted }) => {
	const { language, tUI } = useTranslation(); // 🟢
	const { user, token } = useAuth();
	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const isOwner = user?.sub === comment.sub;

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(
				`${import.meta.env.VITE_API_URL}/api/comments/${comment.id}`,
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

	const handleAction = action => {
		if (!user) {
			alert(tUI("buildSummary.loginPrompt"));
			return;
		}
		action();
	};

	return (
		<div className='py-3 sm:py-4'>
			<div className='flex gap-3'>
				<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-surface-hover to-border flex items-center justify-center text-text-primary font-bold shrink-0 text-sm sm:text-base border border-border'>
					{comment.username?.charAt(0).toUpperCase()}
				</div>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 mb-0.5 flex-wrap'>
						<span className='font-bold text-text-primary text-sm sm:text-base truncate max-w-[150px] sm:max-w-xs'>
							{comment.username}
						</span>
						<span className='text-[10px] sm:text-xs text-text-secondary whitespace-nowrap'>
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
						<div className='mt-2'>
							<CommentForm
								initialValue={comment.content}
								isEdit={true}
								commentId={comment.id}
								onCommentPosted={updated => {
									setIsEditing(false);
									onUpdated(updated);
								}}
								onCancel={() => setIsEditing(false)}
							/>
						</div>
					) : (
						<p className='text-sm sm:text-[15px] text-text-secondary whitespace-pre-wrap break-words leading-relaxed mt-1'>
							{comment.content}
							{comment.isEdited && (
								<span className='text-[10px] text-text-secondary opacity-70 italic ml-2'>
									({tUI("comments.edited")})
								</span>
							)}
						</p>
					)}

					{!isEditing && (
						<div className='flex items-center gap-3 mt-2'>
							<button
								onClick={() => handleAction(() => setIsReplying(!isReplying))}
								className='text-xs font-medium text-text-secondary hover:text-primary-500 transition-colors flex items-center gap-1'
							>
								<MessageSquare size={12} /> {tUI("comments.replyBtn")}
							</button>
							{isOwner && (
								<>
									<span className='w-1 h-1 bg-border rounded-full'></span>
									<button
										onClick={() => setIsEditing(true)}
										className='text-xs text-text-secondary hover:text-primary-500 transition-colors'
									>
										{tUI("common.edit")}
									</button>
									<span className='w-1 h-1 bg-border rounded-full'></span>
									<button
										onClick={() => setShowDeleteModal(true)}
										className='text-xs text-text-secondary hover:text-danger-500 transition-colors'
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
				<div className='ml-11 sm:ml-13 mt-3 relative before:absolute before:-left-5 before:top-0 before:w-4 before:h-4 before:border-l-2 before:border-b-2 before:border-border before:rounded-bl-xl'>
					<CommentForm
						buildId={comment.buildId}
						championName={comment.championName}
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
				<div className='ml-4 sm:ml-5 pl-4 sm:pl-5 mt-3 border-l-2 border-border space-y-3'>
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

// --- Main Container: Latest Comments ---
const LatestComments = ({ championID = null }) => {
	const { tUI } = useTranslation(); // 🟢
	const [comments, setComments] = useState([]);
	const [loading, setLoading] = useState(true);
	const [loadingMore, setLoadingMore] = useState(false);
	const [nextKey, setNextKey] = useState(null);

	const fetchLatest = useCallback(
		async (isLoadMore = false) => {
			if (isLoadMore) setLoadingMore(true);
			else setLoading(true);

			try {
				let url = `${import.meta.env.VITE_API_URL}/api/comments/latest?limit=15`;
				if (championID) url += `&championID=${championID}`;

				// 🟢 SỬA 1: Đổi 'lastEvaluatedKey' thành 'lastKey' để khớp với Backend req.query.lastKey
				if (isLoadMore && nextKey)
					url += `&lastKey=${encodeURIComponent(JSON.stringify(nextKey))}`;

				const res = await fetch(url);
				if (res.ok) {
					const data = await res.json();

					// 🟢 SỬA 2: Đọc đúng key 'data.comments' từ Backend gửi về
					const newComments =
						data.comments || data.items || (Array.isArray(data) ? data : []);

					setComments(prev =>
						isLoadMore ? [...(prev || []), ...newComments] : newComments,
					);

					// 🟢 SỬA 3: Đọc đúng key 'data.nextKey' từ Backend gửi về
					setNextKey(data.nextKey || data.lastEvaluatedKey || null);
				}
			} catch (error) {
				console.error("Failed to fetch comments", error);
				setComments([]); // Safe fallback on error
			} finally {
				setLoading(false);
				setLoadingMore(false);
			}
		},
		[championID, nextKey],
	);

	useEffect(() => {
		fetchLatest();
	}, [championID]);

	// Build Tree
	const commentTree = useMemo(() => {
		const map = {};
		const roots = [];
		// 🟢 FIX LỖI undefined (reading 'forEach'): Đảm bảo biến "comments" luôn là một Array hợp lệ trước khi lặp
		const safeComments = Array.isArray(comments) ? comments : [];

		safeComments.forEach(c => (map[c.id] = { ...c, replies: [] }));
		safeComments.forEach(c => {
			if (c.parentId && map[c.parentId]) {
				map[c.parentId].replies.push(map[c.id]);
			} else {
				roots.push(map[c.id]);
			}
		});

		roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		roots.forEach(root => {
			root.replies.sort(
				(a, b) => new Date(a.createdAt) - new Date(b.createdAt),
			);
		});
		return roots;
	}, [comments]);

	const handlePosted = c => setComments(p => [c, ...(p || [])]);
	const handleDeleted = id =>
		setComments(p => (p || []).filter(c => c.id !== id && c.parentId !== id));
	const handleUpdated = updated =>
		setComments(p => (p || []).map(c => (c.id === updated.id ? updated : c)));

	return (
		<div className='mt-4 border-t border-border pt-4 font-secondary'>
			<h2 className='text-xl sm:text-2xl font-bold mb-4 text-text-primary border-l-4 border-primary-500 pl-4 uppercase'>
				{tUI("comments.communityDiscussions")}
			</h2>

			<div className='bg-surface-bg rounded-xl border border-border p-2 sm:p-6 shadow-sm'>
				<CommentForm onCommentPosted={handlePosted} />

				{loading ? (
					<div className='flex justify-center py-10'>
						<Loader2 className='animate-spin text-primary-500' />
					</div>
				) : (
					<div className='divide-y divide-border mt-6'>
						{commentTree.length > 0 ? (
							<>
								{commentTree.map(root => (
									<CommentItem
										key={root.id}
										comment={root}
										onDeleted={handleDeleted}
										onUpdated={handleUpdated}
										onPosted={handlePosted}
									/>
								))}
								{nextKey && (
									<div className='flex justify-center pt-6'>
										<Button
											variant='outline'
											onClick={() => fetchLatest(true)}
											disabled={loadingMore}
										>
											{loadingMore && (
												<Loader2 className='animate-spin mr-2' size={16} />
											)}
											{tUI("comments.loadMore")}
										</Button>
									</div>
								)}
								{!nextKey && (comments || []).length >= 10 && (
									<p className='text-center text-text-secondary text-sm mt-6 italic'>
										{tUI("comments.noMoreComments")}
									</p>
								)}
							</>
						) : (
							<div className='text-center py-10 text-text-secondary'>
								<MessageSquare size={40} className='mx-auto mb-3 opacity-50' />
								<p>{tUI("comments.noComments")}</p>
							</div>
						)}
					</div>
				)}
			</div>
		</div>
	);
};

export default LatestComments;
