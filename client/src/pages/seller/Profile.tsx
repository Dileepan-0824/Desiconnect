import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SellerLayout from "@/components/layout/SellerLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  getSellerProfile, 
  updateSellerProfile 
} from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Building,
  FileText,
  Save,
  AlertCircle
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { queryClient } from "@/lib/queryClient";

export default function SellerProfile() {
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Form state
  const [businessName, setBusinessName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [businessAddress, setBusinessAddress] = useState("");
  const [warehouseAddress, setWarehouseAddress] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [gst, setGst] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["/api/seller/profile"],
    onSuccess: (data) => {
      setBusinessName(data.businessName || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setBusinessAddress(data.businessAddress || "");
      setWarehouseAddress(data.warehouseAddress || "");
      setZipCode(data.zipCode || "");
      setGst(data.gst || "");
    }
  });

  const handleSaveProfile = async () => {
    if (!businessName) {
      toast({
        variant: "destructive",
        title: "Validation error",
        description: "Business name is required",
      });
      return;
    }

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Password mismatch",
        description: "New password and confirm password do not match",
      });
      return;
    }

    setIsUpdating(true);

    try {
      const updateData = {
        businessName,
        phone,
        businessAddress,
        warehouseAddress,
        zipCode,
        gst,
      };

      // Only include password fields if attempting to change password
      if (newPassword && currentPassword) {
        Object.assign(updateData, {
          currentPassword,
          newPassword,
        });
      }

      await updateSellerProfile(updateData);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });

      // Reset password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // Refetch the profile data
      queryClient.invalidateQueries({queryKey: ["/api/seller/profile"]});
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="text-center py-12">Loading profile...</div>
      </SellerLayout>
    );
  }

  if (isError) {
    return (
      <SellerLayout>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load profile. Please refresh the page.
          </AlertDescription>
        </Alert>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <h1 className="text-2xl font-bold mb-6">Business Profile</h1>

      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="businessName" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Business Name*
                </Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Your Business Name"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  value={email}
                  readOnly
                  disabled
                  className="mt-1 bg-gray-50"
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              <div>
                <Label htmlFor="phone" className="flex items-center">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="gst" className="flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  GST Number
                </Label>
                <Input
                  id="gst"
                  value={gst}
                  onChange={(e) => setGst(e.target.value)}
                  placeholder="22AAAAA0000A1Z5"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="businessAddress" className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  Business Address
                </Label>
                <Textarea
                  id="businessAddress"
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  placeholder="Enter your business address"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="warehouseAddress" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Warehouse Address
                </Label>
                <Textarea
                  id="warehouseAddress"
                  value={warehouseAddress}
                  onChange={(e) => setWarehouseAddress(e.target.value)}
                  placeholder="Enter your warehouse address"
                  className="mt-1"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  Zip Code
                </Label>
                <Input
                  id="zipCode"
                  value={zipCode}
                  onChange={(e) => setZipCode(e.target.value)}
                  placeholder="400001"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Change Password
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-1"
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1"
                    />
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Leave the password fields empty if you don't want to change it.
              </p>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={handleSaveProfile} 
                disabled={isUpdating}
                className="flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {isUpdating ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </SellerLayout>
  );
}
