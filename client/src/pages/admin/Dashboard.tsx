import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getAdminStats, getPendingProducts, getOrdersByStatus } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { approveProduct, rejectProduct, addTrackingToOrder } from "@/lib/api";
import {
  AlertCircle,
  LayoutDashboard,
  Users,
  Package,
  ShoppingBag,
  Check,
  X,
  Truck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminDashboard() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("pendingProducts");
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ["/api/admin/stats"],
    refetchInterval: 300000, // 5 minutes
  });

  const { data: pendingProducts, isLoading: isLoadingPendingProducts, refetch: refetchPendingProducts } = useQuery({
    queryKey: ["/api/admin/products/pending"],
  });

  const { data: readyOrders, isLoading: isLoadingReadyOrders, refetch: refetchReadyOrders } = useQuery({
    queryKey: ["/api/admin/orders/status/ready"],
  });

  const handleApproveProduct = async (productId: number) => {
    try {
      await approveProduct(productId);
      toast({
        title: "Product approved",
        description: "The product has been approved and is now available for customers.",
      });
      refetchPendingProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleRejectProduct = async (productId: number) => {
    try {
      await rejectProduct(productId);
      toast({
        title: "Product rejected",
        description: "The product has been rejected.",
      });
      refetchPendingProducts();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject product. Please try again.",
        variant: "destructive",
      });
    }
  };

  const openTrackingDialog = (order: any) => {
    setSelectedOrder(order);
    setTrackingNumber("");
    setTrackingDialog(true);
  };

  const handleAddTracking = async () => {
    if (!trackingNumber.trim()) {
      toast({
        title: "Error",
        description: "Please enter a tracking number.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addTrackingToOrder(selectedOrder.id, trackingNumber);
      toast({
        title: "Tracking added",
        description: "The order has been marked as fulfilled with tracking number.",
      });
      setTrackingDialog(false);
      refetchReadyOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add tracking number. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (isLoadingStats) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-full">
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Stat Card 1 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-primary rounded-md">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Total Sellers</div>
                <div className="text-2xl font-medium text-gray-900">{stats?.totalSellers || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="link"
                className="text-primary p-0"
                onClick={() => window.location.href = "/admin/sellers"}
              >
                View all
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 2 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-yellow-500 rounded-md">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Pending Products</div>
                <div className="text-2xl font-medium text-gray-900">{stats?.pendingProducts || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="link"
                className="text-primary p-0"
                onClick={() => setActiveTab("pendingProducts")}
              >
                Approve products
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 3 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-blue-500 rounded-md">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Ready Orders</div>
                <div className="text-2xl font-medium text-gray-900">{stats?.readyOrders || 0}</div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="link"
                className="text-primary p-0"
                onClick={() => setActiveTab("readyOrders")}
              >
                View orders
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Stat Card 4 */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 bg-green-500 rounded-md">
                <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 ml-5">
                <div className="text-sm font-medium text-gray-500 truncate">Total Revenue</div>
                <div className="text-2xl font-medium text-gray-900">{formatCurrency(stats?.totalRevenue || 0)}</div>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="link"
                className="text-primary p-0"
                onClick={() => window.location.href = "/admin/orders"}
              >
                View report
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="border-b border-gray-200">
          <ul className="flex flex-wrap -mb-px text-sm font-medium">
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === "pendingProducts"
                    ? "border-primary text-primary"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("pendingProducts")}
              >
                Pending Products
              </button>
            </li>
            <li className="mr-2">
              <button
                className={`inline-block p-4 border-b-2 rounded-t-lg ${
                  activeTab === "readyOrders"
                    ? "border-primary text-primary"
                    : "border-transparent hover:text-gray-600 hover:border-gray-300"
                }`}
                onClick={() => setActiveTab("readyOrders")}
              >
                Ready Orders
              </button>
            </li>
          </ul>
        </div>

        {/* Pending Products Tab Content */}
        {activeTab === "pendingProducts" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Products Awaiting Approval</h2>

            {isLoadingPendingProducts ? (
              <div className="text-center py-6">Loading products...</div>
            ) : !pendingProducts || pendingProducts.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center justify-center text-gray-500">
                <Package className="h-12 w-12 mb-2" />
                <p>No products pending approval</p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white">
                <ul role="list" className="divide-y divide-gray-200">
                  {pendingProducts.map((product: any) => (
                    <li key={product.id}>
                      <div className="block hover:bg-gray-50">
                        <div className="flex items-center px-4 py-4 sm:px-6">
                          <div className="flex min-w-0 flex-1 items-center">
                            <div className="flex-shrink-0">
                              <div className="h-16 w-16 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden">
                                {product.image ? (
                                  <img 
                                    src={product.image} 
                                    alt={product.name} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-8 w-8 text-gray-400" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1 px-4">
                              <div>
                                <p className="truncate text-sm font-medium text-primary">{product.name}</p>
                                <p className="mt-1 flex items-center text-sm text-gray-500">
                                  <span className="truncate">By {product.sellerBusinessName}</span>
                                  <span className="ml-1 inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                                    {formatCurrency(product.price)}
                                  </span>
                                </p>
                                <p className="mt-2 text-sm text-gray-500 line-clamp-2">{product.description}</p>
                              </div>
                            </div>
                          </div>
                          <div>
                            <div className="flex space-x-2">
                              <Button
                                onClick={() => handleApproveProduct(product.id)}
                                variant="outline"
                                className="inline-flex items-center rounded-md bg-green-50 text-green-700 shadow-sm hover:bg-green-100"
                              >
                                <Check className="h-4 w-4 mr-1.5" />
                                Approve
                              </Button>
                              <Button
                                onClick={() => handleRejectProduct(product.id)}
                                variant="outline"
                                className="inline-flex items-center rounded-md bg-red-50 text-red-700 shadow-sm hover:bg-red-100"
                              >
                                <X className="h-4 w-4 mr-1.5" />
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Ready Orders Tab Content */}
        {activeTab === "readyOrders" && (
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-6">Orders Ready for Fulfillment</h2>

            {isLoadingReadyOrders ? (
              <div className="text-center py-6">Loading orders...</div>
            ) : !readyOrders || readyOrders.length === 0 ? (
              <div className="text-center py-6 flex flex-col items-center justify-center text-gray-500">
                <ShoppingBag className="h-12 w-12 mb-2" />
                <p>No orders ready for fulfillment</p>
              </div>
            ) : (
              <div className="overflow-hidden bg-white">
                <ul role="list" className="divide-y divide-gray-200">
                  {readyOrders.map((order: any) => (
                    <li key={order.id}>
                      <div className="block hover:bg-gray-50">
                        <div className="flex items-center px-4 py-4 sm:px-6">
                          <div className="flex min-w-0 flex-1 items-center">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between">
                                <p className="text-sm font-medium text-primary">Order #{order.id}</p>
                                <div className="ml-2 flex flex-shrink-0">
                                  <p className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                                    Ready to Pickup
                                  </p>
                                </div>
                              </div>
                              <div className="mt-2 sm:flex sm:justify-between">
                                <div className="sm:flex">
                                  <p className="flex items-center text-sm text-gray-500">
                                    <Users className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    {order.customerName}
                                  </p>
                                  <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                                    <Package className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" />
                                    {order.productName}
                                  </p>
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                                  <svg className="mr-1.5 h-5 w-5 flex-shrink-0 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p>{new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button
                              variant="default"
                              onClick={() => openTrackingDialog(order)}
                              className="inline-flex items-center bg-primary text-white"
                            >
                              <Truck className="h-4 w-4 mr-1.5" />
                              Add Tracking
                            </Button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tracking Number Dialog */}
      <Dialog open={trackingDialog} onOpenChange={setTrackingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tracking Information</DialogTitle>
            <DialogDescription>
              Enter tracking information for order #{selectedOrder?.id}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-3">
            <div className="space-y-2">
              <div className="text-sm text-gray-700">
                <span className="font-medium">Customer:</span> {selectedOrder?.customerName}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Product:</span> {selectedOrder?.productName}
              </div>
              <div className="text-sm text-gray-700">
                <span className="font-medium">Seller:</span> {selectedOrder?.sellerBusinessName}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tracking-number">Tracking Number</Label>
              <Input
                id="tracking-number"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTrackingDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAddTracking}
            >
              Confirm & Fulfill Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
