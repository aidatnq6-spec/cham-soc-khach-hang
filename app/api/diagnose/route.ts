import { getAdmin } from "@/lib/firebase/admin";
import { issueSchema } from "@/lib/domain/schema";
import { createDiagnoseHandler } from "@/lib/server/diagnose";
export const runtime = "nodejs";
export const POST = createDiagnoseHandler({
  verify: (token) => getAdmin().auth.verifyIdToken(token, true),
  catalogue: async (uid) => {
    const main = getAdmin().db.doc(`users/${uid}/app/main`);
    const meta = (await main.get()).data();
    if (
      meta?.schemaVersion !== 2 ||
      !/^[A-Za-z0-9_-]+$/.test(meta.activeGeneration)
    )
      throw new Error("Migration not complete");
    const snapshot = await main
      .collection("generations")
      .doc(meta.activeGeneration)
      .collection("issues")
      .limit(2001)
      .get();
    if (snapshot.size > 2000) throw new Error("Catalogue too large");
    return snapshot.docs.map((d) =>
      issueSchema.parse({ ...d.data(), id: d.id }),
    );
  },
  key: () => process.env.OPENROUTER_API_KEY,
  model: () => process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
  allowedEmail: () => process.env.ALLOWED_EMAIL ?? "phongdepdanang@gmail.com",
  fetch: (...args) => fetch(...args),
});
