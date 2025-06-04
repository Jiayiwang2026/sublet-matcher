import { useForm } from 'react-hook-form';
import { useRouter } from 'next/router';

// Types for form data and props
interface SearchFormData {
  startDate: string;
  endDate: string;
  minPrice: number;
  maxPrice: number;
  location: string;
}

interface HeroProps {
  onSearch?: (data: SearchFormData) => void;
  backgroundImage?: string;
}

const Hero = ({ onSearch, backgroundImage }: HeroProps) => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    defaultValues: {
      startDate: '',
      endDate: '',
      minPrice: undefined,
      maxPrice: undefined,
      location: '',
    },
  });

  // Watch form values for validation
  const startDate = watch('startDate');
  const minPrice = watch('minPrice');

  // Handle form submission
  const onSubmit = async (data: SearchFormData) => {
    if (onSearch) {
      onSearch(data);
    } else {
      // Default search behavior
      const queryParams = new URLSearchParams({
        startDate: data.startDate,
        endDate: data.endDate,
        minPrice: data.minPrice?.toString() || '',
        maxPrice: data.maxPrice?.toString() || '',
        location: data.location,
      }).toString();

      await router.push(`/search?${queryParams}`);
    }
  };

  // Get today's date for min date validation
  const today = new Date().toISOString().split('T')[0];

  return (
    <section className="relative w-full h-[500px] flex items-center justify-center">
      {/* Background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{
          backgroundImage: backgroundImage
            ? `url(${backgroundImage})`
            : 'none',
          backgroundColor: backgroundImage
            ? 'rgba(0, 0, 0, 0.5)'
            : 'rgb(59, 130, 246)', // Blue background if no image
        }}
      />

      {/* Content Container */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Text */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
            找到你的理想住所
          </h1>
          <p className="text-xl text-white opacity-90">
            轻松搜索和匹配合适的转租房源
          </p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-white bg-opacity-95 rounded-lg shadow-xl p-6 max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Start Date */}
            <div className="space-y-1">
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
                入住日期
              </label>
              <input
                type="date"
                id="startDate"
                min={today}
                {...register('startDate', { required: '请选择入住日期' })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-xs">{errors.startDate.message}</p>
              )}
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
                退房日期
              </label>
              <input
                type="date"
                id="endDate"
                min={startDate || today}
                {...register('endDate', {
                  required: '请选择退房日期',
                  validate: (value) =>
                    !startDate || value > startDate || '退房日期必须晚于入住日期',
                })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-xs">{errors.endDate.message}</p>
              )}
            </div>

            {/* Location */}
            <div className="space-y-1">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                地理位置
              </label>
              <input
                type="text"
                id="location"
                placeholder="输入地理位置"
                {...register('location', { required: '请输入地理位置' })}
                className={`w-full px-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                  errors.location ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.location && (
                <p className="text-red-500 text-xs">{errors.location.message}</p>
              )}
            </div>

            {/* Min Price */}
            <div className="space-y-1">
              <label htmlFor="minPrice" className="block text-sm font-medium text-gray-700">
                最低价格
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="minPrice"
                  placeholder="0"
                  min="0"
                  {...register('minPrice', {
                    min: { value: 0, message: '价格不能为负' },
                    valueAsNumber: true,
                  })}
                  className={`w-full pl-7 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.minPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.minPrice && (
                <p className="text-red-500 text-xs">{errors.minPrice.message}</p>
              )}
            </div>

            {/* Max Price */}
            <div className="space-y-1">
              <label htmlFor="maxPrice" className="block text-sm font-medium text-gray-700">
                最高价格
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                  $
                </span>
                <input
                  type="number"
                  id="maxPrice"
                  placeholder="5000"
                  min="0"
                  {...register('maxPrice', {
                    min: { value: 0, message: '价格不能为负' },
                    validate: (value) =>
                      !minPrice || !value || value >= minPrice || '最高价格必须大于最低价格',
                    valueAsNumber: true,
                  })}
                  className={`w-full pl-7 pr-4 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                    errors.maxPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.maxPrice && (
                <p className="text-red-500 text-xs">{errors.maxPrice.message}</p>
              )}
            </div>

            {/* Search Button */}
            <div className="space-y-1 flex items-end">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
              >
                <div className="flex items-center justify-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                  <span>开始搜索</span>
                </div>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
};

export default Hero; 