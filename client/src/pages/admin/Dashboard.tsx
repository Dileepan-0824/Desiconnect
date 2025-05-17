import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import AdminLayout from "@/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  LineChart, 
  ResponsiveContainer, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Line, 
  Legend
} from "recharts"; 
import { 
  ArrowUpRight, 
  Users, 
  ShoppingBag, 
  Package, 
  IndianRupee,
  TrendingUp,
  ShoppingCart
} from "lucide-react";
import { Link } from "wouter";

export default function AdminDashboard() {
  const { user, token } = useAuth();
  
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/stats"],
    enabled: !!token && !!user,
  });
  
  const defaultStats = {
    totalSellers: 0,
    totalProducts: 0,
    pendingProducts: 0,
    totalOrders: 0,
    pendingApprovalSellers: 0,
    totalRevenue: 0,
    recentOrders: [],
    monthlySales: [],
    categorySales: []
  };
  
  const dashboardStats = stats || defaultStats;
  
  // Generate fake monthly data if not available
  const monthlyData = dashboardStats.monthlySales && dashboardStats.monthlySales.length > 0 
    ? dashboardStats.monthlySales 
    : [
        { month: "Jan", orders: 15, revenue: 13500 },
        { month: "Feb", orders: 20, revenue: 18000 },
        { month: "Mar", orders: 25, revenue: 21000 },
        { month: "Apr", orders: 30, revenue: 34500 },
        { month: "May", orders: 40, revenue: 38000 },
        { month: "Jun", orders: 35, revenue: 32000 },
      ];
      
  // Generate fake category data if not available
  const categoryData = dashboardStats.categorySales && dashboardStats.categorySales.length > 0
    ? dashboardStats.categorySales
    : [
        { category: "Clothing", sales: 35, revenue: 30500 },
        { category: "Jewelry", sales: 25, revenue: 42000 },
        { category: "Home Decor", sales: 20, revenue: 18000 },
        { category: "Handicrafts", sales: 15, revenue: 12500 },
        { category: "Art", sales: 5, revenue: 8000 },
      ];
  
  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[80vh]">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your store's performance
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button asChild variant="outline">
            <Link href="/admin/products">
              View All Products
            </Link>
          </Button>
          <Button>
            <Link href="/admin/orders">
              Manage Orders
            </Link>
          </Button>
        </div>
      </div>
      
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sellers</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardStats.totalSellers}</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                {dashboardStats.pendingApprovalSellers} Pending Approval
              </Badge>
              <Link href="/admin/sellers" className="ml-auto text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Products</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardStats.totalProducts}</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-green-600" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                {dashboardStats.pendingProducts} Pending Approval
              </Badge>
              <Link href="/admin/products" className="ml-auto text-sm text-green-600 hover:underline">
                View All
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
                <h3 className="text-2xl font-bold mt-1">{dashboardStats.totalOrders}</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">5% increase</span>
              </div>
              <Link href="/admin/orders" className="ml-auto text-sm text-purple-600 hover:underline">
                View All
              </Link>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                <h3 className="text-2xl font-bold mt-1">₹{dashboardStats.totalRevenue.toLocaleString()}</h3>
              </div>
              <div className="h-12 w-12 rounded-lg bg-yellow-100 flex items-center justify-center">
                <IndianRupee className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            
            <div className="mt-4 flex items-center">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm text-green-600 font-medium">10% increase</span>
              </div>
              <span className="ml-auto text-sm text-yellow-600">This Month</span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="mt-6">
        <Tabs defaultValue="revenue">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="revenue">Revenue Overview</TabsTrigger>
              <TabsTrigger value="orders">Order Trends</TabsTrigger>
              <TabsTrigger value="categories">Category Analysis</TabsTrigger>
            </TabsList>
            
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="outline" size="sm">This Month</Button>
              <Button variant="outline" size="sm">This Quarter</Button>
              <Button variant="outline" size="sm">This Year</Button>
            </div>
          </div>
          
          <TabsContent value="revenue" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
                <CardDescription>
                  Monthly revenue trends for the current year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip
                        formatter={(value) => ["₹" + value.toLocaleString(), "Revenue"]}
                      />
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="revenue" 
                        name="Revenue (₹)" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Order Trends</CardTitle>
                <CardDescription>
                  Monthly order volume for the current year
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" name="Orders" fill="#4f46e5" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="categories" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Category Analysis</CardTitle>
                <CardDescription>
                  Sales and revenue breakdown by product category
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={categoryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                      <Tooltip />
                      <Legend />
                      <Bar yAxisId="left" dataKey="sales" name="Sales Volume" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="revenue" name="Revenue (₹)" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Action Required & Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>
              Items that need your attention
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Users className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Seller Approval Pending</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {dashboardStats.pendingApprovalSellers} new sellers awaiting approval
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Link href="/admin/sellers">Review Sellers</Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <Package className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Products Pending Approval</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {dashboardStats.pendingProducts} products awaiting review
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Link href="/admin/products">Review Products</Link>
                  </Button>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3 flex-shrink-0">
                  <ShoppingCart className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Orders Ready for Fulfillment</h4>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    12 orders need tracking information
                  </p>
                  <Button size="sm" variant="outline" className="mt-2">
                    <Link href="/admin/orders">Process Orders</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest customer orders across all sellers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {dashboardStats.recentOrders && dashboardStats.recentOrders.length > 0 ? (
              <div className="space-y-4">
                {dashboardStats.recentOrders.map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between border-b pb-3">
                    <div>
                      <h4 className="text-sm font-medium">Order #{order.id}</h4>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {new Date(order.createdAt).toLocaleDateString()} - {order.status}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{order.total.toLocaleString()}</p>
                      <Badge variant={
                        order.status === 'fulfilled' ? 'default' :
                        order.status === 'ready' ? 'outline' : 'secondary'
                      } className="mt-1">
                        {order.status === 'fulfilled' ? 'Completed' :
                         order.status === 'ready' ? 'Ready' : 'Placed'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Recent Orders</h3>
                <p className="text-muted-foreground mt-2 mb-4">
                  There are no recent orders to display.
                </p>
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Button variant="outline" className="w-full">
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}