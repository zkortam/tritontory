"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { NewsTickerService } from "@/lib/firebase-service";
import type { NewsTicker } from "@/lib/models";
import { Plus, Edit, Trash2, Eye, EyeOff, AlertTriangle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NewsTickersPage() {
  const [tickers, setTickers] = useState<NewsTicker[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTicker, setEditingTicker] = useState<NewsTicker | null>(null);
  const [formData, setFormData] = useState({
    text: "",
    priority: "medium" as "low" | "medium" | "high" | "breaking",
    isActive: true,
    link: "",
    expiresAt: "",
  });

  useEffect(() => {
    fetchTickers();
  }, []);

  const fetchTickers = async () => {
    try {
      setLoading(true);
      const data = await NewsTickerService.getAllTickers();
      setTickers(data);
    } catch (error) {
      console.error("Error fetching tickers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.text.trim()) {
      alert("Please enter ticker text");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      console.log("Submitting ticker data:", formData);
      
      const tickerData: unknown = {
        text: formData.text.trim(),
        priority: formData.priority,
        isActive: formData.isActive,
      };

              // Only add link if it's not empty
        if (formData.link.trim()) {
          (tickerData as Record<string, unknown>).link = formData.link.trim();
        }
      
        // Only add expiresAt if it's provided
        if (formData.expiresAt) {
          (tickerData as Record<string, unknown>).expiresAt = new Date(formData.expiresAt);
        }

      console.log("Processed ticker data:", tickerData);

      if (editingTicker) {
        console.log("Updating existing ticker:", editingTicker.id);
        await NewsTickerService.updateTicker(editingTicker.id, tickerData as NewsTicker);
      } else {
        console.log("Creating new ticker");
        const newId = await NewsTickerService.createTicker(tickerData as NewsTicker);
        console.log("Created ticker with ID:", newId);
      }

      console.log("Ticker saved successfully");
      setIsCreateDialogOpen(false);
      setEditingTicker(null);
      resetForm();
      await fetchTickers();
    } catch (error) {
      console.error("Error saving ticker:", error);
      alert(`Error saving ticker: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (ticker: NewsTicker) => {
    setEditingTicker(ticker);
    setFormData({
      text: ticker.text,
      priority: ticker.priority,
      isActive: ticker.isActive,
      link: ticker.link || "",
      expiresAt: ticker.expiresAt ? ticker.expiresAt.toISOString().slice(0, 16) : "",
    });
    setIsCreateDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this ticker?")) {
      try {
        await NewsTickerService.deleteTicker(id);
        fetchTickers();
      } catch (error) {
        console.error("Error deleting ticker:", error);
      }
    }
  };

  const handleToggleStatus = async (id: string, isActive: boolean) => {
    try {
      await NewsTickerService.toggleTickerStatus(id, isActive);
      fetchTickers();
    } catch (error) {
      console.error("Error toggling ticker status:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      text: "",
      priority: "medium" as "low" | "medium" | "high" | "breaking",
      isActive: true,
      link: "",
      expiresAt: "",
    });
  };

  const priorityColors = {
    low: "bg-blue-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    breaking: "bg-red-500",
  };

  const priorityIcons = {
    low: null,
    medium: null,
    high: null,
    breaking: <AlertTriangle className="h-4 w-4" />,
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading tickers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">News Tickers</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingTicker(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Ticker
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>
                {editingTicker ? "Edit News Ticker" : "Create News Ticker"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="text">Ticker Text</Label>
                <Textarea
                  id="text"
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Enter ticker text..."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: unknown) => setFormData({ ...formData, priority: value as "low" | "medium" | "high" | "breaking" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="breaking">Breaking</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="link">Link (Optional)</Label>
                <Input
                  id="link"
                  type="url"
                  value={formData.link}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div>
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
                <Label htmlFor="isActive">Active</Label>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateDialogOpen(false);
                    setEditingTicker(null);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Saving..." : (editingTicker ? "Update" : "Create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {tickers.map((ticker) => (
          <Card key={ticker.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Badge className={priorityColors[ticker.priority]}>
                    {priorityIcons[ticker.priority]}
                    <span className="ml-1 capitalize">{ticker.priority}</span>
                  </Badge>
                  <Badge variant={ticker.isActive ? "default" : "secondary"}>
                    {ticker.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(ticker.id, !ticker.isActive)}
                  >
                    {ticker.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(ticker)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(ticker.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-2">{ticker.text}</p>
              {ticker.link && (
                <p className="text-sm text-gray-500 mb-2">
                  Link: <a href={ticker.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{ticker.link}</a>
                </p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>Created {formatDistanceToNow(ticker.createdAt, { addSuffix: true })}</span>
                {ticker.expiresAt && (
                  <span>Expires {formatDistanceToNow(ticker.expiresAt, { addSuffix: true })}</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tickers.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No news tickers found. Create your first one!</p>
        </div>
      )}
    </div>
  );
} 