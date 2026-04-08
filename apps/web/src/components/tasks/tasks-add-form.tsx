import { zodResolver } from "@hookform/resolvers/zod";
import { taskInsertSchema, type TaskInsert } from "@template/api/schemas/tasks";
import { Button } from "@template/ui/components/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@template/ui/components/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@template/ui/components/field";
import { Input } from "@template/ui/components/input";
import { PlusIcon } from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { useCreateTask } from "@/hooks/use-task";

export function TasksAddForm() {
  const form = useForm<TaskInsert>({
    resolver: zodResolver(taskInsertSchema),
    defaultValues: {
      title: "",
      document: "",
    },
  });
  const { mutate, isPending } = useCreateTask();
  const [open, setOpen] = useState(false);

  function onSubmit(data: TaskInsert) {
    mutate(data, {
      onSuccess: () => {
        toast.success(`Task "${data.title}" has been created`);
        form.reset();
        setOpen(false);
      },
      onError: (error) => {
        toast.error(error.message || "Failed to create task");
      },
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <form id="tasks-add-form" onSubmit={form.handleSubmit(onSubmit)}>
        <DialogTrigger
          render={
            <Button>
              <PlusIcon />
              Add
            </Button>
          }
        />
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription>
              Make changes to your task here. Click save when you&apos;re done.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup>
            <Controller
              name="title"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tasks-add-form-title">Title</FieldLabel>
                  <Input
                    {...field}
                    id="tasks-add-form-title"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="document"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="tasks-add-form-document">Document</FieldLabel>
                  <Input
                    {...field}
                    id="tasks-add-form-document"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
          <DialogFooter>
            <DialogClose
              render={
                <Button
                  variant="outline"
                  onClick={() => {
                    form.reset();
                    setOpen(false);
                  }}
                  disabled={isPending}
                >
                  Cancel
                </Button>
              }
            />
            <Button type="submit" form="tasks-add-form" disabled={isPending}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
