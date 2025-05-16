import React from "react";
import { useQuery } from "@tanstack/react-query";
import SellerLayout from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getSellerStats, getSellerOrders, getSellerProducts, markOrderReady } from "@/lib/api";
import { formatCurrency, formatDate, getOrderStatusBadgeColor, getProductStatusBadgeColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import {
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  CheckCircle,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";

export default function SellerDashboard() {
  const { toast } = useToast();
  const [_, navigate] = useLocation();

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/seller/stats"],
  });

  const { data: orders, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ["/api/seller/orders"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/seller/products"],
  });

  const recentOrders = orders?.slice(0, 5) || [];
  const pendingProducts = products?.filter((p: any) => p.status === "pending").slice(0, 5) || [];

  const handleMarkReady = async (orderId: number) => {
    try {
      await markOrderReady(orderId);
      toast({
        title: "Success",
        description: "Order marked as ready for pickup",
      });
      refetchOrders();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  if (statsLoading) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center h-64">
          <p>Loading dashboard...</p>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <h1 className="text-2xl font-bold mb-6">Seller Dashboard</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <h3 className="text-2xl font-bold">{stats?.totalProducts || 0}</h3>
              </div>
              <div className="bg-primary/10 h-12 w-12 rounded-lg flex items-center justify-center text-primary">
                <Package className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>12% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">New Orders</p>
                <h3 className="text-2xl font-bold">{stats?.newOrders || 0}</h3>
              </div>
              <div className="bg-blue-100 h-12 w-12 rounded-lg flex items-center justify-center text-blue-500">
                <ShoppingBag className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-green-500">
              <TrendingUp className="h-4 w-4 mr-1" />
              <span>23% from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-500 text-sm">Pending Approvals</p>
                <h3 className="text-2xl font-bold">{stats?.pendingApprovals || 0}</h3>
              </div>
              <div className="bg-yellow-100 h-12 w-12 rounded-lg flex items-center justify-center text-yellow-500">
                <Clock className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-xs text-gray-500">
              <span>Average approval time: 24 hours</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Recent Orders</h2>
              <Button variant="link" onClick={() => navigate("/seller/orders")}>
                View All
              </Button>
            </div>

            {ordersLoading ? (
              <div className="p-4 text-center">Loading orders...</div>
            ) : recentOrders.length === 0 ? (
              <div className="p-8 text-center">
                <ShoppingBag className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500">No orders yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order: any) => (
                      <tr key={order.id} className="border-t">
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{`#${order.id}`}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{order.customerName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(order.createdAt)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={getOrderStatusBadgeColor(order.status)}>
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {order.status === "placed" ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleMarkReady(order.id)}
                            >
                              Mark Ready
                            </Button>
                          ) : order.status === "ready" ? (
                            <span className="text-sm text-gray-500">Awaiting Admin</span>
                          ) : (
                            <span className="text-sm text-green-500 flex items-center">
                              <CheckCircle className="h-4 w-4 mr-1" /> Fulfilled
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Products */}
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold">Pending Products</h2>
              <Button variant="link" onClick={() => navigate("/seller/products")}>
                Add New Product
              </Button>
            </div>

            {productsLoading ? (
              <div className="p-4 text-center">Loading products...</div>
            ) : pendingProducts.length === 0 ? (
              <div className="p-8 text-center">
                <CheckCircle className="w-12 h-12 mx-auto text-green-300 mb-2" />
                <p className="text-gray-500">No pending approvals</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingProducts.map((product: any) => (
                      <tr key={product.id} className="border-t">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-md overflow-hidden">
                              {product.image ? (
                                <img src={product.image} alt={product.name} className="h-10 w-10 object-cover" />
                              ) : (
                                <div className="h-10 w-10 flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{formatCurrency(product.price)}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <Badge className={getProductStatusBadgeColor(product.status)}>
                            {product.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm">{formatDate(product.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue Summary */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Revenue Summary</h2>
            <div className="text-sm text-gray-500">
              Total Revenue: <span className="font-bold text-green-600">{formatCurrency(stats?.totalRevenue || 0)}</span>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-around p-6 bg-gray-50 rounded-lg">
            <div className="text-center mb-4 md:mb-0">
              <div className="text-sm text-gray-500 mb-1">This Week</div>
              <div className="text-2xl font-bold">₹12,345</div>
              <div className="text-xs text-green-500 flex items-center justify-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 8% 
              </div>
            </div>
            
            <div className="h-10 border-l border-gray-300 hidden md:block"></div>
            
            <div className="text-center mb-4 md:mb-0">
              <div className="text-sm text-gray-500 mb-1">This Month</div>
              <div className="text-2xl font-bold">₹45,678</div>
              <div className="text-xs text-green-500 flex items-center justify-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 12%
              </div>
            </div>
            
            <div className="h-10 border-l border-gray-300 hidden md:block"></div>
            
            <div className="text-center">
              <div className="text-sm text-gray-500 mb-1">Avg. Order Value</div>
              <div className="text-2xl font-bold">₹1,890</div>
              <div className="text-xs text-green-500 flex items-center justify-center mt-1">
                <ArrowUpRight className="h-3 w-3 mr-1" /> 5%
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </SellerLayout>
  );
}
