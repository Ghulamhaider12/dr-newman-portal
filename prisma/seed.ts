import { PrismaClient, type FileType } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SETTING_DEFAULTS } from "../src/lib/settings";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Dr. Newman's Content Portal…");

  // ── Admin user ──────────────────────────────────────────
  const username = process.env.SEED_ADMIN_USERNAME || "anewman";
  const email = process.env.SEED_ADMIN_EMAIL || "admin@drnewman.example";
  const password = process.env.SEED_ADMIN_PASSWORD || "changeme123";
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { username },
    update: { email, passwordHash },
    create: { username, email, passwordHash },
  });
  console.log(`  ✓ admin user "${username}"`);

  // ── Categories ──────────────────────────────────────────
  const categoryNames = ["Medical", "Art & Literature", "Other"];
  const categories: Record<string, number> = {};
  for (let i = 0; i < categoryNames.length; i++) {
    const name = categoryNames[i];
    const cat = await prisma.category.upsert({
      where: { name },
      update: { position: i },
      create: { name, position: i },
    });
    categories[name] = cat.id;
  }
  console.log(`  ✓ ${categoryNames.length} categories`);

  // ── Site settings ───────────────────────────────────────
  for (const [key, value] of Object.entries(SETTING_DEFAULTS)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: {},
      create: { key, value },
    });
  }
  console.log("  ✓ site settings");

  // ── Sample files ────────────────────────────────────────
  const files: Array<{
    title: string;
    description: string;
    category: string;
    fileType: FileType;
    isYoutube?: boolean;
    url?: string;
    fileSize?: number;
    downloads?: number;
    daysAgo: number;
  }> = [
    {
      title: "Cardiac Imaging in Primary Care",
      description:
        "<p>A practical, plain-language guide to interpreting common echocardiogram findings in the primary-care setting. Written for non-specialists and trainees, it covers the most frequent artefacts, when to refer, and how to communicate uncertainty to patients.</p>",
      category: "Medical",
      fileType: "PDF",
      fileSize: 2_516_582,
      downloads: 1204,
      daysAgo: 103,
    },
    {
      title: "The History of Botanical Illustration",
      description:
        "<p>A recorded lecture tracing the craft of botanical illustration from early herbals to modern scientific drawing, and what it teaches us about looking closely.</p>",
      category: "Art & Literature",
      fileType: "MP4",
      isYoutube: true,
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      downloads: 318,
      daysAgo: 21,
    },
    {
      title: "Notes on Antibiotic Stewardship",
      description:
        "<p>Short clinical notes on prescribing responsibly: narrow-spectrum first, review at 48 hours, and stop when the evidence says so.</p>",
      category: "Medical",
      fileType: "DOC",
      fileSize: 184_320,
      downloads: 542,
      daysAgo: 47,
    },
    {
      title: "Field Recordings — Coastal Birdsong",
      description:
        "<p>An hour of unedited dawn-chorus field recordings made along the northern coast, shared for study and quiet listening.</p>",
      category: "Art & Literature",
      fileType: "MP3",
      fileSize: 58_720_256,
      downloads: 96,
      daysAgo: 9,
    },
    {
      title: "Lecture Slides — Renal Physiology",
      description:
        "<p>The full slide deck from this term's renal physiology lecture, including the diagrams students asked to keep.</p>",
      category: "Medical",
      fileType: "PPT",
      fileSize: 7_340_032,
      downloads: 730,
      daysAgo: 64,
    },
    {
      title: "Reading List — Medicine and the Humanities",
      description:
        "<p>An annotated reading list pairing clinical texts with essays and fiction, for anyone interested in the human side of practice.</p>",
      category: "Art & Literature",
      fileType: "PDF",
      fileSize: 312_000,
      downloads: 410,
      daysAgo: 33,
    },
    {
      title: "Spreadsheet — Trial Enrolment Tracker",
      description:
        "<p>A simple, anonymised template for tracking enrolment and follow-up across a small clinical study.</p>",
      category: "Other",
      fileType: "XLS",
      fileSize: 96_000,
      downloads: 158,
      daysAgo: 12,
    },
    {
      title: "Watercolour Study — Anatomy of the Hand",
      description:
        "<p>A high-resolution scan of a watercolour anatomy study, free to download for teaching and personal use.</p>",
      category: "Art & Literature",
      fileType: "JPG",
      fileSize: 4_194_304,
      downloads: 274,
      daysAgo: 5,
    },
  ];

  // Deterministic dates relative to a fixed reference (no Date.now in build path
  // is fine here — seed runs interactively, not inside the design compiler).
  const now = new Date();
  for (const f of files) {
    const date = new Date(now);
    date.setDate(date.getDate() - f.daysAgo);
    const storageKey = f.isYoutube
      ? ""
      : `uploads/sample-${f.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.${f.fileType.toLowerCase()}`;
    await prisma.file.create({
      data: {
        title: f.title,
        description: f.description,
        categoryId: categories[f.category],
        fileType: f.fileType,
        isYoutube: f.isYoutube ?? false,
        url: f.url ?? "",
        storageKey,
        fileSize: f.fileSize ?? 0,
        downloads: f.downloads ?? 0,
        dateUploaded: date,
        createdAt: date,
      },
    });
  }
  console.log(`  ✓ ${files.length} sample files`);

  // ── Sample comments (mix of approved / pending / private) ─
  const firstFile = await prisma.file.findFirst({
    where: { title: "Cardiac Imaging in Primary Care" },
  });
  if (firstFile) {
    const comments: Array<{
      content: string;
      email: string;
      isPublic: boolean;
      isApproved: boolean | null;
      daysAgo: number;
    }> = [
      {
        content:
          "Thank you for sharing this — a wonderfully clear explanation that I could follow without a medical background.",
        email: "margaret.h@example.com",
        isPublic: true,
        isApproved: true,
        daysAgo: 82,
      },
      {
        content:
          "Excellent overview. I have shared it with my registrars as preparatory reading.",
        email: "p.okafor@example.com",
        isPublic: true,
        isApproved: true,
        daysAgo: 85,
      },
      {
        content: "Could you say more about distinguishing artefact from true effusion?",
        email: "trainee@example.com",
        isPublic: true,
        isApproved: null,
        daysAgo: 2,
      },
      {
        content: "Please could you email me the references list directly?",
        email: "reader@example.com",
        isPublic: false,
        isApproved: null,
        daysAgo: 1,
      },
      {
        content: "A small typo on page 4 — otherwise superb.",
        email: "editor@example.com",
        isPublic: true,
        isApproved: null,
        daysAgo: 3,
      },
    ];
    for (const c of comments) {
      const date = new Date(now);
      date.setDate(date.getDate() - c.daysAgo);
      await prisma.comment.create({
        data: {
          fileId: firstFile.id,
          content: c.content,
          email: c.email,
          isPublic: c.isPublic,
          isApproved: c.isApproved,
          createdAt: date,
        },
      });
    }
    console.log(`  ✓ ${comments.length} sample comments`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
