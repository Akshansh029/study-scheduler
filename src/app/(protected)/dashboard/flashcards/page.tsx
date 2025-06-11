"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Play,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  BookOpen,
  Brain,
} from "lucide-react";
import { toast } from "sonner";
import moment from "moment";
import { api } from "@/trpc/react";
import FlashcardHeader from "@/components/flashcard-header";
import useRefetch from "hooks/use-refetch";
import { set } from "zod";
import FadeLoader from "react-spinners/FadeLoader";
import TopHeader from "@/components/TopHeader";

// Types based on the schema
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  repetitionCount: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
  subjectId: string;
  subject: Subject;
  createdAt: Date;
  updatedAt: Date;
}

interface Subject {
  id: string;
  title: string;
  color: string;
}

export default function FlashcardsPage() {
  // State for flashcards and subjects
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string | null>("all");
  const [filterDueToday, setFilterDueToday] = useState(false);

  // State for flashcard creation/editing
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(
    null,
  );
  const [form, setForm] = useState({
    question: "",
    answer: "",
    subjectId: "",
  });

  const refetch = useRefetch();

  const createCardMutation = api.flashcard.create.useMutation({
    onSuccess: () => {
      toast.success("Flashcard created successfully");
      void refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create flashcard: ${error.message}`);
    },
  });

  const updateCardMutation = api.flashcard.update.useMutation({
    onSuccess: () => {
      toast.success("Flashcard updated successfully");
      void refetch();
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update flashcard: ${error.message}`);
    },
  });

  const deleteCardMutation = api.flashcard.delete.useMutation({
    onSuccess: () => {
      toast.success("Flashcard deleted successfully");
      void refetch();
      setIsDeleteDialogOpen(false);
      setSelectedCardId(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete flashcard: ${error.message}`);
    },
  });

  const { data: flashcardData, isLoading } = api.flashcard.getAll.useQuery();
  useEffect(() => {
    if (flashcardData?.subjects) {
      setSubjects(flashcardData.subjects);
    }
  }, [flashcardData?.subjects]);

  useEffect(() => {
    if (flashcardData?.flashcards) {
      setFlashcards(flashcardData.flashcards);
    }
  }, [flashcardData?.flashcards]);

  // Apply filters to flashcards
  const filteredFlashcards = flashcards.filter((card) => {
    // Search query filter
    const matchesSearch =
      searchQuery === "" ||
      card.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.answer.toLowerCase().includes(searchQuery.toLowerCase());

    // Subject filter
    const matchesSubject =
      !selectedSubject ||
      selectedSubject === "all" ||
      card.subjectId === selectedSubject;

    // Due today filter
    const matchesDueToday =
      !filterDueToday ||
      moment(card.nextReviewDate).isSameOrBefore(moment(), "day");

    return matchesSearch && matchesSubject && matchesDueToday;
  });

  // Group flashcards by subject
  const flashcardsBySubject = filteredFlashcards.reduce<
    Record<string, Flashcard[]>
  >((acc, card) => {
    acc[card.subjectId] ??= [];
    acc[card.subjectId]?.push(card);
    return acc;
  }, {});

  // Functions for flashcard management
  function openCreateDialog() {
    setEditingFlashcard(null);
    setForm({
      question: "",
      answer: "",
      subjectId: "",
    });
    setIsDialogOpen(true);
  }

  function openEditDialog(flashcard: Flashcard) {
    setEditingFlashcard(flashcard);
    setForm({
      question: flashcard.question,
      answer: flashcard.answer,
      subjectId: flashcard.subjectId,
    });
    setIsDialogOpen(true);
  }

  function resetForm() {
    setIsDialogOpen(false);
    setEditingFlashcard(null);
    setForm({
      question: "",
      answer: "",
      subjectId: "",
    });
  }

  function handleSaveFlashcard() {
    if (!form.question || !form.answer || !form.subjectId) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (editingFlashcard) {
      // Update flashcard
      updateCardMutation.mutate({
        id: editingFlashcard.id,
        question: form.question,
        answer: form.answer,
        subjectId: form.subjectId,
      });
    } else {
      // create flashcard
      createCardMutation.mutate({
        question: form.question,
        answer: form.answer,
        subjectId: form.subjectId,
      });
    }

    resetForm();
  }

  function deleteCard(cardId: string) {
    if (selectedCardId !== cardId) return;
    if (cardId) {
      deleteCardMutation.mutate(cardId);
    } else {
      toast.error("No flashcard selected for deletion");
      setSelectedCardId(null);
    }
  }

  function getFlashcardStatus(card: Flashcard) {
    const now = new Date();
    if (card.repetitionCount === 0) {
      return {
        status: "not-reviewed",
        icon: <AlertCircle className="h-4 w-4 text-gray-400" />,
        label: "Not Reviewed",
      };
    } else if (new Date(card.nextReviewDate) <= now) {
      return {
        status: "due",
        icon: <Clock className="h-4 w-4 text-orange-500" />,
        label: "Due",
      };
    } else {
      return {
        status: "reviewed",
        icon: <CheckCircle className="h-4 w-4 text-green-500" />,
        label: "Reviewed",
      };
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TopHeader
        functionProp={openCreateDialog}
        title="Flashcards"
        subtitle="Create and manage your study materials"
        buttonText="New Flashcard"
      />
      <FlashcardHeader />
      {/* Search and Filters */}
      <div className="px-6 pb-6">
        <Card>
          <CardContent className="px-6">
            <div className="flex flex-col gap-4 md:flex-row">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-gray-500" />
                <Input
                  placeholder="Search flashcards..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select
                  value={selectedSubject ?? ""}
                  onValueChange={(value) => setSelectedSubject(value || null)}
                >
                  <SelectTrigger className="w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="All Subjects" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: subject.color }}
                          />
                          {subject.title}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant={filterDueToday ? "default" : "outline"}
                  onClick={() => setFilterDueToday(!filterDueToday)}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Due Today
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      {/* Flashcards List */}
      {isLoading ? (
        <div className="px-auto flex h-64 items-center justify-center">
          <FadeLoader className="h-15 w-15" color="#a5a7a9" />
        </div>
      ) : (
        <div className="px-6 pb-6">
          <Card>
            <CardHeader>
              <CardTitle>My Flashcards</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="bySubject" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger
                    value="bySubject"
                    className="flex items-center gap-2"
                  >
                    <BookOpen className="h-4 w-4" />
                    By Subject
                  </TabsTrigger>
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    <Brain className="h-4 w-4" />
                    All Flashcards
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="bySubject" className="mt-6">
                  {Object.keys(flashcardsBySubject).length === 0 ? (
                    <div className="py-12 text-center">
                      <BookOpen className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                      <h3 className="mb-2 text-lg font-semibold text-gray-900">
                        No flashcards found
                      </h3>
                      <p className="mb-6 text-gray-600">
                        {searchQuery || selectedSubject || filterDueToday
                          ? "Try adjusting your search or filters"
                          : "Create your first flashcard to get started"}
                      </p>
                      <Button onClick={openCreateDialog}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Your First Flashcard
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {subjects.map((subject) => {
                        const subjectCards =
                          flashcardsBySubject[subject.id] ?? [];
                        if (subjectCards.length === 0) return null;

                        return (
                          <AccordionItem key={subject.id} value={subject.id}>
                            <AccordionTrigger className="rounded-lg px-4 hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div
                                  className="h-4 w-4 rounded-full"
                                  style={{ backgroundColor: subject.color }}
                                />
                                <span>{subject.title}</span>
                                <Badge variant="secondary" className="ml-2">
                                  {subjectCards.length}
                                </Badge>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-3 pt-2">
                                {subjectCards.map((card) => {
                                  const { status, icon, label } =
                                    getFlashcardStatus(card);

                                  return (
                                    <Card
                                      key={card.id}
                                      className="transition-shadow hover:shadow-sm"
                                    >
                                      <CardContent className="px-4">
                                        <div className="flex items-center justify-between">
                                          <div className="flex-1">
                                            <div className="mb-1 flex items-center gap-2">
                                              {icon}
                                              <span className="text-xs text-gray-500">
                                                {label}
                                              </span>
                                              {status === "due" && (
                                                <Badge
                                                  variant="outline"
                                                  className="border-orange-200 bg-orange-50 text-xs text-orange-700"
                                                >
                                                  Review Now
                                                </Badge>
                                              )}
                                            </div>
                                            <h3 className="font-medium text-gray-900">
                                              {card.question}
                                            </h3>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                openEditDialog(card)
                                              }
                                            >
                                              <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => {
                                                setSelectedCardId(card.id);
                                                setIsDeleteDialogOpen(true);
                                              }}
                                            >
                                              <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                              size="sm"
                                              className="bg-indigo-600 hover:bg-indigo-700"
                                            >
                                              <Play className="mr-2 h-4 w-4" />
                                              Practice
                                            </Button>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                                <Button
                                  variant="outline"
                                  className="mt-2 w-full"
                                  onClick={() => {
                                    setForm((prev) => ({
                                      ...prev,
                                      subjectId: subject.id,
                                    }));
                                    openCreateDialog();
                                  }}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Flashcard to {subject.title}
                                </Button>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        );
                      })}
                    </Accordion>
                  )}
                </TabsContent>

                <TabsContent value="all" className="mt-6">
                  <div className="space-y-3">
                    {filteredFlashcards.length === 0 ? (
                      <div className="py-12 text-center">
                        <Brain className="mx-auto mb-4 h-16 w-16 text-gray-400" />
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          No flashcards found
                        </h3>
                        <p className="mb-6 text-gray-600">
                          {searchQuery || selectedSubject || filterDueToday
                            ? "Try adjusting your search or filters"
                            : "Create your first flashcard to get started"}
                        </p>
                        <Button onClick={openCreateDialog}>
                          <Plus className="mr-2 h-4 w-4" />
                          Create Your First Flashcard
                        </Button>
                      </div>
                    ) : (
                      filteredFlashcards.map((card) => {
                        const { status, icon, label } =
                          getFlashcardStatus(card);

                        return (
                          <Card
                            key={card.id}
                            className="transition-shadow hover:shadow-sm"
                          >
                            <CardContent className="px-4">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <div className="mb-1 flex items-center gap-2">
                                    <div
                                      className="h-3 w-3 rounded-full"
                                      style={{
                                        backgroundColor: card.subject.color,
                                      }}
                                    />
                                    <span className="text-xs text-gray-500">
                                      {card.subject.title}
                                    </span>
                                    {icon}
                                    <span className="text-xs text-gray-500">
                                      {label}
                                    </span>
                                  </div>
                                  <h3 className="font-medium text-gray-900">
                                    {card.question}
                                  </h3>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => openEditDialog(card)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedCardId(card.id);
                                      setIsDeleteDialogOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700"
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    Practice
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingFlashcard ? "Edit Flashcard" : "Create New Flashcard"}
            </DialogTitle>
            <DialogDescription>
              {editingFlashcard
                ? "Update your flashcard details below."
                : "Add a new flashcard to your study materials."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={form.subjectId}
                onValueChange={(value) =>
                  setForm({ ...form, subjectId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.title}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="question">Question</Label>
              <Input
                id="question"
                placeholder="Enter your question"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="answer">Answer</Label>
              <Textarea
                id="answer"
                placeholder="Enter the answer"
                rows={5}
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={resetForm}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFlashcard}
              className="cursor-pointer"
              disabled={
                createCardMutation.status === "pending" ||
                updateCardMutation.status === "pending"
              }
            >
              {editingFlashcard ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Flashcard</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Are you sure you want to delete this flashcard? This action cannot
            be undone.
          </DialogDescription>
          <div className="flex justify-end gap-2">
            <Button
              variant="destructive"
              className="cursor-pointer"
              onClick={() => {
                deleteCard(selectedCardId!);
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
      ;
    </div>
  );
}
