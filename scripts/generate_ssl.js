import { execa } from "execa";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, "..");
const nginxDir = join(rootDir, "nginx");

export async function generateSSL() {
  try {
    // Check if openssl is available
    try {
      await execa("openssl", ["version"], { stdio: "pipe" });
    } catch (error) {
      throw new Error(
        "OpenSSL is not installed or not available in PATH. " +
          "Please install OpenSSL to generate SSL certificates."
      );
    }

    // Generate SSL certificate
    await execa(
      "openssl",
      [
        "req",
        "-x509",
        "-nodes",
        "-days",
        "365",
        "-newkey",
        "rsa:2048",
        "-keyout",
        "./site.key",
        "-out",
        "./site.crt",
        "-config",
        "./ssl_query.conf",
      ],
      {
        cwd: nginxDir,
        stdio: "inherit",
      }
    );

    console.log("SSL certificates generated successfully!");
  } catch (error) {
    console.error("Error generating SSL certificates:", error.message);
    throw error;
  }
}

if (process.argv[1] && process.argv[1].endsWith("generate_ssl.js")) {
  generateSSL().catch(console.error);
}
