"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Microscope,
  Eye,
  AlertCircle,
  Building
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ResearchService } from "@/lib/firebase-service";

import { RequirePermission } from "@/lib/rbac";
import Link from "next/link";

export default function ResearchPage() {
  const [research, setResearch] = useState<Array<{id: string; title: string; abstract: string; authorName: string; department: string; status: string; coverImage?: string; contributors?: string[]; publishedAt: Date; updatedAt: Date}>>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [researchToDelete, setResearchToDelete] = useState<{id: string; title: string} | null>(null);

  // Fetch research from Firebase
  useEffect(() => {
    fetchResearch();
  }, []);

  const fetchResearch = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedResearch = await ResearchService.getResearchArticles(undefined, false, 50);
      setResearch(fetchedResearch);
    } catch (err) {
      console.error("Error fetching research:", err);
      setError("Failed to fetch research from database.");
    } finally {
      setLoading(false);
    }
  };

  // Filter research based on search and filters
  const filteredResearch = research.filter(article => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.authorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.department.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDepartment = departmentFilter === "all" || article.department === departmentFilter;
    const matchesStatus = statusFilter === "all" || article.status === statusFilter;

    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const handleDeleteResearch = async () => {
    if (!researchToDelete) return;

    setLoading(true);
    setError(null);

    try {
      await ResearchService.deleteResearchArticle(researchToDelete.id);
      setResearch(prev => prev.filter(article => article.id !== researchToDelete.id));
      setIsDeleteDialogOpen(false);
      setResearchToDelete(null);
    } catch (err) {
      console.error("Error deleting research:", err);
      setError("Failed to delete research article. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "published": return "bg-green-500";
      case "draft": return "bg-yellow-500";
      case "archived": return "bg-gray-500";
      default: return "bg-gray-500";
    }
  };

  const getDepartmentBadgeColor = (department: string) => {
    const colors = [
      "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-orange-500",
      "bg-red-500", "bg-indigo-500", "bg-pink-500", "bg-teal-500"
    ];
    const index = department.length % colors.length;
    return colors[index];
  };

  if (loading && research.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
          <p className="text-lg font-medium text-gray-300">Loading research...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Research Management</h1>
          <p className="text-gray-400">Manage Science Journal research articles</p>
        </div>

        <RequirePermission permission="write">
          <Link href="/admin/research/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Research
            </Button>
          </Link>
        </RequirePermission>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Research</CardTitle>
            <Microscope className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{research.length}</div>
            <p className="text-xs text-gray-400">All time</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Published</CardTitle>
            <Eye className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{research.filter(r => r.status === "published").length}</div>
            <p className="text-xs text-gray-400">Live articles</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Building className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(research.map(r => r.department)).size}
            </div>
            <p className="text-xs text-gray-400">Active departments</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Drafts</CardTitle>
            <Edit className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{research.filter(r => r.status === "draft").length}</div>
            <p className="text-xs text-gray-400">In progress</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search research..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-800 border-gray-700"
          />
        </div>

        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Departments</SelectItem>
            {Array.from(new Set(research.map(r => r.department))).map(dept => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="bg-red-900/50 border-red-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Research Table */}
      <div className="rounded-md border border-gray-800 overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-900">
            <TableRow className="hover:bg-gray-900 border-gray-800">
              <TableHead className="text-gray-400">Research</TableHead>
              <TableHead className="text-gray-400">Department</TableHead>
              <TableHead className="text-gray-400">Status</TableHead>
              <TableHead className="text-gray-400">Contributors</TableHead>
              <TableHead className="text-gray-400">Author</TableHead>
              <TableHead className="text-gray-400">Published</TableHead>
              <TableHead className="text-gray-400 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredResearch.length === 0 ? (
              <TableRow className="hover:bg-gray-900 border-gray-800">
                <TableCell colSpan={7} className="text-center py-10 text-gray-400">
                  {loading ? "Loading research..." : "No research articles found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredResearch.map((article) => (
                <TableRow key={article.id} className="hover:bg-gray-900 border-gray-800">
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="relative w-16 h-12 bg-gray-800 rounded overflow-hidden">
                        {article.coverImage ? (
                          <img
                            src={article.coverImage}
                            alt={article.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                            <Microscope className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Microscope className="h-4 w-4 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="font-medium line-clamp-2">{article.title}</div>
                        <div className="text-sm text-gray-400 line-clamp-1">{article.abstract}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getDepartmentBadgeColor(article.department)} text-white`}>
                      {article.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getStatusBadgeColor(article.status)} text-white`}>
                      {article.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {article.contributors?.length || 1} contributor{article.contributors?.length !== 1 ? 's' : ''}
                    </div>
                  </TableCell>
                  <TableCell>{article.authorName}</TableCell>
                  <TableCell>{formatDistanceToNow(article.publishedAt, { addSuffix: true })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/research/${article.id}/edit`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <RequirePermission permission="write">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => {
                            setResearchToDelete(article);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </RequirePermission>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Delete Research Article</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{researchToDelete?.title}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteResearch} disabled={loading}>
              {loading ? "Deleting..." : "Delete Research"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 