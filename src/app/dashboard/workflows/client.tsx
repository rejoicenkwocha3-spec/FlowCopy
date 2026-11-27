"use client";

import { useActionState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { createWorkflowAction, deleteWorkflowAction, runWorkflowAction, type ActionState } from "../actions";
import { Output, StateAlert, Submit } from "../ui";

export function WorkflowForm() {
  const [state, action] = useActionState(createWorkflowAction, {} as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-bold text-ink">Create a workflow</h2>
      <input name="name" required className="input" placeholder="Name, e.g. Blog to social" aria-label="Name" />
      <input name="description" className="input" placeholder="Description (optional)" aria-label="Description" />
      <textarea name="steps" required rows={5} className="input h-auto py-2.5" placeholder={"One step per line. Each step receives the previous step's output.\nWrite a blog post from the input\nCondense it into 3 LinkedIn posts\nTranslate the posts into Spanish"} aria-label="Steps" />
      <Submit>Create workflow</Submit>
      <StateAlert state={state} />
    </form>
  );
}

export function WorkflowCard({ id, name, description, steps }: { id: string; name: string; description: string; steps: string[] }) {
  const [state, action] = useActionState(runWorkflowAction, {} as ActionState);
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-ink">{name}</h3>
          {description && <p className="text-sm text-text-muted">{description}</p>}
          <ol className="mt-2 list-decimal space-y-0.5 pl-5 text-sm text-text-muted">{steps.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
        <form action={deleteWorkflowAction}><input type="hidden" name="id" value={id} /><button className="btn-secondary h-9 px-3 text-danger" aria-label={`Delete ${name}`}><Trash2 className="h-4 w-4" /></button></form>
      </div>
      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <textarea name="input" required rows={3} className="input h-auto py-2.5" placeholder="Starting input, e.g. a topic or brief" aria-label={`Input for ${name}`} />
        <Submit>Run workflow</Submit>
      </form>
      {state.error && <StateAlert state={state} />}
      {state.output && <Output text={state.output} steps={state.steps} />}
    </div>
  );
}
