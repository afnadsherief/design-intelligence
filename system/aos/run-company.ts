/* ==========================================
   A-OS — RUN COMPANY TASK (S4 entrypoint)
   Primary entrypoint for company-scoped execution.
   Loads company → invokes orchestrator with company context.
   ========================================== */

export async function runCompanyTask({
  companyId,
  input,
}: {
  companyId: string;
  input?: string;
}) {
  const { loadCompany } = await import("../company/loader");
  const { runPipeline } = await import("./orchestrator");

  const company = loadCompany(companyId);

  return runPipeline({
    input,
    company,
  });
}
