import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  ShoppingBag, 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package
} from "lucide-react";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  
  // Fetch admin stats
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!token && !!user,
  });

  // Sample data for charts
  const [orderData, setOrderData] = useState([
    { name: 'Jan', orders: 10 },
    { name: 'Feb', orders: 15 },
    { name: 'Mar', orders: 20 },
    { name: 'Apr', orders: 30 },
    { name: 'May', orders: 25 },
    { name: 'Jun', orders: 35 },
  ]);

  const [productData, setProductData] = useState([
    { name: 'Apparel', value: 35 },
    { name: 'Accessories', value: 20 },
    { name: 'Home Decor', value: 15 },
    { name: 'Festivities', value: 25 },
    { name: 'Others', value: 5 },
  ]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    if (stats) {
      // Update the chart data with actual stats when available
      if (stats.monthlyOrders) {
        setOrderData(stats.monthlyOrders);
      }
      
      if (stats.productCategories) {
        setProductData(stats.productCategories);
      }
    }
  }, [stats]);

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex flex-col space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, admin! Here's an overview of the platform's performance.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingProducts || 0} pending approval
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.pendingOrders || 0} pending fulfillment
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats?.totalRevenue?.toLocaleString() || '0'}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.revenueGrowth > 0 ? '+' : ''}{stats?.revenueGrowth || 0}% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.newSellers || 0} new this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Orders</CardTitle>
            <CardDescription>
              Number of orders received per month
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={orderData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="orders" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Product Categories</CardTitle>
            <CardDescription>
              Distribution of products by category
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={productData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {productData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Quick Access */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Access</CardTitle>
            <CardDescription>Manage key aspects of the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/admin/sellers">
                <div className="p-4 border rounded-lg hover:bg-accent hover:cursor-pointer transition-colors">
                  <Users className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Manage Sellers</h3>
                  <p className="text-sm text-muted-foreground">
                    View and manage seller accounts
                  </p>
                </div>
              </Link>
              
              <Link href="/admin/products">
                <div className="p-4 border rounded-lg hover:bg-accent hover:cursor-pointer transition-colors">
                  <Package className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Approve Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Review and approve seller products
                  </p>
                </div>
              </Link>
              
              <Link href="/admin/orders">
                <div className="p-4 border rounded-lg hover:bg-accent hover:cursor-pointer transition-colors">
                  <ShoppingCart className="h-8 w-8 mb-2" />
                  <h3 className="font-medium">Manage Orders</h3>
                  <p className="text-sm text-muted-foreground">
                    Track and manage customer orders
                  </p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}