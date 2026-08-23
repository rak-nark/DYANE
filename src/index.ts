#!/usr/bin/env node
import {
  cmdHelp,
  cmdConfig,
  cmdDoctor,
  cmdMcp,
  cmdDql,
  cmdEntities,
  cmdProblems,
  cmdMetrics,
  cmdApi,
  cmdDtctl,
  cmdTest,
  cmdToken,
  cmdDocsScrape,
  cmdDocsUpdate,
  cmdDocsSearch,
  cmdDocsStats,
  cmdDocsList,
  cmdSkillCreate,
  cmdSkillValidate,
  cmdSkillList,
  type CliOptions,
} from "./commands.js";

function parseOptions(args: string[]): { options: CliOptions; rest: string[] } {
  const options: CliOptions = {};
  const rest: string[] = [];
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    switch (arg) {
      case "--output": {
        const value = args[++i];
        if (value) options.output = value;
        break;
      }
      case "--page-size":
      case "--pageSize": {
        const value = Number(args[++i]);
        if (Number.isFinite(value)) options.pageSize = value;
        break;
      }
      case "--type": {
        options.type = args[++i];
        break;
      }
      case "--tag": {
        options.tag = args[++i];
        break;
      }
      case "--status": {
        options.status = args[++i];
        break;
      }
      case "--timeout-ms": {
        const value = Number(args[++i]);
        if (Number.isFinite(value)) options.timeoutMs = value;
        break;
      }
      case "--smoke": {
        options.smoke = true;
        break;
      }
      case "--domain": {
        options.domain = args[++i];
        break;
      }
      case "--limit": {
        const value = Number(args[++i]);
        if (Number.isFinite(value)) options.limit = value;
        break;
      }
      case "--force": {
        options.force = true;
        break;
      }
      case "--name": {
        options.name = args[++i];
        break;
      }
      default:
        rest.push(arg);
    }
  }
  return { options, rest };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  if (args.length === 0 || args[0] === "--help" || args[0] === "-h" || args[0] === "help") {
    cmdHelp();
    return;
  }

  const [command, ...restArgs] = args;
  const { options, rest } = parseOptions(restArgs);

  switch (command) {
    case "config":
      cmdConfig();
      break;
    case "doctor":
      await cmdDoctor();
      break;
    case "mcp":
      cmdMcp();
      break;
    case "dql":
      await cmdDql(rest[0] ?? "", options);
      break;
    case "entities":
      await cmdEntities(options);
      break;
    case "problems":
      await cmdProblems(options);
      break;
    case "metrics":
      await cmdMetrics(options);
      break;
    case "api":
      await cmdApi(rest[0] ?? "", options);
      break;
    case "test":
      await cmdTest(options);
      break;
    case "token":
      await cmdToken();
      break;
    case "dtctl":
      await cmdDtctl(rest);
      break;

    // Gestión de Documentación y Knowledge Base
    case "docs": {
      const subCommand = rest[0];
      if (subCommand === "scrape") {
        await cmdDocsScrape(options);
      } else if (subCommand === "update") {
        await cmdDocsUpdate();
      } else if (subCommand === "search") {
        cmdDocsSearch(rest.slice(1).join(" ") || "", options);
      } else if (
        subCommand === "stats" ||
        subCommand === "count" ||
        subCommand === "total" ||
        subCommand === "status" ||
        subCommand === "details" ||
        subCommand === "info" ||
        !subCommand
      ) {
        cmdDocsStats(options);
      } else if (subCommand === "list") {
        cmdDocsList(options);
      } else {
        console.error(`Subcomando docs desconocido: ${subCommand}. Usa: stats | details | count | list | search | scrape | update`);
        process.exitCode = 1;
      }
      break;
    }

    // Desarrollo y Validación de Skills
    case "skill": {
      const subCommand = rest[0];
      if (subCommand === "create") {
        await cmdSkillCreate(rest.slice(1).join(" ") || "", options);
      } else if (subCommand === "validate") {
        cmdSkillValidate(rest[1] ?? "");
      } else if (subCommand === "list" || !subCommand) {
        cmdSkillList();
      } else {
        console.error(`Subcomando skill desconocido: ${subCommand}. Usa: create | validate | list`);
        process.exitCode = 1;
      }
      break;
    }

    default:
      console.error(`Comando desconocido: ${command}`);
      cmdHelp();
      process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exitCode = 1;
});