import { isNode } from "../env";
import { digest as digestManual } from "./sha256";
import { digest as digestNode } from "./sha256.node";

export const sha256Digest = isNode ? digestNode : digestManual;