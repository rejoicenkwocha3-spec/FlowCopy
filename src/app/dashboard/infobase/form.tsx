"use client";

import { useActionState, useEffect, useRef } from "react";
import { addInfobaseAction, type ActionState } from "../actions";
import { StateAlert, Submit } from "../ui";

export function InfobaseForm() {
  const [state, action] = useActionState(addInfobaseAction, {} as ActionState);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="card space-y-4 p-5 sm:p-6">
      <input name="title" required className="input" placeholder="Title, e.g. Pricing or Our customers" aria-label="Title" />
      <textarea name="content" required rows={4} className="input h-auto py-2.5" placeholder="The facts the AI should know and use when relevant" aria-label="Details" />
      <Submit>Add to Infobase</Submit>
      <StateAlert state={state} />
    </form>
  );
}
