"use client";

import { useActionState, useState } from "react";
import { CONTENT_TYPES } from "@/lib/content-types";
import { generateContentAction, saveContentAction, type ActionState } from "../actions";
import { Output, StateAlert, Submit } from "../ui";

const init: ActionState = {};

export function Generator() {
  const [gen, genAction] = useActionState(generateContentAction, init);
  const [saved, saveAction] = useActionState(saveContentAction, init);
  const [type, setType] = useState("blog_post");
  const [prompt, setPrompt] = useState("");
  return (
    <div className="card space-y-4 p-5 sm:p-6">
      <form action={genAction} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
          <div>
            <label htmlFor="type" className="mb-1.5 block text-sm font-medium">Type</label>
            <select id="type" name="type" className="input" value={type} onChange={(e) => setType(e.target.value)}>
              {CONTENT_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="prompt" className="mb-1.5 block text-sm font-medium">What should we write?</label>
            <textarea id="prompt" name="prompt" value={prompt} onChange={(e) => setPrompt(e.target.value)} required rows={3} maxLength={4000} className="input h-auto py-2.5" placeholder="e.g. A launch post for our new scheduling feature, aimed at busy agency owners" />
          </div>
        </div>
        <Submit>Generate</Submit>
      </form>
      {gen.error && <StateAlert state={gen} />}
      {gen.output && (
        <div className="space-y-3 border-t border-line pt-4">
          <Output text={gen.output} />
          <form action={saveAction} className="flex flex-wrap items-end gap-3">
            <input type="hidden" name="body" value={gen.output} />
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="prompt" value={prompt} />
            <input name="title" className="input w-full max-w-xs" placeholder="Title (optional)" aria-label="Title" />
            <Submit className="btn-secondary">Save to library</Submit>
          </form>
          <StateAlert state={saved} />
        </div>
      )}
    </div>
  );
}
