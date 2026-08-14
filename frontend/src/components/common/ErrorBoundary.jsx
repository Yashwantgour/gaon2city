import { Component } from 'react';
import { HiOutlineExclamationTriangle, HiOutlineArrowPath, HiOutlineHome } from 'react-icons/hi2';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-neutral-100 shadow-xl text-center space-y-6">
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-500 mx-auto flex items-center justify-center border border-red-100 shadow-xs">
              <HiOutlineExclamationTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
                Something went wrong
              </h2>
              <p className="text-sm text-neutral-500 leading-relaxed">
                An unexpected error occurred while rendering this page. You can try refreshing the page or returning to the home screen.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold transition-all shadow-sm cursor-pointer"
              >
                <HiOutlineArrowPath className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-200 text-sm font-semibold transition-all cursor-pointer"
              >
                <HiOutlineHome className="w-4 h-4" />
                <span>Go to Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
