// src/components/build/commentsSection.jsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { Edit, Trash2, MessageSquare } from "lucide-react";
import Modal from "../common/modal.jsx";
import Button from "../common/button.jsx";
import { useTranslation } from "../../hooks/useTranslation"; // 🟢 Import Hook

// --- Form viết bình luận ---
const CommentForm = ({
	buildId,
	onCommentPosted,
	parentId = null,
	replyToUsername = null,
	onCancel,
}) => {
	const { language } = useTranslation(); // 🟢
	const { user, token } = useAuth();
	const [content, setContent] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState("");
	const apiUrl = import.meta.env.VITE_API_URL;

	const handleKeyDown = e => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	const handleSubmit = async e => {
		e.preventDefault();
		if (!content.trim()) return;
		if (!user) {
			setError(
				language === "vi"
					? "Bạn cần đăng nhập để bình luận."
					: "You must be logged in to comment.",
			);
			return;
		}

		setIsSubmitting(true);
		setError("");

		try {
			const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content: content.trim(), parentId }),
			});

			const errData = await res.json();
			if (!res.ok)
				throw new Error(
					errData.error ||
						(language === "vi"
							? "Gửi bình luận thất bại"
							: "Failed to post comment"),
				);

			setContent("");
			if (onCommentPosted) onCommentPosted(errData.comment || errData);
			if (onCancel) onCancel();
		} catch (err) {
			setError(err.message);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className='mb-6'>
			<textarea
				className='w-full p-3 sm:p-4 bg-input-bg border border-input-border rounded-xl text-sm sm:text-base text-text-primary focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 resize-none transition-all'
				rows={parentId ? 2 : 3}
				placeholder={
					replyToUsername
						? `${language === "vi" ? "Trả lời" : "Reply to"} @${replyToUsername}...`
						: language === "vi"
							? "Viết bình luận của bạn..."
							: "Write your comment..."
				}
				value={content}
				onChange={e => setContent(e.target.value)}
				onKeyDown={handleKeyDown}
				disabled={isSubmitting}
			/>
			{error && (
				<p className='text-danger-500 text-xs sm:text-sm mt-1'>{error}</p>
			)}
			<div className='flex justify-end gap-2 mt-2'>
				{onCancel && (
					<Button
						type='button'
						variant='ghost'
						onClick={onCancel}
						disabled={isSubmitting}
						className='text-xs sm:text-sm px-3 py-1.5'
					>
						{language === "vi" ? "Hủy" : "Cancel"}
					</Button>
				)}
				<Button
					type='submit'
					variant='primary'
					disabled={isSubmitting || !content.trim()}
					className='text-xs sm:text-sm px-4 py-1.5'
				>
					{isSubmitting
						? language === "vi"
							? "Đang gửi..."
							: "Sending..."
						: replyToUsername
							? language === "vi"
								? "Trả lời"
								: "Reply"
							: language === "vi"
								? "Gửi bình luận"
								: "Post Comment"}
				</Button>
			</div>
		</form>
	);
};

