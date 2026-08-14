import { motion } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import {
  HiOutlineArrowLeft,
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineExclamationTriangle,
} from 'react-icons/hi2';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { getProductById, updateProduct } from '../services/productsApi';
import { uploadFile } from '../services/storageService';
import { updateProduct as updateProductInStore } from '../features/products/productsSlice';
import { showToast } from '../features/ui/uiSlice';

import { CATEGORIES, CONDITIONS } from '../utils/constants';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [product, setProduct] = useState(null);
  const [unauthorized, setUnauthorized] = useState(false);

  // Existing images loaded from backend
  const [existingImages, setExistingImages] = useState([]);
  // Track failed 404 image URLs
  const [failedExistingUrls, setFailedExistingUrls] = useState(new Set());

  // New image files selected by the user: array of File objects
  const [newImageFiles, setNewImageFiles] = useState([]);
  // Temporary previews for new images: array of object URLs
  const [newImagePreviews, setNewImagePreviews] = useState([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm();

  const currentQuantity = watch('quantity');

  const handleExistingImgError = (failedUrl) => {
    setFailedExistingUrls((prev) => {
      const updated = new Set(prev);
      updated.add(failedUrl);
      return updated;
    });
  };

  // Filter out any existing image whose Supabase Storage object is 404
  const validExistingImages = existingImages.filter((url) => !failedExistingUrls.has(url));
  const totalUsableCount = validExistingImages.length + newImageFiles.length;

  const loadProduct = useCallback(async () => {
    setIsLoading(true);
    setUnauthorized(false);
    try {
      const data = await getProductById(id);
      setProduct(data);

      // Check ownership
      const sellerId = data.seller_id || data.seller?.id;
      if (user && sellerId && String(sellerId) !== String(user.id)) {
        setUnauthorized(true);
        setIsLoading(false);
        return;
      }

      // Match category UUID
      let matchedCatId = data.category_id || data.category?.id || '';
      if (!matchedCatId && data.category?.slug) {
        const found = CATEGORIES.find((c) => c.slug === data.category.slug);
        if (found) matchedCatId = found.id;
      }

      // Populate form fields
      setValue('title', data.title || '');
      setValue('description', data.description || '');
      setValue('price', data.price != null ? String(data.price) : '');
      setValue('quantity', data.quantity != null ? String(data.quantity) : '0');
      setValue('category_id', matchedCatId);
      setValue('condition', data.condition || 'new');
      setValue('pickup_available', data.pickup_available ?? true);
      setValue('delivery_available', data.delivery_available ?? false);

      // Populate images
      const initialImgs = (data.images || [])
        .map((img) => (typeof img === 'string' ? img : img.storage_path))
        .filter(Boolean);
      setExistingImages(initialImgs);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err?.message || 'Failed to load product' }));
    } finally {
      setIsLoading(false);
    }
  }, [id, user, setValue, dispatch]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Handle new image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (totalUsableCount + files.length > 5) {
      dispatch(showToast({ type: 'error', message: 'You can upload a maximum of 5 images' }));
      return;
    }

    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setNewImageFiles((prev) => [...prev, ...files]);
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeExistingImage = (index) => {
    const targetUrl = validExistingImages[index];
    setExistingImages((prev) => prev.filter((url) => url !== targetUrl));
  };

  const removeNewImage = (index) => {
    URL.revokeObjectURL(newImagePreviews[index]);
    setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 1. Upload new image files to Supabase Storage
      const uploadedUrls = [];
      if (newImageFiles.length > 0) {
        for (const file of newImageFiles) {
          const publicUrl = await uploadFile(file);
          uploadedUrls.push(publicUrl);
        }
      }

      // Combine valid existing images with newly uploaded images
      const finalImagesList = [...validExistingImages, ...uploadedUrls];

      // 2. Update Product API with Category UUID
      const updated = await updateProduct(id, {
        title: data.title,
        description: data.description,
        price: parseFloat(data.price),
        quantity: parseInt(data.quantity, 10),
        condition: data.condition || 'new',
        category_id: data.category_id || null,
        pickup_available: Boolean(data.pickup_available),
        delivery_available: Boolean(data.delivery_available),
        images: finalImagesList,
      });

      dispatch(updateProductInStore(updated));
      dispatch(showToast({ type: 'success', message: 'Product updated successfully!' }));
      navigate(`/seller/dashboard`);
    } catch (err) {
      dispatch(showToast({ type: 'error', message: err?.message || 'Failed to update product' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-neutral-500 text-sm">Loading product details...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <HiOutlineExclamationTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Access Denied</h2>
        <p className="text-sm text-neutral-500 mb-6">
          You are not authorized to edit this listing. Only the owner can make changes.
        </p>
        <Button variant="primary" onClick={() => navigate('/seller/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-800 mb-2">Product Not Found</h2>
        <p className="text-sm text-neutral-500 mb-6">The requested product could not be found.</p>
        <Button variant="primary" onClick={() => navigate('/seller/dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isOutOfStock = parseInt(currentQuantity, 10) <= 0;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
      {/* Hidden prefetcher to eagerly detect broken existing images */}
      <div className="hidden" aria-hidden="true">
        {existingImages.map((url, i) => (
          <img
            key={`preload-${i}`}
            src={url}
            alt=""
            onError={() => handleExistingImgError(url)}
          />
        ))}
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="p-2 rounded-xl hover:bg-neutral-100 transition-colors"
            >
              <HiOutlineArrowLeft className="w-5 h-5 text-neutral-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-800">Edit Product</h1>
              <p className="text-xs sm:text-sm text-neutral-500">Update listing information and inventory</p>
            </div>
          </div>

          {/* Availability Status Badge */}
          {isOutOfStock ? (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span>Out of Stock</span>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>In Stock</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images Section */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-neutral-800">Product Images</h3>
              <span className="text-xs text-neutral-500 font-medium">
                {totalUsableCount} / 5 images
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {/* Valid Existing Images */}
              {validExistingImages.map((imgUrl, i) => (
                <div
                  key={`existing-${i}`}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-neutral-200 bg-neutral-50 group"
                >
                  <img
                    src={imgUrl}
                    alt=""
                    onError={() => handleExistingImgError(imgUrl)}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs"
                    title="Remove image"
                  >
                    <HiOutlineXMark className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-neutral-900/70 text-white">
                    Saved
                  </span>
                </div>
              ))}

              {/* New Selected Images Preview */}
              {newImagePreviews.map((previewUrl, i) => (
                <div
                  key={`new-${i}`}
                  className="relative w-24 h-24 rounded-xl overflow-hidden border border-primary-300 bg-primary-50/30 group"
                >
                  <img src={previewUrl} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeNewImage(i)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-neutral-900/80 text-white flex items-center justify-center hover:bg-red-600 transition-colors shadow-xs"
                    title="Remove image"
                  >
                    <HiOutlineXMark className="w-3.5 h-3.5" />
                  </button>
                  <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary-600 text-white">
                    New
                  </span>
                </div>
              ))}

              {/* Add New Image Button */}
              {totalUsableCount < 5 && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-200 hover:border-primary-400 hover:bg-primary-50/50 flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors">
                  <HiOutlinePhoto className="w-6 h-6 text-neutral-400" />
                  <span className="text-xs text-neutral-500 font-medium">Add Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Basic Details */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-800">Basic Information</h3>

            <Input
              label="Product Title"
              placeholder="e.g., Organic Sharbati Wheat"
              error={errors.title?.message}
              {...register('title', { required: 'Product title is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
              <textarea
                placeholder="Describe your produce, harvest quality, and storage conditions..."
                rows={4}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  Category <span className="text-danger-500">*</span>
                </label>
                <select
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  {...register('category_id', { required: 'Please select a category' })}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.category_id && (
                  <p className="mt-1 text-xs text-danger-500">{errors.category_id.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Condition</label>
                <select
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
                  {...register('condition')}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Pricing & Inventory */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-semibold text-neutral-800">Pricing & Inventory</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                placeholder="0"
                error={errors.price?.message}
                {...register('price', {
                  required: 'Price is required',
                  min: { value: 0.1, message: 'Must be positive' },
                })}
              />

              <Input
                label="Stock Quantity"
                type="number"
                placeholder="0"
                error={errors.quantity?.message}
                {...register('quantity', {
                  required: 'Quantity is required',
                  min: { value: 0, message: 'Cannot be negative' },
                })}
              />
            </div>

            {isOutOfStock && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/60 text-xs text-amber-800 flex items-start gap-2">
                <span className="text-sm">⚠️</span>
                <span>
                  <strong>Stock is 0:</strong> This product will remain visible in the marketplace but will show an <strong>Out of Stock</strong> overlay and purchase controls will be disabled.
                </span>
              </div>
            )}
          </div>

          {/* Fulfillment Options */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 shadow-xs space-y-3">
            <h3 className="text-sm font-semibold text-neutral-800">Fulfillment Options</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-4 h-4"
                {...register('pickup_available')}
              />
              <span className="text-sm text-neutral-700">Available for Farm / Store Pickup</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-4 h-4"
                {...register('delivery_available')}
              />
              <span className="text-sm text-neutral-700">Available for Local Delivery</span>
            </label>
          </div>

          {/* Save Action Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="flex-1"
              onClick={() => navigate('/seller/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="flex-1"
              isLoading={isSubmitting}
            >
              {isSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
