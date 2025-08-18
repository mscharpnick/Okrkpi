import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const startYear = Number(process.env.FY_START_YEAR ?? new Date().getMonth() < 6 ? new Date().getFullYear()-1 : new Date().getFullYear());
  const fy = await prisma.fiscalYear.upsert({
    where: { startYear },
    update: {},
    create: { startYear },
  });

  // Create sample workstreams
  const ws1 = await prisma.workstream.create({ data: { name: "Product", fiscalYearId: fy.id } });
  const ws2 = await prisma.workstream.create({ data: { name: "Operations", fiscalYearId: fy.id } });

  // Stages (overlap allowed)
  const s1 = await prisma.stage.create({ data: {
    name: "Discovery",
    workstreamId: ws1.id,
    startDate: new Date(startYear, 6, 1),
    endDate: new Date(startYear, 8, 30),
  }});
  const s2 = await prisma.stage.create({ data: {
    name: "Build",
    workstreamId: ws1.id,
    startDate: new Date(startYear, 8, 1),
    endDate: new Date(startYear, 11, 31),
  }});
  const s3 = await prisma.stage.create({ data: {
    name: "Pilot & Rollout",
    workstreamId: ws2.id,
    startDate: new Date(startYear, 10, 1),
    endDate: new Date(startYear+1, 2, 31),
  }});

  const obj1 = await prisma.objective.create({ data: {
    title: "Spec v1 approved",
    stageId: s1.id,
    owner: "Matthew",
    dueDate: new Date(startYear, 7, 15),
  }});
  await prisma.keyResult.createMany({ data: [
    { objectiveId: obj1.id, title: "Stakeholder signoffs", type: "PERCENT", percent: 100 },
    { objectiveId: obj1.id, title: "PRD completeness score", type: "NUMERIC", target: 100, current: 90, unit: "%" },
  ]});

  const obj2 = await prisma.objective.create({ data: {
    title: "MVP shipped",
    stageId: s2.id,
    owner: "Team",
    dueDate: new Date(startYear, 11, 20),
  }});
  await prisma.keyResult.createMany({ data: [
    { objectiveId: obj2.id, title: "Core screens implemented", type: "PERCENT", percent: 70 },
    { objectiveId: obj2.id, title: "Internal testers", type: "NUMERIC", target: 25, current: 12, unit: "#" },
    { objectiveId: obj2.id, title: "Quality risk", type: "HML", hml: "MEDIUM" },
  ]});

  await prisma.kPI.createMany({ data: [
    { fiscalYearId: fy.id, title: "NPS", type: "NUMERIC", target: 60, current: 45, unit: "score" },
    { fiscalYearId: fy.id, workstreamId: ws1.id, title: "Weekly Active Users", type: "NUMERIC", target: 200, current: 80, unit: "#" },
    { fiscalYearId: fy.id, workstreamId: ws2.id, title: "On-time delivery", type: "PERCENT", percent: 75, unit: "%" },
  ]});

  console.log("Seeded FY", startYear);
}

main().then(() => prisma.$disconnect()).catch(e => {
  console.error(e);
  return prisma.$disconnect().finally(() => process.exit(1));
});
