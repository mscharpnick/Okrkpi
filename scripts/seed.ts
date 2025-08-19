import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function computeFYStartYear(): number {
  const envVal = process.env.FY_START_YEAR;
  if (envVal && !Number.isNaN(Number(envVal))) return Number(envVal);
  const now = new Date();
  // FY = July–June; if before July, use previous calendar year
  return now.getMonth() < 6 ? now.getFullYear() - 1 : now.getFullYear();
}

async function main() {
  const startYear = computeFYStartYear();

  // No @unique on startYear → do findFirst + create (not upsert)
  let fy = await prisma.fiscalYear.findFirst({ where: { startYear } });
  if (!fy) fy = await prisma.fiscalYear.create({ data: { startYear } });

  // Sample workstreams
  const wsProduct = await prisma.workstream.create({
    data: { name: "Product", fiscalYearId: fy.id }
  });
  const wsOps = await prisma.workstream.create({
    data: { name: "Operations", fiscalYearId: fy.id }
  });

  // Stages (overlap allowed)
  const s1 = await prisma.stage.create({
    data: {
      name: "Discovery",
      workstreamId: wsProduct.id,
      startDate: new Date(startYear, 6, 1),   // July 1
      endDate:   new Date(startYear, 8, 30),  // Sep 30
    }
  });
  const s2 = await prisma.stage.create({
    data: {
      name: "Build",
      workstreamId: wsProduct.id,
      startDate: new Date(startYear, 8, 1),   // Sep 1
      endDate:   new Date(startYear, 11, 31), // Dec 31
    }
  });
  const s3 = await prisma.stage.create({
    data: {
      name: "Pilot & Rollout",
      workstreamId: wsOps.id,
      startDate: new Date(startYear, 10, 1),      // Nov 1
      endDate:   new Date(startYear + 1, 2, 31),  // Mar 31 (next calendar year)
    }
  });

  // Objectives + KRs
  const obj1 = await prisma.objective.create({
    data: {
      title: "Spec v1 approved",
      stageId: s1.id,
      owner: "Matthew",
      dueDate: new Date(startYear, 7, 15), // Aug 15
    }
  });
  await prisma.keyResult.createMany({
    data: [
      { objectiveId: obj1.id, title: "Stakeholder signoffs", type: "PERCENT", percent: 100 },
      { objectiveId: obj1.id, title: "PRD completeness score", type: "NUMERIC", target: 100, current: 90, unit: "%" },
    ]
  });

  const obj2 = await prisma.objective.create({
    data: {
      title: "MVP shipped",
      stageId: s2.id,
      owner: "Team",
      dueDate: new Date(startYear, 11, 20), // Dec 20
    }
  });
  await prisma.keyResult.createMany({
    data: [
      { objectiveId: obj2.id, title: "Core screens implemented", type: "PERCENT", percent: 70 },
      { objectiveId: obj2.id, title: "Internal testers", type: "NUMERIC", target: 25, current: 12, unit: "#" },
      { objectiveId: obj2.id, title: "Quality risk", type: "HML", hml: "MEDIUM" },
    ]
  });

  console.log("Seeded FY", startYear);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
