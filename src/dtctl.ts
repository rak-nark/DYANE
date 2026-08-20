import { spawnSync } from "node:child_process";
import { homedir } from "node:os";
import { existsSync } from "node:fs";
import { join } from "node:path";
import type { DynatraceConfig } from "./config.js";
import { getAccessToken } from "./oauth.js";

function resolveDtctlBin(config: DynatraceConfig): string {
  if (config.dtctlBin && config.dtctlBin !== "dtctl") return config.dtctlBin;
  const defaultPath = join(homedir(), "AppData", "Local", "dtctl", "dtctl.exe");
  if (existsSync(defaultPath)) return defaultPath;
  return "dtctl";
}

export interface DtctlCheck {
  installed: boolean;
  version?: string;
  error?: string;
  bin?: string;
}

export function checkDtctl(config: DynatraceConfig): DtctlCheck {
  const bin = resolveDtctlBin(config);
  const result = spawnSync(bin, ["version"], {
    shell: false,
    encoding: "utf8",
  });
  if (result.error) {
    return { installed: false, error: result.error.message, bin };
  }
  const version = (result.stdout ?? "").trim() || (result.stderr ?? "").trim();
  return { installed: true, version, bin };
}

export async function runDtctl(
  config: DynatraceConfig,
  args: string[],
  options: { env?: Record<string, string> } = {},
): Promise<number> {
  const bin = resolveDtctlBin(config);
  const childEnv: Record<string, string> = {
    ...process.env,
    DT_ENVIRONMENT_URL: config.environmentUrl,
  };
  if (config.platformToken) {
    childEnv.DT_API_TOKEN = config.platformToken;
  } else if (config.oauthClientId) {
    try {
      childEnv.DT_API_TOKEN = await getAccessToken(config);
    } catch (err) {
      console.error(`No se pudo obtener access token OAuth: ${(err as Error).message}`);
      return 1;
    }
  }
  Object.assign(childEnv, options.env ?? {});

  const result = spawnSync(bin, args, {
    stdio: "inherit",
    shell: false,
    env: childEnv,
  });

  if (result.error) {
    console.error(
      `No se pudo ejecutar '${bin}'. Instálalo o configura DTCTL_BIN en .env.`,
    );
    console.error(result.error.message);
    return 1;
  }
  return result.status ?? 0;
}