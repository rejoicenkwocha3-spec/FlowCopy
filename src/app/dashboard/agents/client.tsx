"use client";

import { useActionState, useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { createAgentAction, deleteAgentAction, runAgentAction, type ActionState } from "../actions";
import { Output, StateAlert, Submit } from "../ui";

export function AgentForm() {
  const [state, action] = useActionState(createAgentAction, {} as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-bold text-ink">Create an agent</h2>
      <input name="name" required className="input" placeholder="Name, e.g. LinkedIn Ghostwriter" aria-label="Name" />
      <input name="description" className="input" placeholder="What it does (optional)" aria-label="Description" />
      <textarea name="instructions" required rows={4} className="input h-auto py-2.5" placeholder="Instructions: role, rules, format of the output" aria-label="Instructions" />
      <Submit>Create agent</Submit>
      <StateAlert state={state} />
    </form>
  );
}

export function AgentCard({ id, name, description }: { id: string; name: string; description: string }) {
  const [state, action] = useActionState(runAgentAction, {} as ActionState);
  return (
    <div className="card space-y-3 p-5">
      <div className="flex items-start justify-between gap-3">
        <div><h3 className="font-extrabold text-ink">{name}</h3>{description && <p className="text-sm text-text-muted">{description}</p>}</div>
        <form action={deleteAgentAction}><input type="hidden" name="id" value={id} /><button className="btn-secondary h-9 px-3 text-danger" aria-label={`Delete ${name}`}><Trash2 className="h-4 w-4" /></button></form>
      </div>
      <form action={action} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <textarea name="task" required rows={2} className="input h-auto py-2.5" placeholder="Give the agent a task" aria-label={`Task for ${name}`} />
        <Submit>Run agent</Submit>
      </form>
      {state.error && <StateAlert state={state} />}
      {state.output && <Output text={state.output} />}
    </div>
  );
}
