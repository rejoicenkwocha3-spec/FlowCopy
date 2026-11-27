"use client";

import { useActionState } from "react";
import { saveBrandVoiceAction, type ActionState } from "../actions";
import { StateAlert, Submit } from "../ui";

type V = { name: string; tone: string; guidelines: string; avoid: string };

export function BrandVoiceForm({ v }: { v: V }) {
  const [state, action] = useActionState(saveBrandVoiceAction, {} as ActionState);
  const area = "input h-auto py-2.5";
  return (
    <form action={action} className="card space-y-4 p-5 sm:p-6">
      <div><label htmlFor="name" className="mb-1.5 block text-sm font-medium">Brand name</label><input id="name" name="name" defaultValue={v.name} className="input" /></div>
      <div><label htmlFor="tone" className="mb-1.5 block text-sm font-medium">Tone of voice</label><input id="tone" name="tone" defaultValue={v.tone} className="input" placeholder="Friendly, confident, plain-spoken" /></div>
      <div><label htmlFor="guidelines" className="mb-1.5 block text-sm font-medium">Writing guidelines</label><textarea id="guidelines" name="guidelines" defaultValue={v.guidelines} rows={4} className={area} placeholder="Short sentences. Speak to the reader as “you”. Lead with the benefit." /></div>
      <div><label htmlFor="avoid" className="mb-1.5 block text-sm font-medium">Words and styles to avoid</label><textarea id="avoid" name="avoid" defaultValue={v.avoid} rows={3} className={area} placeholder="Jargon, exclamation marks, “revolutionary”" /></div>
      <Submit>Save brand voice</Submit>
      <StateAlert state={state} />
    </form>
  );
}
