import type { ColumnDef } from "@tanstack/react-table";
import type { Task } from "@template/api/schemas/tasks";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTrigger,
  AlertDialogTitle,
} from "@template/ui/components/alert-dialog";
import { Button } from "@template/ui/components/button";
import { format } from "date-fns";
import { Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useDeleteTask } from "@/hooks/use-task";

function ActionsCell({ task }: { task: Task }) {
  const [open, setOpen] = useState(false);

  const { mutate: deleteTask, isPending } = useDeleteTask();

  const handleDelete = () => {
    deleteTask(task.id, {
      onSuccess: () => {
        toast.success(`Task "${task.title}" has been deleted`);
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to delete task");
      },
    });
  };

  return (
    <div className="flex justify-end">
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger
          render={
            <Button size="icon-sm" variant="destructive">
              <Trash />
            </Button>
          }
        ></AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the task
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export const tasksColumns: ColumnDef<Task>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "document",
    header: "Document",
  },
  {
    accessorKey: "createdAt",
    header: () => <div className="text-right">CreatedAt</div>,
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt") as number;
      const formattedDate = format(createdAt, "yyyy-MM-dd HH:mm:ss");
      return <div className="text-right">{formattedDate}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: () => <div className="text-right">updatedAt</div>,
    cell: ({ row }) => {
      const updatedAt = row.getValue("updatedAt") as number;
      const formattedDate = format(updatedAt, "yyyy-MM-dd HH:mm:ss");
      return <div className="text-right">{formattedDate}</div>;
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <ActionsCell task={row.original} />,
  },
];
