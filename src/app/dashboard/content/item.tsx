"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteContentAction, updateContentAction, type ActionState } from "../actions";
import { CopyButton, StateAlert, Submit } from "../ui";

export function ContentItem({ id, title, body, label, date }: { id: string; title: string; body: string; label: string; date: string }) {
  const [state, action] = useActionState(updateContentAction, {} as ActionState);
  return (
    <details className="card p-4">
      <summary className="flex cursor-pointer items-center justify-between gap-3">
        <span className="truncate font-bold text-ink">{title}</span>
        <span className="shrink-0 text-xs text-text-muted">{label} · {date}</span>
      </summary>
      <form action={action} className="mt-4 space-y-3">
        <input type="hidden" name="id" value={id} />
        <input name="title" defaultValue={title} className="input" aria-label="Title" />
        <textarea name="body" defaultValue={body} rows={10} className="input h-auto py-2.5" aria-label="Content" />
        <div className="flex flex-wrap gap-2">
          <Submit>Save changes</Submit>
          <CopyButton text={body} />
          <button type="submit" formAction={deleteContentAction} formNoValidate className="btn-secondary text-danger"><Trash2 className="h-4 w-4" />Delete</button>
        </div>
        <StateAlert state={state} />
      </form>
    </details>
  );
}
