import "jsr:@supabase/functions-js/edge-runtime.d.ts";

Deno.serve(() => Response.json({
  ok: true,
  app: "GardenGlitch",
  runtime: "Deno + TypeScript",
}));
