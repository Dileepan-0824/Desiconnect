import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function CustomerOrders() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Fetch orders data
  const { data: orders, isLoading, error } = useQuery({
    queryKey: ["/api/customer/orders"],
    enabled: !!token && !!user,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>Loading your order history...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-8">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>There was a problem loading your orders</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">Error: {(error as Error).message}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>My Orders</CardTitle>
            <CardDescription>You haven't placed any orders yet</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Browse our products and place your first order!</p>
            <Button onClick={() => navigate("/products")} className="mt-4">
              Shop Now
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "placed":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Processing</Badge>;
      case "ready":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Ready to Ship</Badge>;
      case "fulfilled":
        return <Badge variant="outline" className="bg-green-100 text-green-800">Delivered</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>View your order history</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.isArray(orders) && orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">#{order.id}</TableCell>
                  <TableCell>
                    {order.createdAt 
                      ? format(new Date(order.createdAt), 'MMM dd, yyyy') 
                      : 'N/A'}
                  </TableCell>
                  <TableCell>₹{order.totalAmount?.toFixed(2) || '0.00'}</TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell>
                    <Link href={`/orders/${order.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}