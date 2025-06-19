"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, BookOpen, MoreVertical, Edit, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import useRefetch from "hooks/use-refetch";
import moment from "moment";
import FadeLoader from "react-spinners/FadeLoader";
import type { FormInput, Subject } from "@/types";
import SubjectHeader from "@/components/subject-header";
import TopHeader from "@/components/TopHeader";
import { getEarliestNextReviewDate } from "@/utils/utils";

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
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
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

  const updateSubject = api.subject.updateSubject.useMutation({
    onSuccess: () => {
      toast.success("Subject updated");
      void refetch();
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteSubject = api.subject.deleteSubject.useMutation({
    onSuccess: () => {
      toast.success("Subject deleted");
      void refetch();
    },
    onError: () => {
      toast.error("This subject is linked to a session or review");
    },
  });

  const handleEditSubject = (subject: Subject) => {
    const newTitle = prompt("Enter new subject title", subject.title);
    if (!newTitle) return;
    updateSubject.mutate({
      id: subject.id,
      title: newTitle,
      color: subject.color,
    });
  };

  const handleDeleteSubject = (id: string) => {
    deleteSubject.mutate({
      id: id,
    });
    setIsDeleteDialogOpen(false);
    setSelectedCardId("");
  };

  const onSubmit = (data: FormInput) => {
    setLoading(true);
    if (!clerkUser.user?.id) {
      toast.error("User not found");
      return;
    }

    if (data.title === "") {
      toast.error("Please enter the subject");
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
      <TopHeader
        title="Subjects"
        subtitle="Organize your study materials by subject"
        buttonText="New Subject"
        functionProp={() => setIsCreateDialogOpen(true)}
      />

      {isPending ? (
        <div className="mt-[250px] flex items-center justify-center">
          <FadeLoader className="h-15 w-15" color="#a5a7a9" />
        </div>
      ) : (
        <div className="p-6">
          {/* Stats Overview */}
          <SubjectHeader />

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
                  className="gap-0 transition-shadow hover:shadow-lg"
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
                            onClick={() => handleEditSubject(subject)}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedCardId(subject.id);
                              setIsDeleteDialogOpen(true);
                            }}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4 text-red-600" />
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
                          {subject.flashcards.length ?? 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-600">Created</div>
                        <div className="font-semibold">
                          {/* {format(subject.createdAt, "PPP")} */}
                          {moment(subject.createdAt).format("MMM D, YYYY")}
                        </div>
                      </div>
                    </div>

                    <div className="text-sm">
                      <div className="text-gray-600">Next Review</div>
                      <div className="font-semibold">
                        {getEarliestNextReviewDate(subject)
                          ? getEarliestNextReviewDate(subject)
                          : "-"}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create New Subject</DialogTitle>
            <DialogDescription>
              Add a new subject to organize your study materials.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
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

      {/* Delete dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete subject</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this subject? This action cannot be
            undone.
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              className="cursor-pointer"
              disabled={deleteSubject.status === "pending"}
              onClick={() => {
                handleDeleteSubject(selectedCardId!);
              }}
            >
              Delete
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer"
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
