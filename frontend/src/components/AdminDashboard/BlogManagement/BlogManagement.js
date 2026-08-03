import React, { useEffect, useState } from "react";
import api, { BASE_API_URL } from "../../../utils/api";
import { toast } from "react-toastify";

const BlogManagement = () => {

    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedBlogId, setSelectedBlogId] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editingBlogId, setEditingBlogId] = useState(null);

    const [formData, setFormData] = useState({
        title: "",
        slug: "",
        category: "",
        image: "",
        date: "",
        readTime: "",
        views: "",
        likes: "",
        comments: "",
        share: "",
        content: [""],
    });
    const fetchBlogs = async () => {
        setLoading(true);

        try {
            const response = await api.get(`${BASE_API_URL}/blogs`);

            console.log("BLOGS", response.data);

            setBlogs(response.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBlog = async () => {
        if (!formData.title.trim())
            return toast.error("Title is required");

        if (!formData.slug.trim())
            return toast.error("Slug is required");

        if (!formData.category.trim())
            return toast.error("Category is required");

        if (!formData.image.trim())
            return toast.error("Image URL is required");

        if (!formData.date.trim())
            return toast.error("Date is required");

        if (!formData.readTime.trim())
            return toast.error("Read Time is required");

        const filteredContent = formData.content.filter(
            (item) => item.trim() !== ""
        );

        if (filteredContent.length === 0)
            return toast.error("Please add at least one paragraph");

        setSaving(true);

        try {

            if (isEditMode) {
                await api.put(
                    `${BASE_API_URL}/blogs/${editingBlogId}`,
                    {
                        title: formData.title.trim(),
                        slug: formData.slug.trim(),
                        category: formData.category.trim(),
                        image: formData.image.trim(),
                        date: formData.date.trim(),
                        readTime: formData.readTime.trim(),

                        views: Number(formData.views || 0),
                        likes: Number(formData.likes || 0),
                        comments: Number(formData.comments || 0),
                        share: Number(formData.share || 0),

                        content: filteredContent,
                    }
                );

                toast.success("Blog updated successfully!");

            } else {

                await api.post(`${BASE_API_URL}/blogs`, {
                    title: formData.title.trim(),
                    slug: formData.slug.trim(),
                    category: formData.category.trim(),
                    image: formData.image.trim(),
                    date: formData.date.trim(),
                    readTime: formData.readTime.trim(),

                    views: Number(formData.views || 0),
                    likes: Number(formData.likes || 0),
                    comments: Number(formData.comments || 0),
                    share: Number(formData.share || 0),

                    content: filteredContent,
                });

                toast.success("Blog created successfully!");
            }

            setShowModal(false);
            setIsEditMode(false);
            setEditingBlogId(null);

            setFormData({
                title: "",
                slug: "",
                category: "",
                image: "",
                date: "",
                readTime: "",
                views: "",
                likes: "",
                comments: "",
                share: "",
                content: [""],
            });

            fetchBlogs();
        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message || "Failed to create blog"
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteBlog = async () => {
        try {
            await api.delete(`${BASE_API_URL}/blogs/${selectedBlogId}`);

            toast.success("Blog deleted successfully!");

            setShowDeleteModal(false);
            setSelectedBlogId(null);

            fetchBlogs();
        } catch (err) {
            console.error(err);

            toast.error(
                err.response?.data?.message || "Failed to delete blog"
            );
        }
    };

    useEffect(() => {
        fetchBlogs();
    }, []);

    return (
        <div
            className="container"
            style={{
                marginTop: "100px",
                marginBottom: "40px",
            }}
        >

            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Blog Management</h2>
                <button
                    className="btn btn-primary"
                    onClick={() => {

                        setIsEditMode(false);
                        setEditingBlogId(null);

                        setFormData({
                            title: "",
                            slug: "",
                            category: "",
                            image: "",
                            date: "",
                            readTime: "",
                            views: "",
                            likes: "",
                            comments: "",
                            share: "",
                            content: [""],
                        });

                        setShowModal(true);

                    }}
                >
                    + Add Blog
                </button>
            </div>

            {loading ? (
                <h5>Loading...</h5>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">

                        <thead>

                            <tr>
                                <th>#</th>
                                <th>Image</th>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Read Time</th>
                                <th>Views</th>
                                <th>Likes</th>
                                <th>Actions</th>
                            </tr>

                        </thead>

                        <tbody>

                            {blogs.map((blog, index) => (

                                <tr key={blog.id}>

                                    <td>{index + 1}</td>
                                    <td>
                                        <img
                                            src={blog.image}
                                            alt={blog.title}
                                            style={{
                                                width: "80px",
                                                height: "50px",
                                                objectFit: "cover",
                                                borderRadius: "6px",
                                                border: "1px solid #ddd",
                                            }}
                                            onError={(e) => {
                                                e.currentTarget.src =
                                                    "https://placehold.co/80x50?text=No+Image";
                                            }}
                                        />
                                    </td>
                                    <td>{blog.title}</td>

                                    <td>{blog.category}</td>

                                    <td>{blog.readTime}</td>

                                    <td>{blog.views}</td>

                                    <td>{blog.likes}</td>

                                    <td>
                                        <button
                                            className="btn btn-warning btn-sm me-2"
                                            onClick={() => {

                                                setIsEditMode(true);

                                                setEditingBlogId(blog.id);

                                                setFormData({

                                                    title: blog.title || "",
                                                    slug: blog.slug || "",
                                                    category: blog.category || "",
                                                    image: blog.image || "",
                                                    date: blog.date || "",
                                                    readTime: blog.readTime || "",

                                                    views: blog.views || "",
                                                    likes: blog.likes || "",
                                                    comments: blog.comments || "",
                                                    share: blog.share || "",

                                                    content: blog.content?.length
                                                        ? blog.content
                                                        : [""],

                                                });

                                                setShowModal(true);

                                            }}
                                        >
                                            Edit
                                        </button>

                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() => {
                                                setSelectedBlogId(blog.id);
                                                setShowDeleteModal(true);
                                            }}
                                        >
                                            Delete
                                        </button>

                                    </td>

                                </tr>

                            ))}

                        </tbody>

                    </table>

                </div>
            )}
            {showModal && (
                <div
                    className="modal d-block"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog modal-xl">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5>
                                    {isEditMode ? "Edit Blog" : "Add Blog"}
                                </h5>
                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowModal(false);
                                        setIsEditMode(false);
                                        setEditingBlogId(null);
                                    }}
                                ></button>
                            </div>

                            <div className="modal-body">
                                <div className="modal-footer">

                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => {
                                            setShowModal(false);
                                            setIsEditMode(false);
                                            setEditingBlogId(null);

                                        }}
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        className="btn btn-primary"
                                        onClick={handleCreateBlog}
                                        disabled={saving}
                                    >
                                        {saving
                                            ? "Saving..."
                                            : isEditMode
                                                ? "Update Blog"
                                                : "Save Blog"
                                        }
                                    </button>

                                </div>

                                <div className="row">

                                    <div className="col-md-6 mb-3">
                                        <label>Title</label>

                                        <input
                                            className="form-control"
                                            value={formData.title}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    title: e.target.value,
                                                })
                                            }
                                        />
                                    </div>

                                    <div className="col-md-6 mb-3">
                                        <label>Slug</label>

                                        <input
                                            className="form-control"
                                            value={formData.slug}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    slug: e.target.value,
                                                })
                                            }
                                        />
                                    </div>
                                    <div className="row">

                                        <div className="col-md-4 mb-3">
                                            <label>Category</label>
                                            <input
                                                className="form-control"
                                                value={formData.category}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        category: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <label>Image URL</label>
                                            <input
                                                className="form-control"
                                                placeholder="https://example.com/blog-image.webp"
                                                value={formData.image}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        image: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-4 mb-3">
                                            <label>Date</label>
                                            <input
                                                className="form-control"
                                                value={formData.date}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        date: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                    </div>

                                    <div className="row">

                                        <div className="col-md-3 mb-3">
                                            <label>Read Time</label>
                                            <input
                                                className="form-control"
                                                value={formData.readTime}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        readTime: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-3 mb-3">
                                            <label>Views</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.views}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        views: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-3 mb-3">
                                            <label>Likes</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.likes}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        likes: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>

                                        <div className="col-md-3 mb-3">
                                            <label>Comments</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.comments}
                                                onChange={(e) =>
                                                    setFormData({
                                                        ...formData,
                                                        comments: e.target.value,
                                                    })
                                                }
                                            />
                                        </div>
                                        <div className="row mt-3">

                                            <div className="col-md-12">

                                                <label className="fw-bold mb-3">
                                                    Blog Content
                                                </label>

                                                {formData.content.map((paragraph, index) => (

                                                    <div
                                                        key={index}
                                                        className="mb-3"
                                                    >

                                                        <label className="mb-2">
                                                            Paragraph {index + 1}
                                                        </label>

                                                        <textarea
                                                            rows={4}
                                                            className="form-control"
                                                            value={paragraph}
                                                            onChange={(e) => {

                                                                const updatedContent = [...formData.content];

                                                                updatedContent[index] = e.target.value;

                                                                setFormData({
                                                                    ...formData,
                                                                    content: updatedContent,
                                                                });

                                                            }}
                                                        />
                                                        {formData.content.length > 1 && (
                                                            <button
                                                                type="button"
                                                                className="btn btn-sm btn-danger mt-2"
                                                                onClick={() => {
                                                                    const updatedContent = formData.content.filter(
                                                                        (_, i) => i !== index
                                                                    );

                                                                    setFormData({
                                                                        ...formData,
                                                                        content: updatedContent,
                                                                    });
                                                                }}
                                                            >
                                                                Remove Paragraph
                                                            </button>
                                                        )}


                                                    </div>

                                                ))}

                                            </div>

                                        </div>
                                        <div className="mb-4">

                                            <button
                                                type="button"
                                                className="btn btn-success"
                                                onClick={() => {

                                                    setFormData({

                                                        ...formData,

                                                        content: [
                                                            ...formData.content,
                                                            "",
                                                        ],

                                                    });

                                                }}
                                            >
                                                + Add Paragraph
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            )}

            {showDeleteModal && (
                <div
                    className="modal d-block"
                    style={{ background: "rgba(0,0,0,0.5)" }}
                >
                    <div className="modal-dialog">
                        <div className="modal-content">

                            <div className="modal-header">
                                <h5 className="modal-title">
                                    Delete Blog
                                </h5>

                                <button
                                    className="btn-close"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedBlogId(null);
                                    }}
                                />
                            </div>

                            <div className="modal-body">
                                <p className="mb-0">
                                    Are you sure you want to delete this blog?
                                </p>
                            </div>

                            <div className="modal-footer">

                                <button
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedBlogId(null);
                                    }}
                                >
                                    Cancel
                                </button>

                                <button
                                    className="btn btn-danger"
                                    onClick={handleDeleteBlog}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BlogManagement;