import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { HiOutlineEnvelope, HiOutlineLockClosed, HiOutlineEye, HiOutlineEyeSlash } from 'react-icons/hi2';
import { useState } from 'react';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { loginStart, loginSuccess, loginFailure } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';
import { signIn, getMe } from '../services/authApi';

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    dispatch(loginStart());
    try {
      await signIn({ email: data.email, password: data.password });
      const userProfile = await getMe();
      dispatch(loginSuccess(userProfile));
      dispatch(showToast({ type: 'success', message: 'Welcome back!' }));
      navigate('/');
    } catch (err) {
      const msg = err?.message || 'Login failed. Please check your credentials.';
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
          <h1 className="text-2xl font-bold text-neutral-800 mb-1">Welcome back</h1>
          <p className="text-sm text-neutral-500">Sign in to your account to continue</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-neutral-100 p-6 sm:p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<HiOutlineEnvelope />}
              error={errors.email?.message}
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Enter a valid email',
                },
              })}
            />

            <div>
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  icon={<HiOutlineLockClosed />}
                  error={errors.password?.message}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[38px] text-neutral-400 hover:text-neutral-600"
                >
                  {showPassword ? (
                    <HiOutlineEyeSlash className="w-4 h-4" />
                  ) : (
                    <HiOutlineEye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-neutral-600 cursor-pointer">
                <input type="checkbox" className="rounded border-neutral-300 text-primary-500 focus:ring-primary-500" />
                Remember me
              </label>
              <a href="#" className="text-primary-600 hover:text-primary-700 font-medium">
                Forgot password?
              </a>
            </div>

            <Button type="submit" variant="primary" size="lg" fullWidth isLoading={isLoading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-500">
              Don&apos;t have an account?{' '}
              <Link to="/signup" className="text-primary-600 font-semibold hover:text-primary-700">
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