// --- Hiển thị từng bình luận ---
const CommentItem = ({
	comment,
	buildId,
	onCommentDeleted,
	onCommentUpdated,
	onCommentPosted,
}) => {
	const { language } = useTranslation(); // 🟢
	const { user, token } = useAuth();
	const apiUrl = import.meta.env.VITE_API_URL;
	const isOwner = user && user.sub === comment.sub;

	const [isReplying, setIsReplying] = useState(false);
	const [isEditing, setIsEditing] = useState(false);
	const [editContent, setEditContent] = useState(comment.content);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);

	const timeString = new Date(comment.createdAt).toLocaleString(
		language === "vi" ? "vi-VN" : "en-US",
	);

	const handleEdit = async () => {
		if (!editContent.trim() || editContent === comment.content) {
			setIsEditing(false);
			return;
		}
		setIsSubmitting(true);
		try {
			const res = await fetch(`${apiUrl}/api/comments/${comment.id}`, {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ content: editContent.trim() }),
			});
			if (res.ok) {
				const updated = await res.json();
				onCommentUpdated(updated.comment || updated);
				setIsEditing(false);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async () => {
		setIsDeleting(true);
		try {
			const res = await fetch(`${apiUrl}/api/comments/${comment.id}`, {
				method: "DELETE",
				headers: { Authorization: `Bearer ${token}` },
			});
			if (res.ok) {
				onCommentDeleted(comment.id);
				setShowDeleteModal(false);
			}
		} catch (err) {
			console.error(err);
		} finally {
			setIsDeleting(false);
		}
	};

	return (
		<div className='py-4'>
			<div className='flex gap-3 sm:gap-4'>
				<div className='w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm sm:text-base shrink-0'>
					{comment.username?.charAt(0).toUpperCase()}
				</div>
				<div className='flex-1 min-w-0'>
					<div className='flex items-center gap-2 mb-1 flex-wrap'>
						<span className='font-bold text-text-primary text-sm sm:text-base'>
							{comment.username}
						</span>
						<span className='text-[10px] sm:text-xs text-text-secondary'>
							{timeString}
						</span>
						{comment.isEdited && (
							<span className='text-[10px] sm:text-xs text-text-secondary italic'>
								({language === "vi" ? "đã chỉnh sửa" : "edited"})
							</span>
						)}
					</div>

					{isEditing ? (
						<div className='mt-2'>
							<textarea
								className='w-full p-2 sm:p-3 bg-input-bg border border-primary-500 rounded-lg text-sm sm:text-base text-text-primary focus:outline-none resize-none'
								rows={2}
								value={editContent}
								onChange={e => setEditContent(e.target.value)}
							/>
							<div className='flex gap-2 mt-2'>
								<Button
									onClick={handleEdit}
									disabled={isSubmitting}
									className='text-xs px-3 py-1'
								>
									{isSubmitting
										? language === "vi"
											? "Đang lưu..."
											: "Saving..."
										: language === "vi"
											? "Lưu"
											: "Save"}
								</Button>
								<Button
									variant='ghost'
									onClick={() => {
										setIsEditing(false);
										setEditContent(comment.content);
									}}
									className='text-xs px-3 py-1'
								>
									{language === "vi" ? "Hủy" : "Cancel"}
								</Button>
							</div>
						</div>
					) : (
						<p className='text-sm sm:text-base text-text-secondary whitespace-pre-wrap break-words leading-relaxed'>
							{comment.content}
						</p>
					)}

					{!isEditing && (
						<div className='flex items-center gap-4 mt-2'>
							{user && (
								<button
									onClick={() => setIsReplying(!isReplying)}
									className='text-xs sm:text-sm text-text-secondary hover:text-primary-500 font-medium transition-colors'
								>
									{language === "vi" ? "Trả lời" : "Reply"}
								</button>
							)}
							{isOwner && (
								<>
									<button
										onClick={() => setIsEditing(true)}
										className='text-text-secondary hover:text-primary-500 transition-colors'
									>
										<Edit size={14} />
									</button>
									<button
										onClick={() => setShowDeleteModal(true)}
										className='text-text-secondary hover:text-danger-500 transition-colors'
									>
										<Trash2 size={14} />
									</button>
								</>
							)}
						</div>
					)}
				</div>
			</div>

			{isReplying && (
				<div className='ml-11 sm:ml-14 mt-3'>
					<CommentForm
						buildId={buildId}
						parentId={comment.id}
						replyToUsername={comment.username}
						onCommentPosted={c => {
							setIsReplying(false);
							onCommentPosted(c);
						}}
						onCancel={() => setIsReplying(false)}
					/>
				</div>
			)}

			{comment.replies && comment.replies.length > 0 && (
				<div className='ml-6 sm:ml-10 mt-2 border-l-2 border-border pl-3 sm:pl-4 space-y-2'>
					{comment.replies.map(reply => (
						<CommentItem
							key={reply.id}
							comment={reply}
							buildId={buildId}
							onCommentDeleted={onCommentDeleted}
							onCommentUpdated={onCommentUpdated}
							onCommentPosted={onCommentPosted}
						/>
					))}
				</div>
			)}

			<Modal
				isOpen={showDeleteModal}
				onClose={() => !isDeleting && setShowDeleteModal(false)}
				title={language === "vi" ? "Xác nhận xóa" : "Confirm Deletion"}
			>
				<p className='text-text-secondary mb-6 text-sm sm:text-base'>
					{language === "vi"
						? "Bạn có chắc chắn muốn xóa bình luận này không?"
						: "Are you sure you want to delete this comment?"}
				</p>
				<div className='flex justify-end gap-3'>
					<Button
						variant='ghost'
						onClick={() => setShowDeleteModal(false)}
						disabled={isDeleting}
					>
						{language === "vi" ? "Hủy" : "Cancel"}
					</Button>
					<Button variant='danger' onClick={handleDelete} disabled={isDeleting}>
						{isDeleting
							? language === "vi"
								? "Đang xóa..."
								: "Deleting..."
							: language === "vi"
								? "Xóa"
								: "Delete"}
					</Button>
				</div>
			</Modal>
		</div>
	);
};

