import { useState } from "react";

export default function AddMemberForm({ onAddMember, onDone }) {
  const [name, setName] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    if (await onAddMember(name)) {
      setName("");
      onDone?.();
    }
  }

  return (
    <form autoComplete="off" onSubmit={handleSubmit}>
      <div className="field">
        <label htmlFor="teamName">Name</label>
        <input id="teamName" placeholder="e.g. Aarav" autoFocus value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <button className="primary" type="submit">
        Add to team
      </button>
    </form>
  );
}
