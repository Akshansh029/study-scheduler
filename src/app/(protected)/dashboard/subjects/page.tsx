/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  BookOpen,
  MoreVertical,
  Edit,
  Trash2,
  Calendar,
  Target,
} from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import useRefetch from "hooks/use-refetch";

interface Subject {
  id: string;
  title: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  // Additional computed fields for display
  // cardCount?: number;
  // lastStudied?: Date;
  // nextReview?: Date;
}

type FormInput = {
  title: string;
  color: string;
};

const colorOptions = [
  { name: "Indigo", value: "#4F46E5", bg: "bg-indigo-500" },
  { name: "Purple", value: "#7C3AED", bg: "bg-purple-500" },
  { name: "Blue", value: "#2563EB", bg: "bg-blue-500" },
  { name: "Green", value: "#059669", bg: "bg-green-500" },
  { name: "Red", value: "#DC2626", bg: "bg-red-500" },
  { name: "Orange", value: "#EA580C", bg: "bg-orange-500" },
  { name: "Pink", value: "#DB2777", bg: "bg-pink-500" },
  { name: "Teal", value: "#0D9488", bg: "bg-teal-500" },
];

export default function SubjectsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedColor, setSelectedColor] = useState("#4F46E5");
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset } = useForm<FormInput>();

  const clerkUser = useUser();
  const refetch = useRefetch();

  // Subject retrieval and creation
  const { data: subjects, isPending } = api.subject.getSubjects.useQuery();
  const createSubject = api.subject.createSubject.useMutation({
    onSuccess: () => {
      toast.success("Subject created successfully");
      void refetch();
      reset();
      setSelectedColor("#4F46E5");
      setIsCreateDialogOpen(false);
      setLoading(false);
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  const onSubmit = (data: FormInput) => {
    setLoading(true);
    if (!clerkUser.user?.id) {
      toast.error("User not found");
      return;
    }

    createSubject.mutate({
      title: data.title,
      color: selectedColor,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Subjects</h1>
              <p className="text-gray-600">
                Organize your study materials by subject
              </p>
            </div>
          </div>
          <Dialog
            open={isCreateDialogOpen}
            onOpenChange={(open) => {
              if (!open) {
                setIsCreateDialogOpen(false);
                reset();
                setSelectedColor("#4F46E5");
              }
            }}
          >
            <DialogTrigger asChild>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Create New Subject</DialogTitle>
                <DialogDescription>
                  Add a new subject to organize your study materials.
                </DialogDescription>
              </DialogHeader>
              <form
                onSubmit={handleSubmit(onSubmit)}
                className="grid gap-4 py-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="title">Subject Name</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Physics, Mathematics, History"
                    {...register("title", { required: true })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Color Theme</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {colorOptions.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        className={`h-12 w-12 rounded-lg ${color.bg} ${
                          selectedColor === color.value
                            ? "ring-2 ring-gray-900 ring-offset-2"
                            : ""
                        }`}
                        onClick={() => setSelectedColor(color.value)}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => {
                      reset();
                      setIsCreateDialogOpen(false);
                      setSelectedColor("#4F46E5");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="cursor-pointer"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating" : "Create Subject"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {isPending ? (
        <div className="mt-[250px] flex items-center justify-center">
          <p>Retrieving all your data</p>
        </div>
      ) : (
        <div className="p-6">
          {/* Stats Overview */}
          <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Subjects
                </CardTitle>
                <BookOpen className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{subjects?.length}</div>
                <p className="text-muted-foreground text-xs">
                  Active study subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Cards
                </CardTitle>
                <Target className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {/* {subjects.reduce((sum, s) => sum + (s.cardCount ?? 0), 0)} */}
                  {subjects?.reduce((sum, s) => sum + 0, 0)}
                </div>
                <p className="text-muted-foreground text-xs">
                  Across all subjects
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Due Today</CardTitle>
                <Calendar className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">42</div>
                <p className="text-muted-foreground text-xs">Cards to review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Study Streak
                </CardTitle>
                <Target className="text-muted-foreground h-4 w-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">7 days</div>
                <p className="text-muted-foreground text-xs">Keep it up!</p>
              </CardContent>
            </Card>
          </div>

          {/* Subjects Grid */}
          {subjects?.length === 0 ? (
            <Card className="p-12 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
              <h3 className="mb-2 text-xl font-semibold text-gray-900">
                No subjects yet
              </h3>
              <p className="mb-6 text-gray-600">
                Create your first subject to start organizing your study
                materials.
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Subject
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {subjects?.map((subject) => (
                <Card
                  key={subject.id}
                  className="transition-shadow hover:shadow-lg"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-4 w-4 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        <CardTitle className="text-lg">
                          {subject.title}
                        </CardTitle>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                          // onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            // onClick={() => handleDeleteSubject(subject.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Cards</div>
                        <div className="font-semibold">
                          {/* {subject.cardCount ?? 0} */}0
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Created</div>
                        <div className="font-semibold">
                          {subject.createdAt.getUTCDate()}
                        </div>
                      </div>
                    </div>

                    {/* {subject.lastStudied && (
                        <div className="text-sm">
                        <div className="text-gray-600">Last studied</div>
                        <div className="font-semibold">
                        {subject.lastStudied.toLocaleDateString()}
                        </div>
                        </div>
                  )} */}

                    {/* {subject.nextReview && (
                    <div className="flex items-center gap-2">
                      <Badge
                      variant={
                          subject.nextReview <= new Date()
                          ? "destructive"
                            : "secondary"
                            }
                        className="text-xs"
                        >
                        {subject.nextReview <= new Date()
                        ? "Due Now"
                        : "Upcoming"}
                      </Badge>
                      <span className="text-xs text-gray-600">
                      {subject.nextReview.toLocaleDateString()}
                      </span>
                      </div>
                  )} */}

                    <div className="flex gap-2 pt-2">
                      <Button size="sm" className="flex-1">
                        Study Now
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Add Cards
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