// --- Main Section ---
const CommentsSection = ({ buildId }) => {
	const { language } = useTranslation(); // 🟢
	const [comments, setComments] = useState([]);
	const [loadingComments, setLoadingComments] = useState(true);
	const apiUrl = import.meta.env.VITE_API_URL;

	useEffect(() => {
		const fetchComments = async () => {
			if (!buildId) return;
			try {
				const res = await fetch(`${apiUrl}/api/builds/${buildId}/comments`);
				if (res.ok) {
					const data = await res.json();
					setComments(data.items || data);
				}
			} catch (err) {
				console.error(err);
			} finally {
				setLoadingComments(false);
			}
		};
		fetchComments();
	}, [buildId, apiUrl]);

	const rootComments = useMemo(() => {
		const map = {};
		const roots = [];
		comments.forEach(c => (map[c.id] = { ...c, replies: [] }));
		comments.forEach(c => {
			if (c.parentId && map[c.parentId]) {
				map[c.parentId].replies.push(map[c.id]);
			} else {
				roots.push(map[c.id]);
			}
		});
		return roots.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
	}, [comments]);

	const handlePosted = c => setComments(p => [...p, c]);
	const handleDeleted = id =>
		setComments(p => p.filter(c => c.id !== id && c.parentId !== id));
	const handleUpdated = c =>
		setComments(p => p.map(x => (x.id === c.id ? c : x)));

	return (
		<div className='mt-10'>
			<h2 className='text-xl sm:text-2xl font-bold mb-6 text-text-primary border-l-4 border-primary-500 pl-4'>
				{language === "vi" ? "Bình luận" : "Comments"} ({comments.length})
			</h2>

			<div className='bg-surface-bg rounded-xl border border-border p-4 sm:p-6 shadow-sm'>
				<CommentForm buildId={buildId} onCommentPosted={handlePosted} />

				{loadingComments ? (
					<div className='flex justify-center py-10'>
						<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500'></div>
					</div>
				) : rootComments.length === 0 ? (
					<div className='text-center py-10 opacity-60'>
						<MessageSquare size={48} className='mx-auto mb-3' />
						<p>
							{language === "vi"
								? "Chưa có bình luận nào. Hãy là người đầu tiên!"
								: "No comments yet. Be the first to comment!"}
						</p>
					</div>
				) : (
					<div className='divide-y divide-border'>
						{rootComments.map(c => (
							<CommentItem
								key={c.id}
								comment={c}
								buildId={buildId}
								onCommentDeleted={handleDeleted}
								onCommentUpdated={handleUpdated}
								onCommentPosted={handlePosted}
							/>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default CommentsSection;
