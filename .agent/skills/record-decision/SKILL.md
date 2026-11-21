---
name: record-decision
description: Use when work reaches an open item that needs the person's answer. Open items are an "Ask first" bullet in a rules file, an undecided stack choice, an [ASSUMPTION] the change depends on, or a PRD open question. Looks up a stored answer first, asks once if none exists, records the answer, and lists the marker edits that follow.
---

# Record a decision

This skill settles one open item and makes the answer stick. It does not decide anything. The person decides.

Rules that own the underlying behavior:
- `rules/stack-and-dependencies.md`, rules 4 and 5: ask once per undecided choice, and treat a suggestion as no decision.
- The rules file that holds the open item. It owns the question and the options.

## Inputs

- The open item, named by its source. Use one of these forms:
  - a rules file and its "Ask first" bullet
  - a stack choice named in AGENTS.md or PRD 8.1
  - an [ASSUMPTION] item, by PRD ID (FR number or A number)
  - a PRD open question, by O number
- The change that is blocked by the item.

## Procedure

1. **Name the item.** Write one line: the item, its source, and the change it blocks. Stop the blocked change. Do not guess in the meantime.

2. **Find the record.** Read AGENTS.md for a line that names the decision record path.
   - If the line exists, go to step 3.
   - If it does not exist, ask the person where the record file lives. Do not choose a path. After the person answers, propose a one-line addition to AGENTS.md that names the path. Edit AGENTS.md only after the person approves the exact line. Then go to step 3.

3. **Search the record for the item.** Search by the item's ID and by key words from its source.
   - If a confirmed answer exists, apply it, tell the person which entry you applied, and end the procedure. Do not ask again.
   - If an entry exists with status "open", go to step 4.
   - If the record has no entry, go to step 4.

4. **Gather the options.** Copy the options from the owning rules file or the PRD. Do not add your own options. If the source lists none, plan an open question. If you have a recommendation, label it "Suggestion". A suggestion is not an answer.

5. **Ask one question.** Ask only this item. Do not bundle other items. State:
   - the item and where it comes from
   - what the answer unblocks
   - the options, or an open question

   Then stop and wait for the reply.

6. **Read the reply.**
   - If the person picks an option or gives an answer, go to step 7.
   - If the person defers or the reply is unclear, write an entry with status "open" and the reason. Do not resume the blocked change. Tell the person what remains blocked.
   - If the reply conflicts with an existing confirmed entry, show both. Ask which one stands. Do not overwrite.

7. **Write the entry.** Add one entry to the record with these fields:
   - Item ID
   - Source file and bullet
   - Question, in one line
   - Answer, in the person's own words
   - Date the person answered
   - Status: confirmed

   Do not edit or delete any older entry.

8. **Check the write.** Search the record again for the item ID. Confirm that exactly one confirmed entry exists and that the answer matches what the person said. If the check fails, fix the entry before moving on.

9. **Handle an [ASSUMPTION], if the item is one.** Build a list of every place that carries the marker for this item:
   - the PRD row (FR line and Assumptions table row)
   - each rules file line that carries [ASSUMPTION] for this item

   Search the files to build the list. Do not rely on memory. Show the list. For each place, propose the edit: remove the marker if the person confirmed the value, or replace the text if the person changed it. Wait for approval. Edit only the places the person approves.

10. **Resume the change.** Continue the blocked change using the recorded answer. In the end-of-change report, list the entry ID under assumptions or write "None" if the answer was fully confirmed.

## Outputs

- One new entry in the decision record, or a confirmation that an existing entry was applied.
- For an [ASSUMPTION], a list of marker edits, applied only where approved.
- A resumed change, or a clear statement of what stays blocked.

## Completion checks

- The record contains one confirmed entry for the item, or the item is marked "open" with a reason.
- The question asked covered one item only.
- Every option offered came from the owning file or the PRD, and any suggestion carried the label "Suggestion".
- No PRD line, rules file line, or AGENTS.md line changed without the person's approval of that exact edit.
- The blocked change either resumed with the recorded answer or stayed stopped.
