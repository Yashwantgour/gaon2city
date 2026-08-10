import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlinePhone, HiOutlineBuildingStorefront, HiOutlineMapPin } from 'react-icons/hi2';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import { signUp, getMe } from '../services/authApi';

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      await signUp({
        email: data.email,
        password: data.password,
        name: data.name,
        phone: data.phone,
        village: data.village,
        city: data.city,
        seller_type: data.seller_type,
      });

      try {
        const userProfile = await getMe();
        dispatch(loginSuccess(userProfile));
      } catch {
        dispatch(loginFailure(null));
      }

      dispatch(showToast({ type: 'success', message: 'Account created successfully!' }));
      navigate('/');
    } catch (err) {
      const msg = err?.message || 'Failed to create account.';
      dispatch(loginFailure(msg));
      dispatch(showToast({ type: 'error', message: msg }));
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
              <span className="text-white font-bold text-xl">G</span>
            </div>
            <span className="text-xl font-bold text-neutral-800">
              Gaon<span className="text-primary-500">2</span>City
            </span>
          </Link>
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">Create your account</h1>
          <p className="text-sm text-neutral-500">Join the hyperlocal marketplace</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Full Name"
              placeholder="Your full name"
              icon={<HiOutlineUser />}
              error={errors.name?.message}
              {...register('name', { required: 'Name is required' })}
            />

            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<HiOutlineEnvelope />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: { value: /^\S+@\S+$/i, message: 'Enter a valid email' },
              })}
            />

            <Input
              label="Phone"
              type="tel"
              placeholder="+91 98765 43210"
              icon={<HiOutlinePhone />}
              error={errors.phone?.message}
              {...register('phone', { required: 'Phone is required' })}
            />

            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Village"
                placeholder="Village name"
                icon={<HiOutlineMapPin />}
                {...register('village')}
              />
              <Input
                label="City / Town"
                placeholder="City name"
                icon={<HiOutlineMapPin />}
                {...register('city')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1.5 flex items-center gap-1.5">
                <HiOutlineBuildingStorefront className="w-4 h-4 text-neutral-400" />
                Seller Type
              </label>
              <select
                {...register('seller_type')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 bg-white"
              >
                <option value="individual">Individual Buyer / Seller</option>
                <option value="farmer">Farmer</option>
                <option value="artisan">Artisan / Weaver</option>
                <option value="local_shop">Local Shop / Trader</option>
              </select>
            </div>

            <Input
              label="Password"
              type="password"
              placeholder="Create a password"
              icon={<HiOutlineLockClosed />}
              error={errors.password?.message}
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'At least 6 characters' },
              })}
            />

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
