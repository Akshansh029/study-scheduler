"use client";

import type React from "react";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  User,
  Mail,
  Edit3,
  Camera,
  Trophy,
  Flame,
  Save,
  X,
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import TopHeader from "@/components/TopHeader";
import Image from "next/image";
import { api } from "@/trpc/react";
import useRefetch from "hooks/use-refetch";

// Mock user data based on your schema
interface UserProfile {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  emailAddress: string;
  message: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  todo: { id: string }[];
}

export default function ProfilePage() {
  const [isEditingMessage, setIsEditingMessage] = useState(false);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [editMessage, setEditMessage] = useState("");
  const { data: userData, isLoading } = api.user.getUserDetails.useQuery();
  const [editImageUrl, setEditImageUrl] = useState(userData?.imageUrl ?? "");

  const refetch = useRefetch();

  const updateMsgMutation = api.user.changeMessage.useMutation({
    onSuccess: () => {
      toast.success("Personal message changed successfully");
      void refetch();
    },
    onError: () => {
      toast.error("Could not change personal message, try later");
    },
  });

  const handleSaveMessage = () => {
    if (!editMessage) {
      toast.error("Message cannot be empty");
      return;
    }
    updateMsgMutation.mutate({
      userId: userData!.id,
      newMsg: editMessage,
    });
    setEditMessage("");
    setIsEditingMessage(false);
  };

  const handleSaveImage = () => {
    // TODO: Call tRPC mutation to update user image
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // TODO: Upload to your preferred storage (Vercel Blob, Cloudinary, etc.)
      // For now, we'll use a placeholder
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImageUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getDisplayName = () => {
    if (isLoading) {
      return "--";
    } else {
      if (userData?.firstName && userData?.lastName) {
        return `${userData?.firstName} ${userData?.lastName}`;
      }
      if (userData?.firstName) {
        return userData?.firstName;
      }
      return userData?.emailAddress.split("@")[0];
    }
  };

  const getInitials = () => {
    if (userData?.firstName && userData?.lastName) {
      return `${userData?.firstName[0]}${userData?.lastName[0]}`.toUpperCase();
    }
    if (userData?.firstName) {
      return userData?.firstName ? userData?.firstName[0]!.toUpperCase() : "";
    }
    return userData?.emailAddress[0]!.toUpperCase();
  };

  const memberSince = isLoading
    ? "-"
    : moment(userData?.createdAt).format("MMMM YYYY");
  const lastUpdated = isLoading ? "-" : moment(userData?.updatedAt).fromNow();

  return (
    <div className="h-screen bg-gray-50">
      <TopHeader
        title="Profile"
        subtitle="Manage your account and preferences"
      />

      <div className="flex h-[calc(100vh-89px)] items-center justify-center p-6">
        {isLoading ? (
          <p className="text-muted-foreground text-xl">Fetching user data...</p>
        ) : (
          <Card className="w-full max-w-4xl">
            <CardContent className="p-8">
              <div className="flex flex-col gap-8 lg:flex-row">
                <div className="flex flex-col items-center space-y-6 lg:w-1/2 lg:items-start">
                  {/* Profile Image */}
                  <div className="relative">
                    <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                      {userData?.imageUrl ? (
                        <Image
                          src={userData?.imageUrl ?? "/placeholder.svg"}
                          alt="Profile"
                          className="h-full w-full object-cover"
                          height={32}
                          width={32}
                        />
                      ) : (
                        <span className="text-4xl font-bold text-white">
                          {getInitials()}
                        </span>
                      )}
                    </div>
                    <Dialog
                      open={isEditingImage}
                      onOpenChange={setIsEditingImage}
                    >
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="absolute -right-2 -bottom-2 h-10 w-10 rounded-full bg-indigo-600 p-0 hover:bg-indigo-700"
                        >
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Update Profile Image</DialogTitle>
                          <DialogDescription>
                            Change your profile picture by uploading a new image
                            or entering a URL.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="image-upload">Upload Image</Label>
                            <Input
                              id="image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="image-url">
                              Or enter image URL
                            </Label>
                            <Input
                              id="image-url"
                              placeholder="https://example.com/image.jpg"
                              value={editImageUrl}
                              onChange={(e) => setEditImageUrl(e.target.value)}
                              className="mt-1"
                            />
                          </div>
                          {editImageUrl && (
                            <div className="flex justify-center">
                              <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100">
                                <Image
                                  src={editImageUrl ?? "/placeholder.svg"}
                                  alt="Preview"
                                  className="h-full w-full object-cover"
                                  height={20}
                                  width={20}
                                />
                              </div>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button
                            variant="outline"
                            onClick={() => setIsEditingImage(false)}
                          >
                            Cancel
                          </Button>
                          <Button onClick={handleSaveImage}>
                            Save Changes
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* User Name and Email */}
                  <div className="text-center lg:text-left">
                    <h2 className="mb-2 text-3xl font-bold text-gray-900">
                      {getDisplayName()}
                    </h2>
                    <div className="mb-4 flex items-center gap-2 text-gray-600">
                      <Mail className="h-4 w-4" />
                      <span>{isLoading ? "-" : userData?.emailAddress}</span>
                    </div>
                  </div>

                  {/* Motivational Message */}
                  <div className="w-full rounded-lg border border-indigo-100 bg-gradient-to-r from-indigo-50 to-purple-50 p-4">
                    {isEditingMessage ? (
                      <div className="space-y-3">
                        <Textarea
                          value={editMessage}
                          onChange={(e) => setEditMessage(e.target.value)}
                          placeholder="Enter your motivational message..."
                          className="resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={handleSaveMessage}
                            className="cursor-pointer"
                            disabled={updateMsgMutation.status === "pending"}
                          >
                            <Save className="mr-1 h-4 w-4" />
                            {updateMsgMutation.status === "pending"
                              ? "Saving"
                              : "Save"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="cursor-pointer"
                            onClick={() => {
                              // setEditMessage(userData?.message);
                              setIsEditingMessage(false);
                            }}
                          >
                            <X className="mr-1 h-4 w-4" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-around">
                        <p className="flex-1 font-medium text-indigo-800 italic">
                          {isLoading ? "Loading..." : userData?.message}
                        </p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setIsEditingMessage(true)}
                          className="ml-2 cursor-pointer text-indigo-600 hover:text-indigo-700"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column - Account Details */}
                <div className="space-y-6 lg:w-1/2">
                  {/* Account Information */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <User className="h-5 w-5" />
                      Account Information
                    </h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            First Name
                          </Label>
                          <p className="text-gray-900">
                            {isLoading ? "-" : userData?.firstName}
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-600">
                            Last Name
                          </Label>
                          <p className="text-gray-900">
                            {isLoading ? "-" : userData?.lastName}
                          </p>
                        </div>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-600">
                          User ID
                        </Label>
                        <p className="font-mono text-sm text-gray-500">
                          {isLoading ? "-" : userData?.id}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Activity Summary */}
                  <div>
                    <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
                      <Trophy className="h-5 w-5" />
                      Activity Summary
                    </h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Member since
                        </span>
                        <Badge variant="secondary">{memberSince}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Account created
                        </span>
                        <Badge variant="secondary">
                          {isLoading
                            ? "-"
                            : moment(userData?.createdAt).format("MMM D, YYYY")}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Last updated
                        </span>
                        <Badge variant="outline">{lastUpdated}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Study streak
                        </span>
                        <Badge className="bg-orange-100 text-orange-800">
                          <Flame className="mr-1 h-3 w-3" />7 days
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          Pending todos
                        </span>
                        <Badge variant="destructive">
                          {isLoading ? 0 : userData?.Todo.length}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
