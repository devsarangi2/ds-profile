import { useState } from 'react'
import { InlineEdit } from '@/components/ui/InlineEdit'

export function InlineEditDemo() {
  const [text, setText] = useState('Click to edit this description')

  return (
    <div className="max-w-lg mx-auto mt-8 p-4">
      <h1 className="text-xl font-bold mb-4">InlineEdit Demo</h1>
      <InlineEdit
        value={text}
        onSave={async (v) => {
          await new Promise((r) => setTimeout(r, 300))
          setText(v)
        }}
        testId="inline-edit-description"
        placeholder="Add a description..."
      />
      <p className="mt-4 text-sm text-slate-500">Current value: {text}</p>
    </div>
  )
}
