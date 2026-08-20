import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

console.log("================================================================================");
console.log("             BATERÍA DE PRUEBAS DEL ENTORNO AUTÓNOMO DYNATRACE                  ");
console.log("================================================================================\n");

let passed = 0;
let failed = 0;

function runTest(testName, fn) {
  process.stdout.write(`• [TEST] ${testName.padEnd(60)} ... `);
  try {
    const ok = fn();
    if (ok) {
      console.log("PASÓ (OK)");
      passed++;
    } else {
      console.log("FALLÓ");
      failed++;
    }
  } catch (err) {
    console.log(`ERROR (${err.message})`);
    failed++;
  }
}

// 1. Test: Reutilización de Skill Existente
runTest("1. Reutilización de Skill Existente (RUM & UX)", () => {
  const res = spawnSync("node", ["dist/index.js", "skill", "create", "analizar sesiones de usuarios y errores javascript de frontend"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("¡Skill existente encontrada para reutilizar!") && output.includes("dynatrace-rum");
});

// 2. Test: Reutilización de Skill Existente (DPS Consumo Indebido)
runTest("2. Reutilización de Skill Existente (DPS & Licencia)", () => {
  const res = spawnSync("node", ["dist/index.js", "skill", "create", "detectar consumo indebido de licencia dps y dashboards costosos"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("¡Skill existente encontrada para reutilizar!") && output.includes("dps-consumo-indebido");
});

// 3. Test: Búsqueda en Knowledge Base Local
runTest("3. Búsqueda en Knowledge Base Local (dtx docs search)", () => {
  const res = spawnSync("node", ["dist/index.js", "docs", "search", "Kubernetes"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("Encontrados") && output.includes("Score:");
});

// 4. Test: Creación de Nueva Skill respaldada por Documentación
runTest("4. Creación Autónoma de Nueva Skill (11 Pasos)", () => {
  const res = spawnSync("node", ["dist/index.js", "skill", "create", "Observabilidad de pipelines y eventos SDLC", "--domain", "openpipeline", "--name", "dynatrace-pipeline-observability", "--force"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  const skillFile = join(process.cwd(), "skills", "dynatrace-pipeline-observability", "SKILL.md");
  const evidenceFile = join(process.cwd(), "skills", "dynatrace-pipeline-observability", "references", "evidence.json");
  return output.includes("Skill APROBADA") && existsSync(skillFile) && existsSync(evidenceFile);
});

// 5. Test: Validación y Trazabilidad (dtx skill validate)
runTest("5. Validación de Trazabilidad Documental (dtx skill validate)", () => {
  const res = spawnSync("node", ["dist/index.js", "skill", "validate", "dynatrace-pipeline-observability"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("Estado de Verificación:   VERIFIED") && output.includes("Fuentes documentales:");
});

// 6. Test: Detección de Documentación Insuficiente (0 Alucinaciones)
runTest("6. Detección de Docs Insuficientes (Sin alucinaciones)", () => {
  const res = spawnSync("node", ["dist/index.js", "skill", "create", "ModuloFicticioInexistenteSuperRaroXYZ123", "--force"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("DOCUMENTACIÓN INSUFICIENTE") || output.includes("No hay documentación suficiente");
});

// 7. Test: Catálogo y Listado de Skills (dtx skill list)
runTest("7. Listado del Catálogo de Skills (dtx skill list)", () => {
  const res = spawnSync("node", ["dist/index.js", "skill", "list"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("SKILL") && output.includes("ESTADO") && output.includes("VERIFICADA");
});

// 8. Test: Diagnóstico General del Entorno (dtx test)
runTest("8. Diagnóstico de Conectividad (dtx test)", () => {
  const res = spawnSync("node", ["dist/index.js", "test"], {
    encoding: "utf8",
  });
  const output = res.stdout + res.stderr;
  return output.includes("TODO OK - MCP, CLI y API operativos");
});

console.log("\n================================================================================");
console.log(`RESULTADOS: ${passed} PASADOS, ${failed} FALLIDOS (Total: ${passed + failed})`);
console.log("================================================================================\n");

process.exitCode = failed > 0 ? 1 : 0;
