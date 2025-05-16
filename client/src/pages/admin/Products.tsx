import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import AdminLayout from "@/components/layout/AdminLayout";
import { getPendingProducts, getApprovedProducts, approveProduct, rejectProduct, deleteProduct } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatCurrency, getProductStatusBadgeColor } from "@/lib/utils";
import { Package, Check, X, Trash, AlertCircle } from "lucide-react";

export default function AdminProducts() {
  const { toast } = useToast();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("pending");

  const {
    data: pendingProducts,
    isLoading: pendingLoading,
    refetch: refetchPending,
  } = useQuery({
    queryKey: ["/api/admin/products/pending"],
  });

  const {
    data: approvedProducts,
    isLoading: approvedLoading,
    refetch: refetchApproved,
  } = useQuery({
    queryKey: ["/api/products"],
  });

  const handleApproveProduct = async (productId: number) => {
    try {
      await approveProduct(productId);
      toast({
        title: "Success",
        description: "Product has been approved.",
      });
      refetchPending();
      refetchApproved();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve product.",
        variant: "destructive",
      });
    }
  };

  const handleRejectProduct = async (productId: number) => {
    try {
      await rejectProduct(productId);
      toast({
        title: "Success",
        description: "Product has been rejected.",
      });
      refetchPending();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject product.",
        variant: "destructive",
      });
    }
  };

  const openDeleteDialog = (product: any) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct(selectedProduct.id);
      toast({
        title: "Success",
        description: "Product has been deleted.",
      });
      refetchPending();
      refetchApproved();
      setDeleteDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete product.",
        variant: "destructive",
      });
    }
  };

  const ProductCard = ({ product, isPending = false }: { product: any, isPending?: boolean }) => (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="h-48 bg-gray-100 relative">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        <Badge
          className={`absolute top-2 right-2 ${getProductStatusBadgeColor(product.status)}`}
        >
          {product.status}
        </Badge>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-1 truncate">{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2">
          Seller: {product.sellerBusinessName || "Unknown"}
        </p>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary">{formatCurrency(product.price)}</span>
          <div className="flex space-x-2">
            {isPending ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200"
                  onClick={() => handleApproveProduct(product.id)}
                >
                  <Check className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-red-50 text-red-700 hover:bg-red-100 border-red-200"
                  onClick={() => handleRejectProduct(product.id)}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50"
                onClick={() => openDeleteDialog(product)}
              >
                <Trash className="h-4 w-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Manage Products</h1>

        <Tabs
          defaultValue="pending"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="pending">Pending Approval</TabsTrigger>
            <TabsTrigger value="approved">Approved Products</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingLoading ? (
              <div className="text-center py-12">
                <div className="spinner mb-4"></div>
                <p>Loading pending products...</p>
              </div>
            ) : !pendingProducts || pendingProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col items-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No pending products</h3>
                  <p className="mt-1 text-sm text-gray-500">All products have been reviewed.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} isPending={true} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="approved">
            {approvedLoading ? (
              <div className="text-center py-12">
                <div className="spinner mb-4"></div>
                <p>Loading approved products...</p>
              </div>
            ) : !approvedProducts || approvedProducts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <div className="flex flex-col items-center">
                  <Package className="h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No approved products</h3>
                  <p className="mt-1 text-sm text-gray-500">Approved products will appear here.</p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedProducts
                  .filter((product: any) => product.status === "approved")
                  .map((product: any) => (
                    <ProductCard key={product.id} product={product} isPending={false} />
                  ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Product Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the product &quot;{selectedProduct?.name}&quot;. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteProduct}
              className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
