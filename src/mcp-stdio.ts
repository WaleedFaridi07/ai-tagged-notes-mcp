// True MCP server over stdio using the official SDK.
import 'dotenv/config';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { createNote, getNote, updateNote, searchNotes, deleteNote } from "./db-factory.js";
import { enrichWithAI } from "./ai.js";

async function main() {

  const server = new McpServer({
    name: "ai-tagged-notes",
    version: "0.1.0",
  });

  // create_note
  server.registerTool(
    "create_note",
    {
      description: "Create a note with raw text",
      inputSchema: {
        text: z.string().min(1),
      },
    },
    async ({ text }) => {
      const note = await createNote(text);
      return {
        content: [{ type: "text", text: JSON.stringify(note) }],
      };
    }
  );

  // enrich_note
  server.registerTool(
    "enrich_note",
    {
      description: "AI-enrich a note by id (summary + tags)",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const n = await getNote(id);
      if (!n) {
        return {
          isError: true,
          content: [{ type: "text", text: "not_found" }],
        };
      }
      const enrich = await enrichWithAI(n.text);
      const updated = await updateNote(id, enrich);
      return {
        content: [{ type: "text", text: JSON.stringify(updated) }],
      };
    }
  );

  // get_note
  server.registerTool(
    "get_note",
    {
      description: "Get a single note by id",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const n = await getNote(id);
      if (!n) {
        return {
          isError: true,
          content: [{ type: "text", text: "not_found" }],
        };
      }
      return { content: [{ type: "text", text: JSON.stringify(n) }] };
    }
  );

  // search_notes
  server.registerTool(
    "search_notes",
    {
      description: "Search notes by free-text and/or tag",
      inputSchema: {
        q: z.string().optional(),
        tag: z.string().optional(),
      },
    },
    async ({ q, tag }) => {
      const res = await searchNotes(q);
      return { content: [{ type: "text", text: JSON.stringify(res) }] };
    }
  );

  // delete_note
  server.registerTool(
    "delete_note",
    {
      description: "Delete a note by id",
      inputSchema: {
        id: z.string().min(1),
      },
    },
    async ({ id }) => {
      const deleted = await deleteNote(id);
      if (!deleted) {
        return {
          isError: true,
          content: [{ type: "text", text: "not_found" }],
        };
      }
      return { content: [{ type: "text", text: JSON.stringify({ success: true }) }] };
    }
  );

  // Connect over stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error("MCP server failed:", err);
  process.exit(1);
});
