import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Separator } from "@/components/ui/separator";

const checkoutSchema = z.object({
  shippingAddress: z.string().min(5, { message: "Shipping address is required" }),
  city: z.string().min(2, { message: "City is required" }),
  state: z.string().min(2, { message: "State is required" }),
  zipCode: z.string().min(5, { message: "Valid zip code is required" }),
  paymentMethod: z.string().min(1, { message: "Payment method is required" }),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

export default function CustomerCheckout() {
  const { user, token } = useAuth();
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  const form = useForm<CheckoutForm>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: "",
      city: "",
      state: "",
      zipCode: "",
      paymentMethod: "cash_on_delivery", // Default payment method
    },
  });

  // Fetch cart data
  const { data: cartData } = useQuery({
    queryKey: ["/api/customer/cart"],
    enabled: !!token && !!user,
  });

  useEffect(() => {
    if (cartData && cartData.items) {
      const items = Array.isArray(cartData.items) ? cartData.items : [];
      setCartItems(items);
      
      // Calculate total
      const total = items.reduce(
        (sum: number, item: any) => sum + (parseFloat(item.price || '0') * item.quantity),
        0
      );
      setCartTotal(total);
    }
  }, [cartData]);

  const createOrderMutation = useMutation({
    mutationFn: async (data: any) => {
      return fetch("/api/customer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(data)
      }).then(res => res.json());
    },
    onSuccess: () => {
      // Clear cart by updating it to empty
      fetch("/api/customer/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ items: [] })
      }).then(() => {
        console.log("Cart cleared after order placement");
      }).catch(err => {
        console.error("Failed to clear cart after order:", err);
      });
      
      toast({
        title: "Order Placed Successfully",
        description: "Your order has been placed and is being processed.",
      });
      navigate("/orders");
    },
    onError: (error) => {
      toast({
        title: "Error Placing Order",
        description: "There was a problem placing your order. Please try again.",
        variant: "destructive",
      });
      console.error("Order creation error:", error);
    },
  });

  const onSubmit = (data: CheckoutForm) => {
    if (cartItems.length === 0) {
      toast({
        title: "Empty Cart",
        description: "Your cart is empty. Please add items before checkout.",
        variant: "destructive",
      });
      return;
    }

    // Create full address string from form fields
    const fullAddress = `${data.shippingAddress}, ${data.city}, ${data.state} ${data.zipCode}`;
    
    // Prepare order data with the complete address
    const orderData = {
      address: fullAddress,
      items: cartItems.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        message: item.message
      }))
    };

    createOrderMutation.mutate(orderData);
  };

  if (cartItems.length === 0 && !createOrderMutation.isPending) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Checkout</CardTitle>
            <CardDescription>Your cart is empty</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Please add items to your cart before proceeding to checkout.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => navigate("/products")}>Browse Products</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Checkout</CardTitle>
              <CardDescription>Complete your order details</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shipping Address</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your shipping address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="City" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="State" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Zip Code</FormLabel>
                          <FormControl>
                            <Input placeholder="Zip Code" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment Method</FormLabel>
                        <FormControl>
                          <select 
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            {...field}
                          >
                            <option value="cash_on_delivery">Cash on Delivery</option>
                            <option value="credit_card">Credit Card</option>
                            <option value="upi">UPI</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Processing..." : "Place Order"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <Separator />
                
                <div className="flex justify-between font-medium">
                  <p>Subtotal</p>
                  <p>₹{cartTotal.toFixed(2)}</p>
                </div>
                
                <div className="flex justify-between text-sm">
                  <p>Shipping</p>
                  <p>₹0.00</p>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold">
                  <p>Total</p>
                  <p>₹{cartTotal.toFixed(2)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}