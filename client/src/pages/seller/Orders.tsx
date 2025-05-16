import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SellerLayout from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { getSellerOrders, markOrderReady } from "@/lib/api";
import { formatCurrency, formatDate, getOrderStatusBadgeColor } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import {
  Package,
  ShoppingBag,
  User,
  MapPin,
  Calendar,
  CheckCircle,
  Truck,
  MessageSquare,
} from "lucide-react";

export default function SellerOrders() {
  const { toast } = useToast();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const { data: orders, isLoading, refetch } = useQuery({
    queryKey: ["/api/seller/orders"],
  });

  const handleMarkReady = async (orderId: number) => {
    try {
      await markOrderReady(orderId);
      toast({
        title: "Success",
        description: "Order marked as ready for pickup",
      });
      refetch();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update order status",
      });
    }
  };

  const viewCustomerMessage = (order: any) => {
    setSelectedOrder(order);
    setMessageDialogOpen(true);
  };

  // Filter orders based on status
  const filteredOrders = orders
    ? statusFilter === "all"
      ? orders
      : orders.filter((order: any) => order.status === statusFilter)
    : [];

  return (
    <SellerLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
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

      {isLoading ? (
        <div className="text-center py-12">Loading orders...</div>
      ) : !orders || orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500">Orders from customers will appear here.</p>
          </CardContent>
        </Card>
      ) : filteredOrders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">No {statusFilter} orders</h3>
            <p className="text-gray-500">No orders with the selected status.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tracking ID</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order: any) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="flex-shrink-0 h-4 w-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {order.customerName}
                            <div className="text-xs text-gray-500 flex items-center mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {order.address ? (
                                order.address.length > 20 
                                  ? order.address.substring(0, 20) + "..." 
                                  : order.address
                              ) : "No address provided"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {order.product?.image ? (
                            <img 
                              src={order.product.image} 
                              alt={order.product.name} 
                              className="h-10 w-10 object-cover rounded-md mr-2"
                            />
                          ) : (
                            <Package className="h-10 w-10 text-gray-300 mr-2" />
                          )}
                          <div>
                            <div className="text-sm text-gray-900">{order.product?.name || "Unknown Product"}</div>
                            <div className="text-xs text-gray-500">Qty: {order.quantity}</div>
                            {order.customerMessage && (
                              <button 
                                onClick={() => viewCustomerMessage(order)}
                                className="text-xs text-primary flex items-center mt-1"
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                View message
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {order.trackingNumber ? (
                          <div className="text-sm text-blue-600 font-medium flex items-center">
                            <Truck className="h-4 w-4 mr-1" />
                            {order.trackingNumber}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">Not assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge className={getOrderStatusBadgeColor(order.status)}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {order.status === "placed" ? (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleMarkReady(order.id)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Ready
                          </Button>
                        ) : order.status === "ready" ? (
                          <div className="text-sm text-gray-500">Awaiting admin</div>
                        ) : (
                          <div className="text-sm flex items-center text-green-600">
                            <Truck className="h-4 w-4 mr-1" />
                            {order.trackingNumber || "Fulfilled"}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customer Message Dialog */}
      <Dialog open={messageDialogOpen} onOpenChange={setMessageDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Customer Message</DialogTitle>
          </DialogHeader>
          <div className="p-4 bg-gray-50 rounded-md">
            <p className="font-medium text-sm mb-2">From: {selectedOrder?.customerName}</p>
            <p className="text-gray-700">{selectedOrder?.customerMessage}</p>
          </div>
          <DialogFooter>
            <Button onClick={() => setMessageDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SellerLayout>
  );
}
