import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { getAllOrders, getOrdersByStatus, addTrackingToOrder } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency, getOrderStatusBadgeColor, formatDate } from "@/lib/utils";
import { ShoppingBag, Truck, Package, User, Calendar, AlertCircle } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

export default function AdminOrders() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [trackingDialog, setTrackingDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");

  const {
    data: allOrders,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["/api/admin/orders"],
  });

  const { data: filteredOrders, refetch: refetchFiltered } = useQuery({
    queryKey: [`/api/admin/orders/status/${statusFilter}`],
    enabled: statusFilter !== "all",
  });

  const orders = statusFilter === "all" ? allOrders : filteredOrders;

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    if (value !== "all") {
      refetchFiltered();
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
        title: "Success",
        description: "Tracking number added and order fulfilled.",
      });
      setTrackingDialog(false);
      queryClient.invalidateQueries({queryKey: ["/api/admin/orders"]});
      if (statusFilter !== "all") {
        queryClient.invalidateQueries({queryKey: [`/api/admin/orders/status/${statusFilter}`]});
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add tracking number.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <div className="w-48">
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Orders</SelectItem>
                <SelectItem value="placed">Placed</SelectItem>
                <SelectItem value="ready">Ready for Pickup</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          {isLoading ? (
            <div className="py-12 text-center">
              <div className="spinner mb-4"></div>
              <p>Loading orders...</p>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-12 text-center">
              <div className="flex flex-col items-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No orders found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {statusFilter === "all"
                    ? "There are no orders in the system yet."
                    : `There are no orders with the status "${statusFilter}".`}
                </p>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order: any) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">#{order.id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{order.customerName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">{order.productName || "Unknown Product"}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{order.sellerBusinessName || "Unknown Seller"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.totalPrice)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${getOrderStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status === "ready" ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => openTrackingDialog(order)}
                          >
                            <Truck className="h-4 w-4 mr-1" />
                            Add Tracking
                          </Button>
                        ) : order.status === "fulfilled" ? (
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Tracking:</span> {order.trackingNumber}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-500">Awaiting seller</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
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
            <Button variant="outline" onClick={() => setTrackingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTracking}>
              Confirm & Fulfill Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
