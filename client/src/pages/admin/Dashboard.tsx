import { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
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
      <div className="grid gap-4 mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sellers</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalSellers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Active sellers on platform
            </p>
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