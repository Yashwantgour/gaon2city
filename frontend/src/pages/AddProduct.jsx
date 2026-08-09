import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import {
  HiOutlinePhoto,
  HiOutlineXMark,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { CATEGORIES, CONDITIONS, SELLER_TYPES } from '../utils/constants';
import { addProduct } from '../features/products/productsSlice';
import { showToast } from '../features/ui/uiSlice';

export default function AddProduct() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [imagePreview, setImagePreview] = useState([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pickup_available: true,
      delivery_available: false,
      condition: 'new',
    },
  });

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreview((prev) => [...prev, ...previews].slice(0, 5));
  };

  const removeImage = (index) => {
    setImagePreview((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data) => {
    const newProduct = {
      id: Date.now().toString(),
      seller_id: user.id,
      category_id: parseInt(data.category),
      title: data.title,
      slug: data.title.toLowerCase().replace(/\s+/g, '-'),
      description: data.description,
      price: parseFloat(data.price),
      quantity: parseInt(data.quantity),
      condition: data.condition,
      status: 'active',
      latitude: 26.9124,
      longitude: 75.7873,
      distance: 0,
      pickup_available: data.pickup_available,
      delivery_available: data.delivery_available,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      images: imagePreview.length > 0
        ? imagePreview
        : ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop'],
      category: CATEGORIES.find((c) => c.id === parseInt(data.category)),
      seller: {
        id: user.id,
        name: user.name,
        seller_type: user.seller_type,
        avatar_url: user.avatar_url,
        village: user.village,
        city: user.city,
      },
    };

    dispatch(addProduct(newProduct));
    dispatch(showToast({ type: 'success', message: 'Product listed successfully!' }));
    navigate('/seller/dashboard');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-neutral-100 transition-colors">
            <HiOutlineArrowLeft className="w-5 h-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-800">Sell a Product</h1>
            <p className="text-sm text-neutral-500">Create a new listing</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Images */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <h3 className="text-sm font-semibold text-neutral-700 mb-3">Product Images</h3>
            <div className="flex flex-wrap gap-3">
              {imagePreview.map((img, i) => (
                <div key={i} className="relative w-24 h-24 rounded-xl overflow-hidden">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center"
                  >
                    <HiOutlineXMark className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {imagePreview.length < 5 && (
                <label className="w-24 h-24 rounded-xl border-2 border-dashed border-neutral-200 flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-primary-400 hover:bg-primary-50 transition-colors">
                  <HiOutlinePhoto className="w-6 h-6 text-neutral-400" />
                  <span className="text-xs text-neutral-400">Add</span>
                  <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-neutral-700">Product Details</h3>

            <Input
              label="Title"
              placeholder="e.g., Fresh Organic Wheat"
              error={errors.title?.message}
              {...register('title', { required: 'Title is required' })}
            />

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5">Description</label>
              <textarea
                placeholder="Describe your product in detail..."
                rows={4}
                className="w-full rounded-xl border border-neutral-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <p className="mt-1 text-xs text-danger-500">{errors.description.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price (₹)"
                type="number"
                placeholder="0"
                error={errors.price?.message}
                {...register('price', { required: 'Price is required', min: { value: 1, message: 'Must be positive' } })}
              />
              <Input
                label="Quantity"
                type="number"
                placeholder="1"
                error={errors.quantity?.message}
                {...register('quantity', { required: 'Required', min: { value: 1, message: 'At least 1' } })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Category</label>
                <select
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">Condition</label>
                <select
                  className="w-full rounded-xl border border-neutral-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                  {...register('condition')}
                >
                  {CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Availability */}
          <div className="bg-white rounded-2xl border border-neutral-100 p-5 space-y-3">
            <h3 className="text-sm font-semibold text-neutral-700">Availability</h3>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-4 h-4" {...register('pickup_available')} />
              <span className="text-sm text-neutral-700">Available for Pickup</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500 w-4 h-4" {...register('delivery_available')} />
              <span className="text-sm text-neutral-700">Available for Delivery</span>
            </label>
          </div>

          {/* Submit */}
          <Button type="submit" variant="primary" size="lg" fullWidth>
            List Product
          </Button>
        </form>
      </motion.div>
    </div>
  );
}
