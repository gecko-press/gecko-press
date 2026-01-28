"use client";

import { useEffect, useState } from "react";
import { Plus, GripVertical, ChevronDown, ChevronRight, Pencil, Trash2, ExternalLink, Save, X, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/lib/supabase/client";
import { useDialogs } from "@/lib/dialogs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

type Page = {
  id: string;
  title: string;
  slug: string;
  is_published: boolean;
};

type MenuItem = {
  id: string;
  label: string;
  url: string;
  page_id: string | null;
  parent_id: string | null;
  location: "header" | "footer" | "both";
  position: number;
  open_in_new_tab: boolean;
  children?: MenuItem[];
};

type MenuManagerProps = {
  pages: Page[];
};

type EditingItem = {
  id?: string;
  label: string;
  linkType: "page" | "external" | "dropdown";
  pageId: string;
  url: string;
  location: "header" | "footer" | "both";
  openInNewTab: boolean;
  parentId: string | null;
};

const defaultEditingItem: EditingItem = {
  label: "",
  linkType: "page",
  pageId: "",
  url: "",
  location: "header",
  openInNewTab: false,
  parentId: null,
};

export function MenuManager({ pages }: MenuManagerProps) {
  const { confirm, showError, showSuccess } = useDialogs();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<EditingItem>(defaultEditingItem);
  const [saving, setSaving] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMenuItems();
  }, []);

  async function fetchMenuItems() {
    try {
      const { data, error } = await supabase
        .from("menu_items")
        .select("*")
        .order("position", { ascending: true });

      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error("Failed to fetch menu items:", error);
    } finally {
      setLoading(false);
    }
  }

  function buildMenuTree(items: MenuItem[], parentId: string | null = null): MenuItem[] {
    return items
      .filter(item => item.parent_id === parentId)
      .map(item => ({
        ...item,
        children: buildMenuTree(items, item.id),
      }))
      .sort((a, b) => a.position - b.position);
  }

  function getHeaderItems(): MenuItem[] {
    const filtered = menuItems.filter(item => item.location === "header" || item.location === "both");
    return buildMenuTree(filtered);
  }

  function getFooterItems(): MenuItem[] {
    const filtered = menuItems.filter(item => item.location === "footer" || item.location === "both");
    return buildMenuTree(filtered);
  }

  function getDropdownParents(): MenuItem[] {
    return menuItems.filter(item => !item.page_id && !item.url && !item.parent_id);
  }

  function openAddDialog(location: "header" | "footer" | "both", parentId: string | null = null) {
    setEditingItem({
      ...defaultEditingItem,
      location,
      parentId,
    });
    setShowDialog(true);
  }

  function openEditDialog(item: MenuItem) {
    const isDropdown = !item.page_id && !item.url;
    setEditingItem({
      id: item.id,
      label: item.label,
      linkType: isDropdown ? "dropdown" : item.page_id ? "page" : "external",
      pageId: item.page_id || "",
      url: item.url || "",
      location: item.location,
      openInNewTab: item.open_in_new_tab,
      parentId: item.parent_id,
    });
    setShowDialog(true);
  }

  async function handleSave() {
    if (!editingItem.label.trim()) {
      showError("Label is required");
      return;
    }

    if (editingItem.linkType === "page" && !editingItem.pageId) {
      showError("Please select a page");
      return;
    }

    if (editingItem.linkType === "external" && !editingItem.url.trim()) {
      showError("URL is required");
      return;
    }

    setSaving(true);

    try {
      const pageId = editingItem.linkType === "page" ? editingItem.pageId : null;
      const url = editingItem.linkType === "external" ? editingItem.url : "";
      const selectedPage = pages.find(p => p.id === pageId);
      const finalUrl = pageId && selectedPage ? `/page/${selectedPage.slug}` : url;

      const payload = {
        label: editingItem.label.trim(),
        url: editingItem.linkType === "dropdown" ? "" : finalUrl,
        page_id: pageId,
        parent_id: editingItem.parentId,
        location: editingItem.location,
        open_in_new_tab: editingItem.openInNewTab,
        position: editingItem.id ? undefined : menuItems.length,
      };

      if (editingItem.id) {
        const { error } = await supabase
          .from("menu_items")
          .update(payload)
          .eq("id", editingItem.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("menu_items")
          .insert(payload);

        if (error) throw error;
      }

      await fetchMenuItems();
      setShowDialog(false);
      setEditingItem(defaultEditingItem);
      showSuccess("Menu item saved successfully");
    } catch (error) {
      console.error("Failed to save menu item:", error);
      showError("Failed to save menu item. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(itemId: string) {
    const confirmed = await confirm({
      title: "Delete Menu Item",
      description: "Are you sure you want to delete this menu item? This action cannot be undone.",
      confirmText: "Delete",
      cancelText: "Cancel",
      variant: "destructive",
    });

    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from("menu_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;
      await fetchMenuItems();
      showSuccess("Menu item deleted successfully");
    } catch (error) {
      console.error("Failed to delete menu item:", error);
      showError("Failed to delete menu item. Please try again.");
    }
  }

  async function moveItem(itemId: string, direction: "up" | "down") {
    const item = menuItems.find(i => i.id === itemId);
    if (!item) return;

    const siblings = menuItems
      .filter(i => i.parent_id === item.parent_id && i.location === item.location)
      .sort((a, b) => a.position - b.position);

    const currentIndex = siblings.findIndex(i => i.id === itemId);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= siblings.length) return;

    const targetItem = siblings[targetIndex];

    try {
      await Promise.all([
        supabase.from("menu_items").update({ position: targetItem.position }).eq("id", itemId),
        supabase.from("menu_items").update({ position: item.position }).eq("id", targetItem.id),
      ]);
      await fetchMenuItems();
    } catch (error) {
      console.error("Failed to reorder items:", error);
    }
  }

  function toggleExpand(itemId: string) {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <p className="text-sm text-zinc-500">Loading menu...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <MenuSection
          title="Header Menu"
          location="header"
          items={getHeaderItems()}
          expandedItems={expandedItems}
          onToggleExpand={toggleExpand}
          onAdd={() => openAddDialog("header")}
          onAddChild={(parentId) => openAddDialog("header", parentId)}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onMove={moveItem}
        />

        <MenuSection
          title="Footer Menu"
          location="footer"
          items={getFooterItems()}
          expandedItems={expandedItems}
          onToggleExpand={toggleExpand}
          onAdd={() => openAddDialog("footer")}
          onAddChild={(parentId) => openAddDialog("footer", parentId)}
          onEdit={openEditDialog}
          onDelete={handleDelete}
          onMove={moveItem}
        />
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem.id ? "Edit Menu Item" : "Add Menu Item"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="label">Label</Label>
              <Input
                id="label"
                value={editingItem.label}
                onChange={(e) => setEditingItem({ ...editingItem, label: e.target.value })}
                placeholder="Menu item label"
              />
            </div>

            <div className="space-y-2">
              <Label>Link Type</Label>
              <Select
                value={editingItem.linkType}
                onValueChange={(value: "page" | "external" | "dropdown") =>
                  setEditingItem({ ...editingItem, linkType: value, pageId: "", url: "" })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="page">Link to Page</SelectItem>
                  <SelectItem value="external">External URL</SelectItem>
                  {!editingItem.parentId && <SelectItem value="dropdown">Dropdown Menu</SelectItem>}
                </SelectContent>
              </Select>
            </div>

            {editingItem.linkType === "page" && (
              <div className="space-y-2">
                <Label>Select Page</Label>
                <Select
                  value={editingItem.pageId}
                  onValueChange={(value) => setEditingItem({ ...editingItem, pageId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        {page.title} {!page.is_published && "(Draft)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editingItem.linkType === "external" && (
              <div className="space-y-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  value={editingItem.url}
                  onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
            )}

            {editingItem.linkType === "dropdown" && (
              <div className="bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-800 rounded-lg p-3">
                <p className="text-xs text-sky-800 dark:text-sky-200">
                  This will create a dropdown menu. Add child items after saving.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label>Display Location</Label>
              <Select
                value={editingItem.location}
                onValueChange={(value: "header" | "footer" | "both") =>
                  setEditingItem({ ...editingItem, location: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header">Header Only</SelectItem>
                  <SelectItem value="footer">Footer Only</SelectItem>
                  <SelectItem value="both">Both Header & Footer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editingItem.linkType !== "dropdown" && (
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-700 dark:text-zinc-300">Open in New Tab</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">Link opens in a new browser tab</p>
                </div>
                <Switch
                  checked={editingItem.openInNewTab}
                  onCheckedChange={(checked) => setEditingItem({ ...editingItem, openInNewTab: checked })}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function MenuSection({
  title,
  location,
  items,
  expandedItems,
  onToggleExpand,
  onAdd,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
}: {
  title: string;
  location: "header" | "footer";
  items: MenuItem[];
  expandedItems: Set<string>;
  onToggleExpand: (id: string) => void;
  onAdd: () => void;
  onAddChild: (parentId: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{title}</h3>
        <Button size="sm" variant="outline" className="h-8" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-1" />
          Add Item
        </Button>
      </div>

      <div className="p-2">
        {items.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-500 dark:text-zinc-400">
            No menu items yet. Click &quot;Add Item&quot; to get started.
          </div>
        ) : (
          <div className="space-y-1">
            {items.map((item, index) => (
              <MenuItemRow
                key={item.id}
                item={item}
                depth={0}
                isFirst={index === 0}
                isLast={index === items.length - 1}
                isExpanded={expandedItems.has(item.id)}
                onToggleExpand={onToggleExpand}
                onAddChild={onAddChild}
                onEdit={onEdit}
                onDelete={onDelete}
                onMove={onMove}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function MenuItemRow({
  item,
  depth,
  isFirst,
  isLast,
  isExpanded,
  onToggleExpand,
  onAddChild,
  onEdit,
  onDelete,
  onMove,
}: {
  item: MenuItem;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
}) {
  const isDropdown = !item.page_id && !item.url;
  const hasChildren = item.children && item.children.length > 0;

  return (
    <div style={{ marginLeft: depth * 20 }}>
      <div className="flex items-center gap-2 p-2 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/50 group">
        <div className="flex items-center gap-1 text-zinc-400">
          <button
            onClick={() => !isFirst && onMove(item.id, "up")}
            disabled={isFirst}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3 rotate-180" />
          </button>
          <button
            onClick={() => !isLast && onMove(item.id, "down")}
            disabled={isLast}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded disabled:opacity-30"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>

        {isDropdown && (
          <button
            onClick={() => onToggleExpand(item.id)}
            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            )}
          </button>
        )}

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {item.label}
          </p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {isDropdown ? "Dropdown" : item.url || "No link"}
            {item.open_in_new_tab && " (new tab)"}
          </p>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {isDropdown && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => onAddChild(item.id)}
              title="Add child item"
            >
              <FolderPlus className="w-4 h-4 text-zinc-500" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onEdit(item)}
          >
            <Pencil className="w-4 h-4 text-zinc-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      </div>

      {isDropdown && isExpanded && hasChildren && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child, index) => (
            <MenuItemRow
              key={child.id}
              item={child}
              depth={depth + 1}
              isFirst={index === 0}
              isLast={index === item.children!.length - 1}
              isExpanded={false}
              onToggleExpand={onToggleExpand}
              onAddChild={onAddChild}
              onEdit={onEdit}
              onDelete={onDelete}
              onMove={onMove}
            />
          ))}
        </div>
      )}
    </div>
  );
}
