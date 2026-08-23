import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlineUser,
  HiOutlinePhone,
  HiOutlineMapPin,
  HiOutlineCamera,
  HiOutlineArrowLeft,
  HiOutlineCheckCircle,
} from 'react-icons/hi2';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import { updateProfile } from '../services/authApi';
import { uploadFile } from '../services/storageService';
import { geocodeAddress } from '../services/mapApi';
import { setLocation } from '../features/location/locationSlice';
import { useLocation } from '../hooks/useLocation';
import { loginSuccess } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import { SELLER_TYPES } from '../utils/constants';

export default function EditProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    village: user?.village || '',
    city: user?.city || '',
    district: user?.district || '',
    state: user?.state || '',
    postal_code: user?.postal_code || '',
    seller_type: user?.seller_type || 'individual',
    avatar_url: user?.avatar_url || '',
  });

  const [avatarPreview, setAvatarPreview] = useState(user?.avatar_url || '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        village: user.village || '',
        city: user.city || '',
        district: user.district || '',
        state: user.state || '',
        postal_code: user.postal_code || '',
        seller_type: user.seller_type || 'individual',
        avatar_url: user.avatar_url || '',
      });
      setAvatarPreview(user.avatar_url || '');
    }
  }, [user]);

  if (!isAuthenticated || !user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      dispatch(showToast({ type: 'error', message: 'Please select a valid image file.' }));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      dispatch(showToast({ type: 'error', message: 'Image size should be less than 5MB.' }));
      return;
    }

    // Local preview immediately
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    setIsUploadingImage(true);
    try {
      const publicUrl = await uploadFile(file);
      setFormData((prev) => ({ ...prev, avatar_url: publicUrl }));
      setAvatarPreview(publicUrl);
      dispatch(showToast({ type: 'success', message: 'Profile photo uploaded!' }));
    } catch (err) {
      console.error('Avatar upload failed:', err);
      dispatch(showToast({ type: 'error', message: 'Failed to upload photo. Please try again.' }));
    } finally {
      setIsUploadingImage(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (formData.phone && !/^[0-9+-\s]{7,20}$/.test(formData.phone.trim())) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    if (formData.postal_code && !/^[0-9]{6}$/.test(formData.postal_code.trim())) {
      newErrors.postal_code = 'PIN code must be a 6-digit number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { requestLocation } = useLocation();
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const handleDetectGPS = async () => {
    setIsDetectingLocation(true);
    try {
      const res = await requestLocation();
      if (res?.success && res.location) {
        const loc = res.location;
        setFormData((prev) => ({
          ...prev,
          village: loc.locality || prev.village,
          city: loc.city || prev.city,
          district: loc.district || prev.district,
          state: loc.state || prev.state,
          postal_code: loc.pincode || prev.postal_code,
        }));
        dispatch(showToast({ type: 'success', message: 'Location auto-filled from GPS!' }));
      }
    } catch (err) {
      console.warn('GPS detection failed:', err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const updatedProfile = await updateProfile({
        name: formData.name.trim(),
        phone: formData.phone.trim() || null,
        avatar_url: formData.avatar_url || null,
        village: formData.village.trim() || null,
        city: formData.city.trim() || null,
        district: formData.district.trim() || null,
        state: formData.state.trim() || null,
        postal_code: formData.postal_code.trim() || null,
        seller_type: formData.seller_type,
      });

      // Update Redux Auth state
      dispatch(loginSuccess(updatedProfile));

      // Synchronize updated address with Mapbox / Redux Location state
      const addressParts = [
        formData.village?.trim(),
        formData.city?.trim(),
        formData.district?.trim(),
        formData.state?.trim(),
        formData.postal_code?.trim(),
      ].filter(Boolean);

      if (addressParts.length > 0) {
        const geoQuery = addressParts.join(', ');
        try {
          const geoResults = await geocodeAddress(geoQuery);
          if (geoResults && geoResults.length > 0) {
            const topMatch = geoResults[0];
            dispatch(
              setLocation({
                latitude: topMatch.latitude,
                longitude: topMatch.longitude,
                locationName: formData.village?.trim() || formData.city?.trim() || topMatch.name || 'Selected Location',
                locality: formData.village?.trim() || topMatch.locality || '',
                city: formData.city?.trim() || topMatch.city || '',
                district: formData.district?.trim() || topMatch.district || '',
                state: formData.state?.trim() || topMatch.state || '',
                pincode: formData.postal_code?.trim() || topMatch.pincode || '',
                formattedAddress: topMatch.formatted_address || geoQuery,
                addressLabel: 'Profile Location',
              })
            );
          } else {
            dispatch(
              setLocation({
                latitude: null,
                longitude: null,
                locationName: formData.village?.trim() || formData.city?.trim() || 'Selected Location',
                locality: formData.village?.trim() || '',
                city: formData.city?.trim() || '',
                district: formData.district?.trim() || '',
                state: formData.state?.trim() || '',
                pincode: formData.postal_code?.trim() || '',
                formattedAddress: geoQuery,
                addressLabel: 'Profile Location',
              })
            );
          }
        } catch (geoErr) {
          console.warn('Geocoding updated profile address failed:', geoErr);
        }
      }

      dispatch(showToast({ type: 'success', message: 'Profile & Location updated successfully! 🎉' }));
      navigate('/profile');
    } catch (err) {
      console.error('Failed to update profile:', err);
      dispatch(showToast({ type: 'error', message: err?.message || 'Failed to update profile.' }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-6"
      >
        <button
          onClick={() => navigate('/profile')}
          className="p-2 rounded-xl hover:bg-neutral-100 text-neutral-600 transition-colors"
        >
          <HiOutlineArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Edit Profile</h1>
          <p className="text-xs text-neutral-500">Update your personal and location details</p>
        </div>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Avatar Upload Card */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 flex flex-col sm:flex-row items-center gap-5 shadow-xs">
          <div className="relative group">
            {avatarPreview ? (
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-primary-100"
              />
            ) : (
              <div className="w-24 h-24 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center text-3xl font-bold ring-4 ring-primary-100/50">
                {formData.name ? formData.name.charAt(0).toUpperCase() : <HiOutlineUser />}
              </div>
            )}

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-primary-600 text-white shadow-md hover:bg-primary-700 transition-all hover:scale-105"
              title="Upload new photo"
            >
              <HiOutlineCamera className="w-4 h-4" />
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          <div className="text-center sm:text-left flex-1">
            <h3 className="font-semibold text-neutral-800 text-sm mb-0.5">Profile Photo</h3>
            <p className="text-xs text-neutral-500 mb-3">
              Upload a clear photo to help local buyers and sellers recognize you.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              loading={isUploadingImage}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploadingImage ? 'Uploading...' : 'Change Photo'}
            </Button>
          </div>
        </div>

        {/* Personal Details */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4 shadow-xs">
          <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider">
            Personal Information
          </h2>

          <Input
            label="Full Name"
            name="name"
            placeholder="e.g. Ramesh Kumar"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            icon={<HiOutlineUser className="w-4 h-4" />}
            required
          />

          <Input
            label="Phone Number"
            name="phone"
            type="tel"
            placeholder="e.g. +91 98765 43210"
            value={formData.phone}
            onChange={handleInputChange}
            error={errors.phone}
            icon={<HiOutlinePhone className="w-4 h-4" />}
          />

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1.5">
              Account / Seller Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SELLER_TYPES.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => setFormData((prev) => ({ ...prev, seller_type: type.value }))}
                  className={`p-3 rounded-2xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                    formData.seller_type === type.value
                      ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-500/20'
                      : 'border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300'
                  }`}
                >
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-3xl border border-neutral-100 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
              <HiOutlineMapPin className="w-4 h-4 text-primary-500" />
              Location & Address
            </h2>
            <button
              type="button"
              onClick={handleDetectGPS}
              disabled={isDetectingLocation}
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 bg-primary-50 hover:bg-primary-100/80 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
            >
              <HiOutlineMapPin className="w-3.5 h-3.5" />
              <span>{isDetectingLocation ? 'Detecting GPS...' : 'Use Current GPS'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Village / Area"
              name="village"
              placeholder="e.g. Ashta Village"
              value={formData.village}
              onChange={handleInputChange}
            />

            <Input
              label="City / Town"
              name="city"
              placeholder="e.g. Sehore"
              value={formData.city}
              onChange={handleInputChange}
            />

            <Input
              label="District"
              name="district"
              placeholder="e.g. Sehore District"
              value={formData.district}
              onChange={handleInputChange}
            />

            <Input
              label="State"
              name="state"
              placeholder="e.g. Madhya Pradesh"
              value={formData.state}
              onChange={handleInputChange}
            />
          </div>

          <Input
            label="Postal / PIN Code"
            name="postal_code"
            placeholder="e.g. 466116"
            value={formData.postal_code}
            onChange={handleInputChange}
            error={errors.postal_code}
            maxLength={6}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/profile')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="flex-1"
            loading={isSubmitting}
            icon={<HiOutlineCheckCircle className="w-5 h-5" />}
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </motion.form>
    </div>
  );
}
