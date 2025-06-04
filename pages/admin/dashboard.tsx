import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../lib/hooks/useAuth'; // 或 './../../../lib/hooks/useAuth' 取决于文件层级
import Header from '../../components/Header'; // 用相对路径找到 Header.tsx 文件
import Footer from '../../components/Footer';

interface DashboardStats {
  totalUsers: number;
  totalListings: number;
  totalTipsAmount: number;
}

interface User {
  _id: string;
  username: string;
  email: string;
  createdAt: string;
}

interface Listing {
  _id: string;
  title: string;
  price: number;
  location: string;
  createdAt: string;
  owner: {
    username: string;
  };
}

interface Tip {
  _id: string;
  amount: number;
  createdAt: string;
  fromUser: {
    username: string;
  };
  listing: {
    title: string;
  };
}

interface DashboardData {
  stats: DashboardStats;
  lists: {
    latestUsers: User[];
    latestListings: Listing[];
    latestTips: Tip[];
  };
}

const AdminDashboard = () => {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    // Redirect if not admin
    if (!isLoading && (!user || user.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/admin/stats');
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || '获取数据失败');
        }

        setData(result);
      } catch (error) {
        setError(error instanceof Error ? error.message : '获取数据失败');
      }
    };

    if (user?.role === 'admin') {
      fetchData();
    }
  }, [user]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-gray-600">未授权访问</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>管理员面板 - Sublet Matcher</title>
      </Head>

      <div className="min-h-screen bg-gray-100">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {error ? (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-8">
              <p className="text-red-700">{error}</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">总用户数</h3>
                  <p className="text-3xl font-bold text-blue-600">{data?.stats.totalUsers || 0}</p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">总房源数</h3>
                  <p className="text-3xl font-bold text-green-600">
                    {data?.stats.totalListings || 0}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">总打赏金额</h3>
                  <p className="text-3xl font-bold text-yellow-600">
                    ¥{data?.stats.totalTipsAmount?.toFixed(2) || '0.00'}
                  </p>
                </div>
              </div>

              {/* Lists */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Latest Users */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">最新注册用户</h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {data?.lists.latestUsers.map((user) => (
                      <li key={user._id} className="p-6">
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Latest Listings */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">最新房源</h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {data?.lists.latestListings.map((listing) => (
                      <li key={listing._id} className="p-6">
                        <p className="font-medium text-gray-900">{listing.title}</p>
                        <p className="text-sm text-gray-500">
                          ¥{listing.price} - {listing.location}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {listing.owner.username} 发布于{' '}
                          {new Date(listing.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Latest Tips */}
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-medium text-gray-900">最新打赏</h3>
                  </div>
                  <ul className="divide-y divide-gray-200">
                    {data?.lists.latestTips.map((tip) => (
                      <li key={tip._id} className="p-6">
                        <p className="font-medium text-gray-900">¥{tip.amount.toFixed(2)}</p>
                        <p className="text-sm text-gray-500">{tip.listing.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {tip.fromUser.username} 打赏于{' '}
                          {new Date(tip.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard;
