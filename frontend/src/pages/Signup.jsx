import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch } from 'react-redux';
import { HiOutlineUser, HiOutlineEnvelope, HiOutlineLockClosed, HiOutlinePhone } from 'react-icons/hi2';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { mockLogin } from '../features/auth/authSlice';
import { showToast } from '../features/ui/uiSlice';

export default function Signup() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = (data) => {
    dispatch(mockLogin());
    dispatch(showToast({ type: 'success', message: 'Account created successfully!' }));
    navigate('/');
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

            <Button type="submit" variant="primary" size="lg" fullWidth>
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
