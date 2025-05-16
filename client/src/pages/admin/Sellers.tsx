import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { AlertCircle, Edit, Eye, Plus } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const createSellerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  businessName: z.string().min(3, { message: "Business name must be at least 3 characters" }),
  phoneNumber: z.string().min(10, { message: "Please enter a valid phone number" }),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
});

type CreateSellerForm = z.infer<typeof createSellerSchema>;

export default function AdminSellers() {
  const { user, token } = useAuth();
  const { toast } = useToast();
  const [selectedSeller, setSelectedSeller] = useState<any>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null);
  
  // Fetch all sellers
  const { data: sellers, isLoading } = useQuery({
    queryKey: ["/api/admin/sellers"],
    enabled: !!token && !!user,
  });
  
  // Filter out rejected sellers
  const activeSellers = Array.isArray(sellers) 
    ? sellers.filter(seller => !seller.rejected)
    : [];

  const form = useForm<CreateSellerForm>({
    resolver: zodResolver(createSellerSchema),
    defaultValues: {
      email: "",
      businessName: "",
      phoneNumber: "",
      address: "",
    },
  });

  // Create seller mutation
  const createSellerMutation = useMutation({
    mutationFn: async (data: CreateSellerForm) => {
      const response = await fetch("/api/admin/sellers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create seller");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Seller Created",
        description: "The seller account has been created successfully.",
      });
      
      setCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers"] });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: error instanceof Error ? error.message : "Failed to create seller",
        variant: "destructive",
      });
    }
  });

  const handleViewSeller = (seller: any) => {
    setSelectedSeller(seller);
    setViewDialogOpen(true);
  };

  // Seller approval mutation
  const approveSellerMutation = useMutation({
    mutationFn: async (sellerId: number) => {
      const response = await fetch(`/api/admin/sellers/${sellerId}/approve`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to approve seller");
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Seller Approved",
        description: "The seller has been approved successfully.",
      });
      
      setApproveDialogOpen(false);
      setProcessingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers"] });
    },
    onError: (error) => {
      toast({
        title: "Approval Failed",
        description: error instanceof Error ? error.message : "Failed to approve seller",
        variant: "destructive",
      });
      setProcessingId(null);
    }
  });

  // Seller rejection mutation
  const rejectSellerMutation = useMutation({
    mutationFn: async (sellerId: number) => {
      const response = await fetch(`/api/admin/sellers/${sellerId}/reject`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to reject seller");
      }
      
      return response.json();
    },
    onSuccess: (_, rejectedSellerId) => {
      toast({
        title: "Seller Rejected",
        description: "The seller has been rejected successfully.",
      });
      
      // Immediately remove the rejected seller from the UI
      if (Array.isArray(sellers)) {
        const updatedSeller = sellers.find(s => s.id === rejectedSellerId);
        if (updatedSeller) {
          updatedSeller.rejected = true;
        }
      }
      
      setRejectDialogOpen(false);
      setProcessingId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/sellers"] });
    },
    onError: (error) => {
      toast({
        title: "Rejection Failed",
        description: error instanceof Error ? error.message : "Failed to reject seller",
        variant: "destructive",
      });
      setProcessingId(null);
    }
  });

  const handleApproveSeller = (sellerId: number) => {
    setProcessingId(sellerId);
    approveSellerMutation.mutate(sellerId);
  };

  const handleRejectSeller = (sellerId: number) => {
    setProcessingId(sellerId);
    
    // Close dialog immediately to show the user something happened
    setRejectDialogOpen(false);
    
    // Show immediate visual feedback
    toast({
      title: "Processing",
      description: "Rejecting seller...",
    });
    
    rejectSellerMutation.mutate(sellerId);
  };

  const onCreateSellerSubmit = (data: CreateSellerForm) => {
    createSellerMutation.mutate(data);
  };

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Sellers Management</h1>
          <p className="text-muted-foreground">
            Manage and onboard sellers on the platform
          </p>
        </div>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              Add Seller
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Seller</DialogTitle>
              <DialogDescription>
                Add a new seller to the platform. They will receive an email with login credentials.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onCreateSellerSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter seller's email" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="businessName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter business name" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter phone number" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter business address" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createSellerMutation.isPending}
                  >
                    {createSellerMutation.isPending ? "Creating..." : "Create Seller"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Sellers</CardTitle>
          <CardDescription>
            View and manage all sellers on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Array.isArray(activeSellers) && activeSellers.length > 0 ? (
            <>
              <div className="mb-4 flex items-center">
                <div className="text-sm text-muted-foreground">
                  Showing active and pending sellers only. Rejected sellers are hidden.
                </div>
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Business Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Total Products</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeSellers.map((seller: any) => (
                    <TableRow key={seller.id}>
                      <TableCell className="font-medium">{seller.businessName}</TableCell>
                      <TableCell>{seller.email}</TableCell>
                      <TableCell>{seller.phoneNumber || "N/A"}</TableCell>
                      <TableCell>
                        {seller.createdAt 
                          ? new Date(seller.createdAt).toLocaleDateString() 
                          : "N/A"}
                      </TableCell>
                      <TableCell>{seller.totalProducts || 0}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={() => handleViewSeller(seller)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="icon"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          
                          <div className="flex flex-col gap-2 ml-2">
                            {/* Status Indicator */}
                            <div>
                              {seller.approved && !seller.rejected && (
                                <div className="flex items-center space-x-1 text-green-700">
                                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                                  <span className="font-semibold">APPROVED</span>
                                </div>
                              )}
                              {!seller.approved && !seller.rejected && (
                                <div className="flex items-center space-x-1 text-amber-700">
                                  <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
                                  <span className="font-semibold">PENDING</span>
                                </div>
                              )}
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex space-x-2">
                              {!seller.approved && !seller.rejected && (
                                <Button 
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleApproveSeller(seller.id)}
                                  className="bg-green-600 hover:bg-green-700 text-white"
                                  disabled={processingId === seller.id}
                                >
                                  {processingId === seller.id ? "Processing..." : "Approve"}
                                </Button>
                              )}
                              
                              <Button 
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  if (confirm("Are you sure you want to reject this seller? They will be removed from the list.")) {
                                    handleRejectSeller(seller.id);
                                  }
                                }}
                                disabled={processingId === seller.id || seller.rejected}
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </>
          ) : (
            <div className="py-24 flex flex-col items-center justify-center text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No active sellers found</h3>
              <p className="text-muted-foreground">
                There are no active sellers on the platform yet. Add your first seller using the "Add Seller" button.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seller Rejection Confirmation Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Seller Rejection</DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this seller? This action will prevent the seller from listing products on the platform.
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="my-4 p-4 bg-red-50 rounded-md border border-red-200">
              <h3 className="font-medium text-red-800">
                {selectedSeller.businessName}
              </h3>
              <p className="text-sm text-red-700 mt-1">
                {selectedSeller.email}
              </p>
            </div>
          )}
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                if (selectedSeller) {
                  handleRejectSeller(selectedSeller.id);
                }
              }}
              disabled={rejectSellerMutation.isPending}
            >
              {rejectSellerMutation.isPending ? "Rejecting..." : "Confirm Rejection"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Seller Detail Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Seller Details</DialogTitle>
            <DialogDescription>
              Detailed information about the seller
            </DialogDescription>
          </DialogHeader>
          
          {selectedSeller && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold">{selectedSeller.businessName}</h3>
                <p className="text-sm text-muted-foreground">
                  Joined on {selectedSeller.createdAt 
                    ? new Date(selectedSeller.createdAt).toLocaleDateString() 
                    : "N/A"}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p>{selectedSeller.email}</p>
                </div>
                
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p>{selectedSeller.phoneNumber || "N/A"}</p>
                </div>
                
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{selectedSeller.address || "N/A"}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground">Business Details</p>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm font-medium">Total Products</p>
                    <p>{selectedSeller.totalProducts || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Total Orders</p>
                    <p>{selectedSeller.totalOrders || 0}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium">Total Revenue</p>
                    <p>₹{selectedSeller.totalRevenue?.toLocaleString() || "0"}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}