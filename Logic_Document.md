# 🧠 Logic Document

## ✅ Smart Assign

When the “Smart Assign” button is clicked on a task, the system automatically assigns the task to the user with the **fewest active tasks** (i.e., tasks not marked as "Done").

### Logic:
- The backend counts how many active tasks each user has using `countDocuments()`
- Active tasks = Tasks with status `Todo` or `In Progress`
- The user with the lowest count is selected and returned
- The frontend assigns the task to this user and updates it via API

### Why this works:
It balances the task load across users and prevents overloading anyone.

---

## ⚔️ Conflict Handling

If two users open the same task and make edits at the same time, we detect it using the `lastUpdated` timestamp stored on each task.

### Example:
- User A and User B both open Task #123 at 2:00 PM
- User A saves at 2:01 PM → backend updates `lastUpdated`
- User B tries to save at 2:02 PM → app compares timestamps
  - Conflict is detected: B’s copy is older than server’s

### Resolution:
- The user sees **both versions** (theirs and latest from DB)
- They can:
  - 🔁 Overwrite (force their version)
  - 🔄 Load the latest from DB and edit again
  - ⚖️ Manually merge fields (optional)

### Why this matters:
It avoids unintentional overwriting of another user’s work and improves team collaboration.
